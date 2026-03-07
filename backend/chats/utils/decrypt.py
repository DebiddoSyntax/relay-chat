import os
import binascii
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

AES_KEY = binascii.unhexlify(os.environ["SERVER_AES_KEY"])
if not AES_KEY:
    raise ValueError("SERVER_AES_KEY not set in environment variables")

aesgcm = AESGCM(AES_KEY)

def decrypt_message(ciphertext_hex, iv_hex):
    try:
        ciphertext = binascii.unhexlify(ciphertext_hex)
        iv = binascii.unhexlify(iv_hex)
        plaintext = aesgcm.decrypt(iv, ciphertext, None)
        return plaintext.decode()
    except InvalidTag:
            raise ValueError("Decryption failed: invalid key or tampered data")
    except (binascii.Error, ValueError) as e:
            raise ValueError(f"Invalid input format: {e}")