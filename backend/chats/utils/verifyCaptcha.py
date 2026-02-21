import os
import requests


def verifyCaptcha(token: str) -> bool:
    secret_key = os.environ.get("RECAPTCHA_SECRET_KEY")

    if not secret_key:
        raise ValueError("RECAPTCHA_SECRET_KEY is not configured")

    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": secret_key,
                "response": token,
            },
            timeout=5
        )

        result = response.json()
        return result.get("success", False)

    except requests.RequestException:
        return False
