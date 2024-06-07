from flask import Blueprint, redirect, request, flash, url_for, render_template
from flask_login import login_required, current_user
from sqlalchemy import or_, text, func, and_, extract, desc

from abpoll.blueprints.predict.models import Event, Predict
from abpoll.blueprints.admin.models import Dashboard
from abpoll.blueprints.user.decorators import role_required
from abpoll.blueprints.billing.decorators import handle_stripe_exceptions
from abpoll.blueprints.billing.models.coupon import Coupon
from abpoll.blueprints.billing.models.subscription import Subscription
from abpoll.blueprints.post.models import Post, PostAVote, PostBVote, PostViewed, PostComment
from abpoll.blueprints.user.models import User
from abpoll.blueprints.message.models import PrivateChatMeta
from abpoll.blueprints.admin.forms import (
    SearchForm,
    BulkDeleteForm,
    UserForm,
    RefundForm,
    UserCancelSubscriptionForm,
    CouponForm,
)

from lib.util_datetime import convert_to_utc
from lib.util_json import render_json, parse_arg_from_requests
from lib.util_post import (
    random_post_id,
    return_cv2_image,
    create_array_from_argument,
    save_image_to_server,
    vertical_attach_images
)
from lib.upload_files import delete_image_from_cloudflare
from abpoll.extensions import db

import datetime
import collections

admin = Blueprint("admin", __name__, template_folder="templates")


@admin.before_request
@login_required
@role_required("admin")
def before_request():
    """ Protect all the admin endpoints. """
    pass


@admin.route("/admin/dashboard")
def dashboard():
    group_and_count_users = Dashboard.group_and_count_users()
    group_and_count_posts = Dashboard.group_and_count_posts()
    group_and_count_votes = Dashboard.group_and_count_votes()
    group_and_count_comments = Dashboard.group_and_count_comments()
    topics = Dashboard.topics()

    return render_template(
        "admin/dashboard.html",
        group_and_count_users=group_and_count_users,
        group_and_count_posts=group_and_count_posts,
        group_and_count_votes=group_and_count_votes,
        group_and_count_comments=group_and_count_comments,
        topics=topics,
    )


@admin.route("/admin/posts")
def posts_review():
    posts = Post.query.filter(Post.status != "immune").order_by(Post.created_on.desc())
    # posts = Post.query.order_by(Post.created_on.desc())
    return render_template("admin/posts-review.html", posts=posts)


@admin.route("/admin/posts/edit", methods=['POST'])
def edit_posts():
    post_id = request.values.get("post_id")
    post_to_edit = Post.query.get(post_id)

    if post_to_edit is not None:
        # New Title
        title = request.values.get("title", None)
        if title is not None or title != "":
            post_to_edit.title = title

        # Voting Mechanisms
        post_to_edit.a_text = request.values.get("a_text")
        post_to_edit.b_text = request.values.get("b_text")

        status = request.values.get("status", None)
        if status is not None:
            post_to_edit.status = status

        # Image 1
        image_1 = request.values.get("image_1_id")
        if image_1 != post_to_edit.image_1:
            # Delete Stored Image
            delete_image_from_cloudflare(post_to_edit.image_1)
            # Save the new image
            post_to_edit.image_1 = request.values.get("image_1_id")

        # Image 2
        image_2 = request.values.get("image_2_id")
        if image_2 is not None and image_2 != "":
            post_to_edit.image_2 = image_2
        else:
            post_to_edit.image_2 = None

        # Create tags
        post_to_edit.tags = create_array_from_argument(request.values.get("tags"))
        post_to_edit.accessibility = request.values.get("accessibility")

        post_to_edit.save()

    return redirect(request.referrer)


@admin.route("/admin/posts/approve", methods=['POST'])
def approve_posts():
    approved_post_id = parse_arg_from_requests("post_id")
    if approved_post_id is not None:
        approved_post = Post.query.get(approved_post_id)
        approved_post.status = "immune"
        approved_post.save()

        return render_json(200)
    return render_json(500)


@admin.route("/admin/users", defaults={"page": 1})
@admin.route("/admin/users/page/<int:page>")
def users(page):
    search_form = SearchForm()
    bulk_form = BulkDeleteForm()

    paginated_users = (
        User.query.filter(User.search(request.args.get("q", text("")))).order_by(User.updated_on.desc()).paginate(page,
                                                                                                                  50,
                                                                                                                  True)
    )

    return render_template(
        "admin/user-table.html",
        form=search_form,
        bulk_form=bulk_form,
        users=paginated_users,
    )


