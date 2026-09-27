"""Feature extraction. Uses librosa when installed; otherwise a tiny numpy-free fallback."""

from __future__ import annotations

import io
import math
import struct
import wave


def features_from_bytes(audio_bytes: bytes) -> list[float]:
    try:
        import librosa  # type: ignore
        import numpy as np  # type: ignore

        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        f0 = librosa.yin(y, fmin=50, fmax=400, sr=sr)
        flat = librosa.feature.spectral_flatness(y=y)
        jitter = float(np.nanstd(f0) / (np.nanmean(f0) + 1e-6))
        return [
            float(mfcc.mean()),
            float(mfcc.std()),
            jitter,
            float(flat.mean()),
            float(np.mean(np.abs(np.diff(y)))),
        ]
    except Exception:
        return _wav_fallback(audio_bytes)


def _wav_fallback(audio_bytes: bytes) -> list[float]:
    try:
        with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
            frames = wf.readframes(wf.getnframes())
            n = max(len(frames) // 2, 1)
            samples = struct.unpack("<" + "h" * n, frames[: n * 2])
    except Exception:
        samples = [b - 128 for b in audio_bytes[:2000]]
    if not samples:
        return [0.0, 0.0, 0.0, 0.0, 0.0]
    mean = sum(samples) / len(samples)
    var = sum((s - mean) ** 2 for s in samples) / len(samples)
    std = math.sqrt(var)
    diffs = [abs(samples[i] - samples[i - 1]) for i in range(1, len(samples))]
    jitter = sum(diffs) / max(len(diffs), 1)
    return [mean, std, jitter, std / (abs(mean) + 1e-6), diffs[0] if diffs else 0.0]
