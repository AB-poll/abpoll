from flask import (
    render_template,
    redirect,
    url_for,
    flash,
    request,
    abort,
    Blueprint,
)
from flask_login import current_user

import datetime
from lib.util_datetime import convert_to_utc

from lib.upload_files import allowed_image_file, random_image_background
from lib.util_post import (
    random_post_id,
    return_cv2_image,
    create_array_from_argument,
    save_image_to_server,
    vertical_attach_images
)

from abpoll.extensions import db
from abpoll.blueprints.post.models import Post
from abpoll.blueprints.user.models import User
from abpoll.blueprints.predict.models import Event
import numpy as np

new_post = Blueprint("new_post", __name__, template_folder="templates")


@new_post.route("/new-post")
def upload():
    if not current_user.is_active:
        flash("You need to login to create new polls", "warning")
        return redirect(f"{url_for('user.register')}?next=%2fnew-post")
    return render_template("new_post/new-post.html")


@new_post.route("/new-post", methods=["POST"])
def upload_post():
    if not current_user.is_active:
        flash("You need to login to create new polls", "warning")
        return redirect(f"{url_for('user.login')}?next=%2fnew-post")

    topic = request.values.get("users-list-tags", default=None)
    a_votes = request.values.get("a_votes", default=0, type=int)
    b_votes = request.values.get("b_votes", default=0, type=int)

    title = request.values.get("title")
    options = eval(request.values.get('options'))
    post_format = request.values.get('format')

    selected_option = request.values.get('selected_option')
    if selected_option is None or selected_option == "":
        selected_option = None

    tags_array = create_array_from_argument(request.values.get("tags"))
    accessibility = request.values.get("accessibility")

    if title is None or post_format is None or (post_format == 'Poll' and len(options) < 2) or (
            post_format == 'Trivia' and len(options) < 2):
        flash("Please change the default options!", "danger")
        return render_template("new_post/new-post.html")

    if topic is not None:
        username = str(topic).strip('[]{}"').split(",")[-1].split('":"')[-1]
        author = db.session.query(User).filter(User.username == username).first()
        if author is None:
            author = current_user
    else:
        author = current_user

    image_1 = request.files['image_1_id']
    image_2 = request.files['image_2_id']

    if image_2 is not None and image_2.filename != "":
        image_1_cv2 = return_cv2_image(image_1)
        image_2_cv2 = return_cv2_image(image_2)

        image_1_output = vertical_attach_images([image_1_cv2, image_2_cv2])
        image_2_output = "present"

    elif image_1 is not None and image_1.filename != "":
        # Saving the post
        image_1_output = save_image_to_server(image_1)
        image_2_output = None
    else:
        if author.back_ground != "/images/account/bg.png":
            image_1_output = author.back_ground
            image_2_output = "present"
        else:
            image_1_output = random_image_background(1)[0]
            image_2_output = "present"

    post_id = random_post_id()

    def create_post():
        if post_format == 'Trivia':
            save_post = Post(
                id=post_id,
                author_id=author.id,
                title=title,
                post_format=post_format,
                options=options,
                tags=tags_array,
                selected_option=selected_option,
                options_vote=np.zeros(len(options)).astype(int).tolist(),
                accessibility=accessibility,
                image_1=image_1_output,
                image_2=image_2_output,
            )
        else:
            save_post = Post(
                id=post_id,
                author_id=author.id,
                title=title,
                post_format='Poll',
                a_text=options[0],
                b_text=options[1],
                tags=tags_array,
                accessibility=accessibility,
                options_vote=np.zeros(2).astype(int).tolist(),
                image_1=image_1_output,
                image_2=image_2_output,
            )
        save_post.save()

        event_end_date = request.values.get("event-end-time-input", default=None)
        if event_end_date is not None and event_end_date != "":
            auction_end_date = datetime.datetime.strptime(event_end_date, "%Y-%m-%dT%H:%M")
            local_timezone = request.values.get("event-end-time-timezone", "America/Chicago")
            event_aware_end_date = convert_to_utc(auction_end_date, local_timezone)

            new_event = Event(
                post_id=save_post.id,
                end_date=event_aware_end_date
            )
            new_event.save()

        if a_votes > 0:
            vote_list = save_post.options_vote
            vote_list[0] += a_votes
            vote_list[1] += b_votes

            save_post.options_vote = []
            save_post.save()

            save_post.options_vote = vote_list
            save_post.save()

    create_post()

    return redirect(url_for('post.post_page', post_id=post_id))