@admin.route("/admin/comments", defaults={"page": 1})
@admin.route("/admin/comments/page/<int:page>")
def comments_route(page):
    paginated_comments = PostComment.query.filter(PostComment.search(request.args.get("s", text("")))).order_by(
        PostComment.created_on.desc()).paginate(page, 50, True)

    return render_template(
        "admin/comments.html",
        comments=paginated_comments,
    )


@admin.route("/admin/users/edit", methods=['POST'])
def edit_user():
    user_id = request.values.get("user_id")
    user_to_edit = User.query.get(user_id)
    if user_to_edit.role == "admin":
        return redirect(url_for('admin.users'))

    if user_to_edit is not None:
        # New Title
        display_username = request.values.get("username")
        email = request.values.get("email").lower()

        if email is not None and user_to_edit.email != email:
            user_object = db.session.query(User).filter(User.email == email).first()
            if user_object is None:
                user_to_edit.email = email
                from abpoll.blueprints.user.tasks import email_confirmation

                email_confirmation(email, current_user.username)
                user_to_edit.email_verified = False
            else:
                flash("A user with this email already exists", "danger")
                return redirect(url_for('admin.users'))

        if display_username is not None and display_username != user_to_edit.display_username():
            username = str(display_username).lower()
            if current_user.username != username:
                user_object_username = db.session.query(User).filter(User.username == username).first()
                if user_object_username is not None:
                    flash(f"The username '{username}' is already taken.", "danger")
                    return redirect(url_for('admin.users'))
                else:
                    user_to_edit.username = username
                    user_to_edit.display_name = display_username

        # Voting Mechanisms
        user_to_edit.description = request.values.get("description")
        user_to_edit.status = request.values.get("user_status")
        location = request.values.get("location")
        user_to_edit.location = None

        if location != "" or location is None:
            user_to_edit.location = location

        # Image 1
        image_1 = request.values.get("image_1_id")
        if image_1 != user_to_edit.profile_picture:
            if user_to_edit.profile_picture is not None and "https:/" not in user_to_edit.profile_picture:
                delete_image_from_cloudflare(user_to_edit.profile_picture)
            user_to_edit.profile_picture = image_1

        social_1_option = request.values.get("social_1_option")
        social_1_handle = request.values.get("social_1_handle")

        if len(social_1_handle) <= 1:
            user_to_edit.social_1_handle = None
            user_to_edit.social_1_link = "#"
        else:
            if social_1_option == "Twitter":
                social_1 = social_1_handle.replace("@", "")
                social_1_link = f"https://twitter.com/{social_1}"
                user_to_edit.social_1_option = "twitter"
                user_to_edit.social_1_link = social_1_link
                user_to_edit.social_1_handle = social_1
            if social_1_option == "Instagram":
                social_1 = social_1_handle.replace("@", "")
                social_1_link = f"https://instagram.com/{social_1}"
                user_to_edit.social_1_option = "instagram"
                user_to_edit.social_1_link = social_1_link
                user_to_edit.social_1_handle = social_1
            if social_1_option == "Twitch":
                social_1 = social_1_handle.replace("@", "")
                social_1_link = f"https://twitch.tv/{social_1}"
                user_to_edit.social_1_option = "twitch"
                user_to_edit.social_1_link = social_1_link
                user_to_edit.social_1_handle = social_1
            if social_1_option == "Youtube":
                user_to_edit.social_1_option = "youtube"
                user_to_edit.social_1_link = social_1_handle
                user_to_edit.social_1_handle = "My Youtube"
            if social_1_option == "Website":
                web_link = f'https://{((social_1_handle.replace("www.", "")).replace("https://", "")).replace("http://", "")}'
                user_to_edit.social_1_option = "globe"
                user_to_edit.social_1_link = web_link
                user_to_edit.social_1_handle = "My Website"

        social_2_option = request.values.get("social_2_option")
        social_2_handle = request.values.get("social_2_handle")

        if len(social_2_handle) <= 1:
            user_to_edit.social_2_handle = None
            user_to_edit.social_2_link = "#"
        else:
            if social_2_option == "Twitter":
                social_2 = social_1_handle.replace("@", "")
                social_2_link = f"https://twitter.com/{social_2}"
                user_to_edit.social_2_option = "twitter"
                user_to_edit.social_2_link = social_2_link
                user_to_edit.social_2_handle = social_2
            if social_2_option == "Instagram":
                social_2 = social_2_handle.replace("@", "")
                social_2_link = f"https://instagram.com/{social_2}"
                user_to_edit.social_2_option = "instagram"
                user_to_edit.social_2_link = social_2_link
                user_to_edit.social_2_handle = social_2
            if social_2_option == "Twitch":
                social_2 = social_2_handle.replace("@", "")
                social_2_link = f"https://twitch.tv/{social_2}"
                user_to_edit.social_2_option = "twitch"
                user_to_edit.social_2_link = social_2_link
                user_to_edit.social_2_handle = social_2
            if social_2_option == "Youtube":
                user_to_edit.social_2_option = "youtube"
                user_to_edit.social_2_link = social_2_handle
                user_to_edit.social_2_handle = "My Youtube"
            if social_2_option == "Website":
                user_to_edit.social_2_option = "globe"
                user_to_edit.social_2_link = social_2_handle
                user_to_edit.social_2_handle = "My Website"

        user_to_edit.save()

    return redirect(url_for('admin.users'))


