"""
FastAPI detection service for DEEPFAKE.

Uses the stdlib sqlite3 driver so local demo does not require PostgreSQL.
Set DATABASE_URL=postgresql://... later if you want the same schema on Postgres.
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from detection import analyze_audio_chunk
from seed import SEED_NUMBERS

DB_PATH = Path(__file__).resolve().parent / "scam_numbers.db"


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def db():
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scam_numbers (
                phone_number TEXT PRIMARY KEY,
                report_count INTEGER NOT NULL DEFAULT 0,
                category TEXT NOT NULL,
                last_reported TEXT
            )
            """
        )
        existing = conn.execute("SELECT COUNT(*) AS n FROM scam_numbers").fetchone()["n"]
        if existing == 0:
            conn.executemany(
                """
                INSERT INTO scam_numbers (phone_number, report_count, category, last_reported)
                VALUES (?, ?, ?, ?)
                """,
                SEED_NUMBERS,
            )


app = FastAPI(title="DEEPFAKE API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NumberIn(BaseModel):
    phone_number: str


class ReportIn(BaseModel):
    phone_number: str
    category: str = "Other"
    note: str | None = None


class AlertIn(BaseModel):
    contact_name: str
    contact_phone: str
    caller_number: str
    risk_level: str
    matched_pattern: str = ""


class AnalyzeIn(BaseModel):
    audio_base64: str | None = None
    demo_clip: str | None = None
    chunk_index: int = 0


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/check-number")
def check_number(body: NumberIn) -> dict:
    digits = "".join(ch for ch in body.phone_number if ch.isdigit())
    with db() as conn:
        row = conn.execute(
            "SELECT * FROM scam_numbers WHERE replace(phone_number, '+', '') LIKE ?",
            (f"%{digits[-10:]}%",),
        ).fetchone()
    if not row:
        return {"is_flagged": False, "report_count": 0, "category": "Unknown"}
    return {
        "is_flagged": True,
        "report_count": row["report_count"],
        "category": row["category"],
    }


@app.post("/analyze-audio")
def analyze_audio(body: AnalyzeIn) -> dict:
    audio_bytes = b""
    if body.audio_base64:
        import base64

        audio_bytes = base64.b64decode(body.audio_base64)
    return analyze_audio_chunk(
        audio_bytes,
        demo_clip=body.demo_clip,
        chunk_index=body.chunk_index,
    )


@app.post("/alert-contact")
def alert_contact(body: AlertIn) -> dict:
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    text = (
        f"DEEPFAKE alert for {body.contact_name}: possible scam call from "
        f"{body.caller_number} ({body.risk_level}). Pattern: {body.matched_pattern or 'n/a'}"
    )
    if not (sid and token and from_number):
        print("[alert-contact mocked]", text)
        return {"sent": False, "message": "Trusted contact alert queued (Twilio not configured)."}
    try:
        from twilio.rest import Client  # type: ignore

        client = Client(sid, token)
        client.messages.create(to=body.contact_phone, from_=from_number, body=text)
        return {"sent": True, "message": f"SMS sent to {body.contact_name}."}
    except Exception as exc:  # pragma: no cover
        print("[alert-contact error]", exc)
        return {"sent": False, "message": "Twilio send failed; alert was logged on the server."}


@app.get("/golden-hour-info")
def golden_hour_info() -> dict:
    return {
        "helpline": "1930",
        "helpline_label": "National Cybercrime Helpline 1930",
        "complaint_url": "https://cybercrime.gov.in",
        "golden_hour_minutes": 60,
        "copy": (
            "If money was already sent, the first hour is critical. Call 1930 now and file a "
            "complaint at cybercrime.gov.in so banks can try to freeze the transfer."
        ),
    }


@app.post("/report-number")
def report_number(body: ReportIn) -> dict:
    digits = "".join(ch for ch in body.phone_number if ch.isdigit())
    if len(digits) < 8:
        raise HTTPException(400, "Enter a valid phone number")
    phone = body.phone_number.strip()
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    with db() as conn:
        row = conn.execute(
            "SELECT * FROM scam_numbers WHERE phone_number = ? OR replace(phone_number, '+', '') LIKE ?",
            (phone, f"%{digits[-10:]}%"),
        ).fetchone()
        if row:
            conn.execute(
                """
                UPDATE scam_numbers
                SET report_count = report_count + 1, category = ?, last_reported = ?
                WHERE phone_number = ?
                """,
                (body.category, now, row["phone_number"]),
            )
            count = row["report_count"] + 1
        else:
            conn.execute(
                """
                INSERT INTO scam_numbers (phone_number, report_count, category, last_reported)
                VALUES (?, 1, ?, ?)
                """,
                (phone, body.category, now),
            )
            count = 1
    return {"ok": True, "report_count": count}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
