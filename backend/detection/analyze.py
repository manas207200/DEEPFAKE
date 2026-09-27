"""
Single API-contract function:

    analyze_audio_chunk(audio_bytes) -> {risk_level, confidence, matched_pattern, detection_type}

Demo clips return consistent, escalating results so a recording is repeatable.
Live audio uses a keyword/rule engine plus optional librosa + sklearn models.
Swap in the trained classifier without changing the dict keys.
"""

from __future__ import annotations

from detection.keywords import match_script

DEMO = {
    "clean_call": [
        {"risk_level": "low", "confidence": 0.18, "matched_pattern": "", "detection_type": "none"},
        {"risk_level": "low", "confidence": 0.22, "matched_pattern": "", "detection_type": "none"},
    ],
    "scam_script_call": [
        {"risk_level": "low", "confidence": 0.31, "matched_pattern": "", "detection_type": "none"},
        {
            "risk_level": "medium",
            "confidence": 0.62,
            "matched_pattern": "do not disconnect the call",
            "detection_type": "scam_script",
        },
        {
            "risk_level": "high",
            "confidence": 0.91,
            "matched_pattern": "non-bailable warrant",
            "detection_type": "scam_script",
        },
    ],
    "voice_clone_sample": [
        {"risk_level": "medium", "confidence": 0.58, "matched_pattern": "pitch over-consistency", "detection_type": "voice_clone"},
        {
            "risk_level": "high",
            "confidence": 0.88,
            "matched_pattern": "synthetic vocoder artifacts",
            "detection_type": "voice_clone",
        },
    ],
}


def analyze_audio_chunk(
    audio_bytes: bytes,
    demo_clip: str | None = None,
    chunk_index: int = 0,
) -> dict:
    if demo_clip and demo_clip in DEMO:
        steps = DEMO[demo_clip]
        return dict(steps[min(chunk_index, len(steps) - 1)])

    transcript = _maybe_transcript(audio_bytes)
    phrase = match_script(transcript) if transcript else None
    clone = _voice_clone_score(audio_bytes)

    if phrase:
        return {
            "risk_level": "high",
            "confidence": 0.86,
            "matched_pattern": phrase,
            "detection_type": "scam_script",
        }
    if clone >= 0.7:
        return {
            "risk_level": "high",
            "confidence": float(clone),
            "matched_pattern": "AI voice-clone signature",
            "detection_type": "voice_clone",
        }
    if clone >= 0.45:
        return {
            "risk_level": "medium",
            "confidence": float(clone),
            "matched_pattern": "unusual pitch stability",
            "detection_type": "voice_clone",
        }
    return {
        "risk_level": "low",
        "confidence": 0.2,
        "matched_pattern": "",
        "detection_type": "none",
    }


def _maybe_transcript(audio_bytes: bytes) -> str:
    # No STT package is installed. Live mic therefore relies on acoustic features.
    # Demo Mode supplies deterministic patterns via demo_clip.
    return ""


def _voice_clone_score(audio_bytes: bytes) -> float:
    try:
        from detection.classifier import score_bytes

        return score_bytes(audio_bytes)
    except Exception:
        if not audio_bytes:
            return 0.15
        # Cheap energy proxy so live mode still returns a number without librosa.
        mean = sum(audio_bytes) / max(len(audio_bytes), 1)
        return min(0.4, mean / 255.0)
