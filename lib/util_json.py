from flask import jsonify
from flask_restful import reqparse


def render_json(status, *args, **kwargs):
    """
    Return a JSON response.

    Example usage:
      render_json(404, {'error': 'Discount code not found.'})
      render_json(200, {'data': coupon.to_json()})

    :param status: HTTP status code
    :type status: int
    :param args:
    :param kwargs:
    :return: Flask response
    """
    response = jsonify(*args, **kwargs)
    response.status_code = status

    return response


def parse_arg_from_requests(arg, **kwargs):
    parse = reqparse.RequestParser()
    parse.add_argument(arg, **kwargs)
    args = parse.parse_args()
    return args[arg]
