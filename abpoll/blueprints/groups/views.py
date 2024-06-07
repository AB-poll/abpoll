from flask import Blueprint, abort, flash, redirect, render_template, request, session, url_for
from flask_login import current_user, login_required
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from abpoll.blueprints.groups.models import Group, GroupParticipant
from abpoll.blueprints.post.models import Post, PostViewed
from abpoll.extensions import db
from lib.upload_files import delete_image_from_cloudflare
from lib.util_json import parse_arg_from_requests, render_json
from lib.util_post import save_image_to_server
from lib.util_sqlalchemy import generate_random_id

groups = Blueprint("groups", __name__, template_folder="templates")


@groups.route("/groups")
def index():
    """ Show the groups and show the create groups button and search """
    all_groups = Group.get_user_groups()
    return render_template("groups/index.html", groups=all_groups)


@groups.route("/groups/<int:group_id>")
def view(group_id):
    """ Show the groups and show the create groups button and search """
    group = Group.query.get(group_id)
    if group:
        if group not in Group.get_user_groups():
            flash("You need to join the group to view it", "warning")
            return redirect(url_for('groups.index') + f"?join={group_id}")
        return render_template("groups/view.html", group=group)
    else:
        return abort(404)


@groups.route("/groups/<int:group_id>/<int:page>")
def retrieve_posts(group_id, page):
    """ render the posts the group voted on"""
    group = Group.query.get(group_id)
    if group:
        if group not in Group.get_user_groups():
            flash("You need to join the group to view it", "warning")
            return render_json(301, url_for("groups.index"))

        group_participants = GroupParticipant.query.filter_by(group_id=group_id).all()

        group_logged_in_participants_ids = []
        group_guest_participants_ids = []
        for participant in group_participants:
            if participant.user_id is not None:
                group_logged_in_participants_ids.append(participant.user_id)
            else:
                group_guest_participants_ids.append(participant.fingerprint_id)

        posts = Post.query.join(PostViewed).filter(
            or_(PostViewed.author_id.in_(group_logged_in_participants_ids),
                PostViewed.fingerprint_id.in_(group_guest_participants_ids))).order_by(
            PostViewed.id.desc()).paginate(page=page, per_page=10)

        serialized_posts = []

        for post in posts.items:
            output = post.serialize
            output["options_vote"] = [0, 0, 0, 0]
            for post_viewed in post.post_viewed:
                if post_viewed.author_id in group_logged_in_participants_ids or \
                        post_viewed.fingerprint_id in group_guest_participants_ids:
                    output["options_vote"][post_viewed.user_vote_id] += 1
            output["total_votes"] = sum(output["options_vote"])
            serialized_posts.append(output)

        return render_json(200, serialized_posts)
    return render_json(404, "group not found")


@groups.route("/groups/create", methods=["POST"])
@login_required
def create():
    """ Show the groups and show the create groups button and search """

    # validate the form
    name = request.values.get("name")
    if name is None or len(name) < 3 or len(name) > 30:
        flash("Please enter a valid name 3-30 characters", "danger")
        return redirect(url_for('groups.index'))

    description = request.values.get("description")
    if description is None or len(description) == 0 or len(description) > 160:
        flash("Please enter a valid description 1-160 characters", "danger")
        return redirect(url_for('groups.index'))

    location = request.values.get("location", None)[:30]
    privacy = request.values.get("privacy")
    group_id = generate_random_id(Group, 7)

    # save the group
    new_group = Group(
        id=group_id,
        name=name,
        author_id=current_user.id,
        description=description,
        location=location,
        privacy=privacy,
    )
    new_group.save()

    new_participant = GroupParticipant(
        group_id=group_id,
        user_id=current_user.id
    )
    new_participant.save()
    flash("Group created successfully", "success")
    return redirect(url_for("groups.index"))


@groups.route("/groups/join", methods=["POST"])
def join():
    """ Join the group """
    group_id = parse_arg_from_requests("group_id", type=int)
    if group_id is None:
        return render_json(400, "Invalid format double check your Id")
    group = Group.query.get(group_id)
    if group:
        # check if this user is already a participant in this group
        try:
            if current_user.is_active:
                new_participant = GroupParticipant(
                    group_id=group_id,
                    user_id=current_user.id
                )
                new_participant.save()
            else:
                try:
                    if session["fingerprint_id"]:
                        new_participant = GroupParticipant(
                            group_id=group_id,
                            fingerprint_id=session["fingerprint_id"]
                        )
                        new_participant.save()
                except KeyError:
                    return render_json(400, "Unable to process request right now reload the page or try again later")

            flash("Successfully joined the group", "success")
            return render_json(200, url_for("groups.view", group_id=group_id))
        except IntegrityError:
            db.session.rollback()
            flash("You are already in the group", "info")
            return render_json(200, url_for("groups.view", group_id=group_id))
    else:
        return render_json(404, "This group does not exist")


@groups.route("/groups/edit", methods=["POST"])
@login_required
def edit():
    """ Show the groups and show the create groups button and search """
    group_id = request.values.get("group_id", type=int)
    if group_id is None:
        return abort(404)

    group_object = Group.query.get(group_id)
    if group_object is None:
        return abort(404)

    if group_object.author_id != current_user.id:
        return abort(404)

    name = request.values.get("name")
    if name is None or len(name) < 3 or len(name) > 30:
        flash("Please enter a valid name 3-30 characters", "danger")
        return redirect(url_for("groups.view", group_id=group_id))

    description = request.values.get("description")
    if description is None or len(description) == 0 or len(description) > 160:
        flash("Please enter a valid description 1-160 characters", "danger")
        return redirect(url_for("groups.view", group_id=group_id))

    location = request.values.get("location", None)[:30]
    privacy = request.values.get("privacy")

    group_object.name = name
    group_object.description = description
    group_object.location = location
    group_object.privacy = privacy
    group_object.save()

    background = request.files['background']

    if background is not None and background.filename != "":
        if group_object.background is not None:
            delete_image_from_cloudflare(group_object.background)
        group_object.background = save_image_to_server(background)
        group_object.save()

    flash("Successfully edited", "success")
    return redirect(url_for("groups.view", group_id=group_id))


@groups.route("/groups/delete", methods=["POST"])
@login_required
def delete():
    """ Delete the group if given the group id """
    group_id = request.values.get("group_id", type=int)
    if group_id is None:
        flash("An error occurred while processing the deletion", "warning")
        return redirect(url_for('groups.index'))

    group_object = Group.query.get(group_id)
    if group_object is None:
        flash("An error occurred while processing the deletion", "warning")
        return redirect(url_for('groups.index'))

    if group_object.author_id != current_user.id:
        flash("An error occurred while processing the deletion", "warning")
        return redirect(url_for('groups.index'))

    if group_object.background is not None:
        delete_image_from_cloudflare(group_object.background)

    group_object.delete()
    flash("Successfully deleted your group", "success")
    return redirect(url_for('groups.index'))
