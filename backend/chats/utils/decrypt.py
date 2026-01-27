import os
import binascii
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

AES_KEY = binascii.unhexlify(os.environ["SERVER_AES_KEY"])
aesgcm = AESGCM(AES_KEY)

def decrypt_message(ciphertext_hex, iv_hex):
    ciphertext = binascii.unhexlify(ciphertext_hex)
    iv = binascii.unhexlify(iv_hex)
    plaintext = aesgcm.decrypt(iv, ciphertext, None)
    return plaintext.decode()
