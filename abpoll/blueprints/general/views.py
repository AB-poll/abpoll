from flask import (
    render_template,
    url_for,
    request,
    Blueprint,
    session,
)
from flask_login import current_user
from sqlalchemy import text, and_
from lib.util_json import render_json
import html

from abpoll.blueprints.post.models import Post, PostViewed

from abpoll.extensions import db
from abpoll.initializers import redis


general = Blueprint("general", __name__, template_folder="templates")
letters = 'abcdef'


@general.get("/up")
def up():
    redis.ping()
    db.engine.execute("SELECT 1")
    return ""


@general.route("/")
def home():
    # users to recommend

    return render_template("general/general-home.html")


@general.route("/infinite_scroll_api/page/<int:page>", methods=["POST"])
def infinite_scroll_api(page):
    posts = Post.recommend_random_posts()
    return render_json(200, [post.serialize for post in posts])


@general.route("/number_of_pages", methods=["POST"])
def number_of_pages():
    page = 1
    page_numbers = Post.query.filter(Post.status == "immune").order_by(Post.created_on.desc()).paginate(page, 2,
                                                                                                        True).pages
    return render_json(200, page_numbers)


@general.route("/explore", defaults={"page": 1})
@general.route("/explore/page/<int:page>")
def explore(page):
    search_query = request.args.get("s", text(""))
    products = Post.query.filter(Post.search(search_query)).paginate(page, 16, True)

    return render_template("general/general-explore.html", products=products)


@general.route("/terms")
def terms():
    return render_template("general/general-terms.html")


@general.route("/privacy")
def privacy():
    return render_template("general/general-privacy.html")


@general.route("/careers")
def careers():
    title = "careers page is coming soon as we expand the organisation at a steady pace"
    tags = "Careers in tech, coming soon, startup, social bid"
    description = (
        "If working for a startup is something you are looking forward to, "
        "stay tuned as we expand we will need a bigger and better team, follow us on twitter "
        '<a target="_blank" href="https://twitter.com/abpoll"  class="text-success">@abpoll</a> to receive updates.'
    )
    coming_soon = "Coming Soon..."
    return render_template(
        "errors/500.html",
        title=title,
        tags=tags,
        description=description,
        coming_soon=coming_soon,
    )
