"""
Train a tiny Logistic Regression model.

If ASVspoof 2021-DF / WaveFake files are not on disk, this generates a few thousand
synthetic feature vectors so training finishes in seconds. Point --real-dir at a
small labeled subset later; the saved model path stays the same.
"""

from __future__ import annotations

import argparse
import random
from pathlib import Path

from detection.classifier import MODEL_PATH


def synthetic_dataset(n: int = 3000):
    X = []
    y = []
    rng = random.Random(7)
    for i in range(n):
        fake = i % 2
        # real speech: higher jitter / less flat; spoof: smoother
        jitter = rng.uniform(0.02, 0.08) if fake else rng.uniform(0.08, 0.25)
        flat = rng.uniform(0.4, 0.9) if fake else rng.uniform(0.05, 0.35)
        mfcc_mean = rng.uniform(-20, 20)
        mfcc_std = rng.uniform(5, 15) if fake else rng.uniform(12, 30)
        energy_delta = rng.uniform(0.001, 0.01) if fake else rng.uniform(0.01, 0.05)
        X.append([mfcc_mean, mfcc_std, jitter, flat, energy_delta])
        y.append(fake)
    return X, y


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--real-dir", default="", help="Optional folder of labeled wavs (bonafide/ and spoof/)")
    args = parser.parse_args()

    try:
        import joblib  # type: ignore
        from sklearn.linear_model import LogisticRegression  # type: ignore
        from sklearn.model_selection import train_test_split  # type: ignore
        from sklearn.pipeline import make_pipeline  # type: ignore
        from sklearn.preprocessing import StandardScaler  # type: ignore
    except ImportError:
        print("scikit-learn and joblib are not installed. See README before training.")
        return

    X, y = synthetic_dataset()
    if args.real_dir:
        print("Real-dir loading is a stub: add a few thousand ASVspoof files into bonafide/ and spoof/.")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
    model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=200))
    model.fit(X_train, y_train)
    acc = model.score(X_test, y_test)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved {MODEL_PATH}  holdout_acc={acc:.3f}")


if __name__ == "__main__":
    main()
