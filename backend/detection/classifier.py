"""
Optional acoustic classifier. Trains in minutes on synthetic features if ASVspoof
files are not present. Does not change the /analyze-audio contract.
"""

from __future__ import annotations

from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "voice_clone_model.joblib"


def score_bytes(audio_bytes: bytes) -> float:
    if not audio_bytes:
        return 0.12
    try:
        import joblib  # type: ignore
        import numpy as np  # type: ignore

        from detection.features import features_from_bytes

        if not MODEL_PATH.exists():
            return _heuristic(audio_bytes)
        model = joblib.load(MODEL_PATH)
        feats = features_from_bytes(audio_bytes)
        proba = model.predict_proba([feats])[0]
        # class 1 = spoof / clone
        return float(proba[1])
    except Exception:
        return _heuristic(audio_bytes)


def _heuristic(audio_bytes: bytes) -> float:
    sample = audio_bytes[:4000]
    if not sample:
        return 0.12
    diffs = [abs(sample[i] - sample[i - 1]) for i in range(1, len(sample))]
    jitter = sum(diffs) / len(diffs)
    # Very flat PCM often looks more synthetic in this toy heuristic.
    return max(0.05, min(0.95, 1.0 - jitter / 40.0))