@admin.route("/admin/user/ban", methods=['POST'])
def ban_user():
    user_to_delete_id = parse_arg_from_requests("user_id")
    if user_to_delete_id is not None:
        user_to_delete = User.query.get(user_to_delete_id)
        posts = db.session.query(Post).filter(Post.author_id == user_to_delete.id).all()

        if posts is not None:
            from abpoll.blueprints.post.tasks import delete_post_id

            for post in posts:
                delete_post_id(post.id)

        if user_to_delete.profile_picture is not None:
            delete_image_from_cloudflare(user_to_delete.profile_picture)

        if user_to_delete.back_ground is not None and user_to_delete.back_ground != "/images/account/bg.png":
            delete_image_from_cloudflare(user_to_delete.back_ground)

        db.session.delete(user_to_delete)
        db.session.commit()

        return render_json(200)
    return render_json(500)


@admin.route("/admin/message/delete/<room>")
def delete_room(room):
    print(room)
    if room is not None:
        chat_room = PrivateChatMeta.query.get(room)
        if chat_room is not None:
            chat_room.delete()
            return render_json(200)
    return render_json(500)


@admin.route("/admin/votes", defaults={"page": 1})
@admin.route("/admin/votes/page/<int:page>")
def retrieve_votes(page):
    post_id = request.args.get("poll_id", text(""))
    search_form = SearchForm()
    bulk_form = BulkDeleteForm()

    paginated_votes = PostViewed.query.filter(PostViewed.post_id == post_id).paginate(page, 50, True)

    return render_template(
        "admin/votes-table.html",
        form=search_form,
        bulk_form=bulk_form,
        votes=paginated_votes,
    )


# Events manager start

@admin.route("/admin/events")
def events_manager():
    live_events = Event.query.filter(Event.status == 1).all()
    return render_template("admin/events-live.html", events=live_events)


@admin.route("/v1/predict/end-event", methods=["PUT"])
def end_predictions():
    event_id = parse_arg_from_requests("event_id", type=int)
    index = parse_arg_from_requests("index", type=int)
    if event_id is None or index is None:
        return render_json(400, "Check  that the event_id and index are proper types, and are present")

    event_object = Event.query.get(event_id)
    if event_object is None or event_object.status != 1:
        return render_json(404, "The event could not  be found, or it has been removed")

    all_predictions = Predict.query.filter(and_(Predict.event_id == event_id)).all()
    if index == 0:
        winning_amount = event_object.a_amount
    else:
        winning_amount = event_object.b_amount

    for prediction in all_predictions:
        if prediction.index == index:
            prediction.author.coins += event_object.calculate_reward(prediction.amount, winning_amount)
            prediction.author.save()

        prediction.did_win = prediction.index == index
        prediction.save()

    event_object.status = 2
    event_object.winning_index = index
    event_object.save()

    event_object.post.voting_open = False
    event_object.post.status = "ended"
    event_object.post.save()

    return render_json(200, {
        "message": "The event was ended successfully",
        "balance": current_user.coins
    })


