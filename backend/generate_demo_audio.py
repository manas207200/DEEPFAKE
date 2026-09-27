"""Write three short WAV clips for Demo Mode. Stdlib only — no extra packages."""

from __future__ import annotations

import math
import os
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "assets" / "demo_audio"
SR = 16000
DURATION = 6


def write_tone(path: Path, freqs: list[float], wobble: float) -> None:
    n = SR * DURATION
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        frames = bytearray()
        for i in range(n):
            t = i / SR
            sample = 0.0
            for f in freqs:
                sample += math.sin(2 * math.pi * (f + wobble * math.sin(2 * math.pi * 3 * t)) * t)
            sample = sample / max(len(freqs), 1)
            amp = 0.25 if "clone" in path.name else 0.35
            val = int(max(-1, min(1, sample * amp)) * 32767)
            frames += struct.pack("<h", val)
        wf.writeframes(frames)


def main() -> None:
    write_tone(ROOT / "clean_call.wav", [180, 240, 310], wobble=8)
    write_tone(ROOT / "scam_script_call.wav", [140, 220], wobble=18)
    write_tone(ROOT / "voice_clone_sample.wav", [190, 380], wobble=0.4)
    print("Wrote", os.listdir(ROOT))


if __name__ == "__main__":
    main()
