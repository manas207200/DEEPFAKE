# DEEPFAKE

**AI-Powered Voice Scam & Deepfake Call Detector**

A privacy-preserving mobile app that protects users from voice-based scam calls and AI-cloned voice fraud.

## Problem Statement

India lost approximately Rs 22,495 crore to cyber fraud in 2025, with complaints rising 24% to 2.81 million cases. Digital arrest scams alone accounted for over 30,000 complaints and an estimated Rs 3,000 crore in losses in a single year. Victims are disproportionately elderly, educated individuals who are isolated from family and manipulated through sustained psychological pressure over phone and video calls.

Existing solutions only address who is calling. Nobody addresses what is being said or whether the voice itself is real.

## Our Solution

DEEPFAKE is a two-layer real-time defense system. Pre-Pickup Screening checks incoming numbers against a known-scam-number database before the user even answers. Post-Pickup Safe Call Mode lets the user activate real-time, on-device analysis that listens for known scam-script patterns and AI-generated or cloned voice signatures.

The app never auto-terminates a call. It always surfaces a graduated warning and lets the human make the final decision, with an option to silently alert a trusted family contact.

## Why Not Just Record the Call

Native call-audio interception is not technically or legally buildable on iOS or Android, since both platforms block third-party apps from accessing raw call audio. The mobile app uses ambient microphone listening during speaker-mode calls instead, which relies on a standard microphone permission rather than any call-audio API.

This is also why on-device, session-only processing was chosen. Audio is never stored, and only a derived confidence score persists. Under India's DPDP Act 2023, voice is classified as sensitive biometric data.

## Features

Number Screening gives a pre-pickup risk badge based on a flagged-number database. Safe Call Mode performs real-time audio analysis during an active call. Graduated Risk Alerts never auto-block and always keep a human in the loop. Trusted Contact Alerts send an SMS to a family member on high risk. Voice-Clone Detection shows a distinct alert when the voice itself looks synthetic. Golden Hour Escalation links to India's national cybercrime helpline. Demo Mode plays pre-loaded sample clips for reliable demonstration.

## Tech Stack

The mobile client is built with React Native and Expo in TypeScript, using React Navigation, NativeWind for styling, expo-audio for microphone capture, expo-file-system for temporary audio handling, and expo-sqlite for local history. The backend is FastAPI with PostgreSQL for the scam-number registry. The detection core uses librosa for feature extraction, a rule engine for scam-script matching, and a lightweight classifier trained on ASVspoof and WaveFake datasets for voice-clone detection. Twilio handles family SMS alerts.

## Privacy and Legal Design

All audio processing happens on-device or within a single session. Only derived risk metadata is retained, never raw audio. Safe Call Mode is always explicitly activated by the user. This architecture aligns with India's DPDP Act 2023.

## Known Limitations

Native call-audio interception is not attempted since it is platform-restricted. The ML classifier is trained on a small demo-scale dataset for fast iteration. Pre-pickup number screening uses a small seeded demo dataset rather than a live national registry.

## Team

Add team member names here.
