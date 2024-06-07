import click
from flask import current_app
from flask.cli import with_appcontext
from sqlalchemy import and_

from abpoll.blueprints.post.models import Post, PostViewed
from abpoll.extensions import db


@click.group()
def sentiment():
    """ Perform various tasks with TextBlob and recommendations. """
    pass


@sentiment.command()
@with_appcontext
def generate():
    """
    Auto generate the sentiment of posts.

    :return: None
    """
    all_posts = db.session.query(Post).all()

    for post in all_posts:
        post.save_sentiment()


@sentiment.command()
@with_appcontext
def delete_duplicate_post_viewed():
    """
    Delete all the duplicate post viewed

    :return: None
    """
    # get all the PostViewed elements
    post_viewed = PostViewed.query.all()
    # create a list to store the ids of the PostViewed elements that are duplicates
    duplicate_ids = []
    # loop through all the PostViewed elements
    for pv in post_viewed:
        # get all the PostViewed elements with the same author_id and post_id
        duplicate_pv = PostViewed.query.filter_by(author_id=pv.author_id, post_id=pv.post_id).all()
        # if there is more than one PostViewed element with the same author_id and post_id
        if len(duplicate_pv) > 1:
            # loop through all the PostViewed elements with the same author_id and post_id
            for dpv in duplicate_pv:
                # if the id of the PostViewed element is not already in the duplicate_ids list
                if dpv.id not in duplicate_ids and dpv.author_id is not None:
                    # add the id of the PostViewed element to the duplicate_ids list
                    duplicate_ids.append(dpv.id)
    # loop through all the ids of the PostViewed elements that are duplicates
    for duplicate_id in duplicate_ids:
        # get the PostViewed element with the id
        pv = PostViewed.query.get(duplicate_id)
        # delete the PostViewed element
        db.session.delete(pv)
    # commit the changes to the database
    db.session.commit()
