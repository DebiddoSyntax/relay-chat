from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import binascii
from os import urandom
from cryptography.exceptions import InvalidTag

key_hex = os.environ.get("SERVER_AES_KEY")
if not key_hex:
    raise ValueError("SERVER_AES_KEY not set in environment variables")

SERVER_AES_KEY = binascii.unhexlify(key_hex) 
aesgcm = AESGCM(SERVER_AES_KEY)

def encrypt_message(content):
    try:
        iv = urandom(12)
        ciphertext = aesgcm.encrypt(iv, content.encode(), None)
        return binascii.hexlify(ciphertext).decode(), binascii.hexlify(iv).decode()
    except InvalidTag:
            raise ValueError("Decryption failed: invalid key or tampered data")
    except (binascii.Error, ValueError) as e:
            raise ValueError(f"Invalid input format: {e}")