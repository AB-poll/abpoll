from flask import Blueprint, current_app

from abpoll.extensions import db
from abpoll.blueprints.user.models import User
from abpoll.blueprints.post.models import Post
from flask import make_response, request, render_template
from urllib.parse import urlparse

sitemap = Blueprint("sitemap", __name__, template_folder="templates")


@sitemap.route("/sitemap")
@sitemap.route("/sitemap/")
@sitemap.route("/sitemap.xml")
def new_sitemap():
    """
        Route to dynamically generate a sitemap of your website/application.
        lastmod and priority tags omitted on static pages.
        lastmod included on dynamic content such as blog posts.
    """

    host_components = urlparse(request.host_url)
    host_base = host_components.scheme + "://" + host_components.netloc

    # Static routes with static content
    static_urls = list()
    for rule in current_app.url_map.iter_rules():
        if not str(rule).startswith("/admin") \
                and not str(rule).startswith("/my-account") \
                and not str(rule).startswith("/v1") \
                and not str(rule).startswith("/login/") \
                and not str(rule).startswith("/util") \
                and not str(rule).startswith("/stripe_webhook"):

            if "GET" in rule.methods and len(rule.arguments) == 0:
                url = {
                    "loc": f"{host_base}{str(rule)}"
                }
                static_urls.append(url)

    # Dynamic routes with dynamic content
    dynamic_urls = list()
    uploaded_posts = db.session.query(Post).all()
    for post in uploaded_posts:
        url = {
            "loc": f"{host_base}/p/{post.id}",
            "lastmod": post.created_on.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        dynamic_urls.append(url)

    users = db.session.query(User).all()
    for user in users:
        url = {
            "loc": f"{host_base}/u/{user.username}",
            "lastmod": user.updated_on.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        dynamic_urls.append(url)

    xml_sitemap = render_template("sitemap/sitemap.xml", static_urls=static_urls, dynamic_urls=dynamic_urls,
                                  host_base=host_base)
    response = make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"

    return response
