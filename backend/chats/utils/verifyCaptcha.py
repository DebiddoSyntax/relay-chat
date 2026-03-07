import os
import requests


def verifyCaptcha(token: str, expected_action: str | None = None, threshold: float = 0.5):
    secret_key = os.environ.get("RECAPTCHA_V3_SECRET_KEY") if expected_action else os.environ.get("RECAPTCHA_V2_SECRET_KEY")

    if not secret_key:
        raise ValueError("RECAPTCHA_SECRET_KEY is not configured")

    try:
        response = requests.post( "https://www.google.com/recaptcha/api/siteverify",  data={ "secret": secret_key, "response": token, }, timeout=5)

        result = response.json()
        print("captcha result:", result)

        if not result.get("success"):
            return False

        if "score" in result:
            if result.get("score", 0) < threshold:
                return False

            if expected_action and result.get("action") != expected_action:
                return False

        return True

    except requests.RequestException:
        return False