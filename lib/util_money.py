def cents_to_dollars(cents):
    """
    Convert cents to dollars.

    :param cents: Amount in cents
    :type cents: int
    :return: float
    """
    if not cents:
        return 0

    return round(cents / 100.0, 2)


def format_currency(amount, convert_to_dollars=True):
    """
    Pad currency with 2 decimals and commas,
    optionally convert cents to dollars.

    :param amount: Amount in cents or dollars
    :type amount: int or float
    :param convert_to_dollars: Convert cents to dollars
    :type convert_to_dollars: bool
    :return: str
    """
    if convert_to_dollars:
        amount = cents_to_dollars(amount)

    return "{:,.2f}".format(amount)


def dollars_to_cents(dollars):
    """
    Convert dollars to cents.

    :param dollars: Amount in dollars
    :type dollars: float
    :return: int
    """
    if not dollars:
        return 0

    return int(dollars * 100)
