from flask import Blueprint
from abpoll.extensions import csrf
import hmac
from flask import jsonify
from flask import request
import json

from lib.util_json import render_json, parse_arg_from_requests

from config.settings import GITHUB_SECRET
from cmd_deploy import __do_deploy

auto_cd = Blueprint(
    "auto_cd",
    __name__,
)


@auto_cd.route("/util/post-receive", methods=["POST"])
@csrf.exempt
def deploy():
    signature = request.headers.get('X-Hub-Signature')
    sha, signature = signature.split('=')
    secret = str.encode(GITHUB_SECRET)
    hash_hex = hmac.new(secret, request.data, digestmod='sha1').hexdigest()

    if not hmac.compare_digest(hash_hex, signature):
        print("Deployment failed")
        return json.dumps({"success": 1, "message": "accessKey error"}), 500
    deploy_result = {}
    print("start deployment")
    deploy_result['success'], deploy_result['message'] = __do_deploy()
    print("deployment succeeded")
    status_code = 500 if deploy_result['success'] == 1 else 200
    return jsonify(deploy_result), status_code
