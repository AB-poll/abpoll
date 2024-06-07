import random
import string

from lib.util_sqlalchemy import username_taken

characters = list(string.ascii_letters + string.digits + "!@#$%^&*()")


def generate_random_password(length: int):
    """
    length: enter the length of the password
    """

    # shuffling the characters
    random.shuffle(characters)

    # picking random characters from the list
    password = []
    for i in range(length):
        password.append(random.choice(characters))

    # shuffling the resultant password
    random.shuffle(password)

    # converting the list to string
    return "".join(password)


def appropriate_username(username):
    """
    username: array of usernames
    """
    with open('lib/username_assets/blacklist.txt', 'r') as inline:
        censored = inline.read().strip(' \n').split('\n')

    for x in username:
        if x in censored:
            return True
    return False


def generate_usernames(num: int):
    """
    num: number of usernames to generate
    """
    # read word lists
    with open('lib/username_assets/nouns.txt', 'r') as infile:
        nouns = infile.read().strip(' \n').split('\n')
    with open('lib/username_assets/adjectives.txt', 'r') as infile:
        adjectives = infile.read().strip(' \n').split('\n')
    # generate usernames
    for i in range(num):
        # construct username
        word1 = random.choice(adjectives)
        word2 = random.choice(nouns)
        # check if word2 is censored
        if appropriate_username([word2]):
            i -= 1
            continue
        # else make and print the username
        # capitalize first letter
        word1 = word1.title()
        word2 = word2.title()
        username = '{}{}{}'.format(word1, word2, random.randint(1, 99))

        # success
        if username_taken(username=username.lower()):
            generate_usernames(num=num)
        return username.lower(), username
