from abpoll.extensions import db
from abpoll.blueprints.post.models import Post
from lib.upload_files import backgrounds, custom_backgrounds
from lib.upload_files import delete_image_from_cloudflare
from sqlalchemy import and_
from flask import session
from abpoll.app import create_celery_app

from abpoll.blueprints.post.models import PostViewed
celery = create_celery_app()


def delete_post_id(post_id):
    post_to_delete = Post.query.get(post_id)

    if post_to_delete.thumbnail is not None:
        delete_image_from_cloudflare(post_to_delete.thumbnail)

    if post_to_delete.image_1 is not None and post_to_delete.image_1 != post_to_delete.author.back_ground:
        delete_image_from_cloudflare(post_to_delete.image_1)

    if post_to_delete.image_2 is not None and post_to_delete.image_2 != 'present':
        delete_image_from_cloudflare(post_to_delete.image_2)

    db.session.delete(post_to_delete)
    db.session.commit()

    return None


# @celery.task()
def post_was_voted(viewed_posts_id: str,
                   user_vote_id: int,
                   current_user_id=None) -> None:
    """"
    This will receive an array of posts viewed and the current_user's ID then we will check if the user voted on those posts, and mark those posts as viewed
    """

    new_vote = db.session.query(PostViewed).filter(
        and_(PostViewed.fingerprint_id == session['fingerprint_id'], PostViewed.post_id == viewed_posts_id)).first()

    if new_vote is None:
        new_vote = PostViewed(
            author_id=current_user_id,
            post_id=viewed_posts_id,
            did_user_vote=1,
            user_vote_id=user_vote_id,
            fingerprint_id=session['fingerprint_id'],
            accuracy_radius = session['accuracy_radius'],
            latitude = session['latitude'],
            longitude = session['longitude'],
            timezone = session['timezone'],
            city = session['city'],
            subdivision = session['subdivision'],
            country = session['country'],
            continent = session['continent'],
        )
        new_vote.save()

    elif new_vote.did_user_vote == 0:
        new_vote.did_user_vote = 1
        new_vote.user_vote_id = user_vote_id
        new_vote.fingerprint_id = session['fingerprint_id']
        new_vote.accuracy_radius = session['accuracy_radius']
        new_vote.latitude = session['latitude']
        new_vote.longitude = session['longitude']
        new_vote.timezone = session['timezone']
        new_vote.city = session['city']
        new_vote.subdivision = session['subdivision']
        new_vote.country = session['country']
        new_vote.continent = session['continent']
        new_vote.save()

    return None


@celery.task()
def change_all_default_posts_background(user_id: str, background_image: str, old_background_image=None) -> None:
    posts = db.session.query(Post).filter(Post.author_id == user_id).all()

    if old_background_image is None:
        for post in posts:
            if post.image_1 in backgrounds or post.image_1 in custom_backgrounds:
                post.image_1 = background_image
                post.save()
    else:
        for post in posts:
            if post.image_1 == old_background_image:
                post.image_1 = background_image
                post.save()

    return None
