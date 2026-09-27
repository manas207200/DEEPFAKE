ENGLISH_PHRASES = [
    "non-bailable warrant",
    "digital arrest",
    "cbi officer",
    "ed officer",
    "narcotics bureau",
    "freeze your account",
    "aadhaar is linked to a crime",
    "do not disconnect the call",
    "video conference with the judge",
    "kyc expired",
    "gift card",
    "crypto wallet",
    "share otp",
    "remote access",
    "teamviewer",
    "anydesk",
]

HINDI_PHRASES = [
    "गिरफ्तारी वारंट",
    "डिजिटल अरेस्ट",
    "सीबीआई",
    "प्रवर्तन निदेशालय",
    "खाता फ्रीज",
    "कॉल मत काटो",
    "जज के साथ वीडियो",
    "ओटीपी बताओ",
    "केवाईसी",
]


def match_script(transcript: str) -> str | None:
    text = transcript.lower()
    for phrase in ENGLISH_PHRASES + HINDI_PHRASES:
        if phrase.lower() in text:
            return phrase
    return None