@admin.route("/v1/vote-statistics/calendar")
def vote_statistics():
    query = db.session.query(PostViewed.created_on.label("date"), func.count(PostViewed.id).label("count")).group_by(
        PostViewed.created_on).order_by("date").all()

    output = {}

    for item in query:
        month = item[0].strftime("%b")
        if month in output:
            output[month] += item[1]
        else:
            output[month] = item[1]

    new_output = {
        "keys": list(output.keys()),
        "values": list(output.values()),
    }

    return render_json(200, new_output)


@admin.route("/v1/vote-statistics/month")
def monthly_statistics():
    last_30_days = {}
    total_votes = 0

    current_date = datetime.date.today()
    for n in range(30):
        last_30_days[(current_date - datetime.timedelta(days=n)).strftime("%m/%d/%Y")] = 0

    query = db.session.query(PostViewed.created_on.label("date"), func.count(PostViewed.id).label("count")).group_by(
        PostViewed.created_on).order_by("date").all()

    for item in query:
        day = item[0].strftime("%m/%d/%Y")
        if day in last_30_days:
            last_30_days[day] += item[1]
            total_votes += item[1]

    new_output = {
        "keys": list(reversed(list(last_30_days.keys()))),
        "values": list(reversed(list(last_30_days.values()))),
        "total": total_votes,
    }

    return render_json(200, new_output)


@admin.route("/v1/vote-statistics/topics")
def topic_statistics():
    post_viewed = db.session.query(PostViewed).all()
    counts = {}
    for post in post_viewed:
        if post.post.author.display_username() not in counts:
            counts[post.post.author.display_username()] = 0
        counts[post.post.author.display_username()] += 1

    sorted_count = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:5]
    sorted_dict = collections.OrderedDict(sorted_count)
    output = {
        "keys": list(sorted_dict.keys()),
        "values": list(sorted_dict.values()),
    }

    return render_json(200, output)


# Coupons ---------------------------------------------------------------------
@admin.get('/coupons', defaults={'page': 1})
@admin.get('/coupons/page/<int:page>')
def coupons(page):
    search_form = SearchForm()
    bulk_form = BulkDeleteForm()

    sort_by = Coupon.sort_by(request.args.get('sort', 'created_on'),
                             request.args.get('direction', 'desc'))
    order_values = '{0} {1}'.format(sort_by[0], sort_by[1])

    paginated_coupons = Coupon.query \
        .filter(Coupon.search(request.args.get('q', text('')))) \
        .order_by(text(order_values)) \
        .paginate(page, 50, True)

    return render_template('admin/coupon/index.html',
                           form=search_form, bulk_form=bulk_form,
                           coupons=paginated_coupons)


@admin.route('/coupons/new', methods=['GET', 'POST'])
@handle_stripe_exceptions
def coupons_new():

    coupon = Coupon()
    form = CouponForm(obj=coupon)

    if form.validate_on_submit():
        form.populate_obj(coupon)
        if coupon.redeem_by is not None:
            coupon.redeem_by = convert_to_utc(coupon.redeem_by, "America/Chicago")

        params = {
            'code': coupon.code,
            'duration': coupon.duration,
            'percent_off': coupon.percent_off,
            'amount_off': coupon.amount_off,
            'currency': coupon.currency,
            'redeem_by': coupon.redeem_by,
            'max_redemptions': coupon.max_redemptions,
            'duration_in_months': coupon.duration_in_months,
        }

        if Coupon.create(params):
            flash('Coupon has been created successfully.', 'success')
            return redirect(url_for('admin.coupons'))

    return render_template('admin/coupon/new.html', form=form, coupon=coupon)


@admin.post('/coupons/bulk_delete')
def coupons_bulk_delete():
    form = BulkDeleteForm()

    if form.validate_on_submit():
        ids = Coupon.get_bulk_action_ids(request.form.get('scope'),
                                         request.form.getlist('bulk_ids'),
                                         query=request.args.get('q', text('')))

        # Prevent circular imports.
        from abpoll.blueprints.billing.tasks import delete_coupons

        delete_coupons.delay(ids)

        flash('{0} coupons(s) were scheduled to be deleted.'.format(len(ids)),
              'success')
    else:
        flash('No coupons were deleted, something went wrong.', 'danger')

    return redirect(url_for('admin.coupons'))
