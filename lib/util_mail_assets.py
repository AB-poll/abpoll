import math
import random


def generate_otp(otp_length):
    digits = "0123456789"
    output = ""
    for x in range(otp_length):
        output += digits[math.floor(random.random() * 10)]
    return output
