"""“initial_commit”

Revision ID: 6c97cc8995c4
Revises: 
Create Date: 2021-12-28 18:58:20.577600

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6c97cc8995c4'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    # op.create_unique_constraint(None, 'comment_likes', ['id'])
    # op.create_unique_constraint(None, 'likes', ['id'])
    # op.create_unique_constraint(None, 'notifications', ['id'])
    # op.create_unique_constraint(None, 'post_a_votes', ['id'])
    # op.create_unique_constraint(None, 'post_b_votes', ['id'])
    # op.create_unique_constraint(None, 'posts', ['id'])
    # ### end Alembic cli ###
    pass


def downgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    # op.drop_constraint(None, 'posts', type_='unique')
    # op.drop_constraint(None, 'post_b_votes', type_='unique')
    # op.drop_constraint(None, 'post_a_votes', type_='unique')
    # op.drop_constraint(None, 'notifications', type_='unique')
    # op.drop_constraint(None, 'likes', type_='unique')
    # op.drop_constraint(None, 'comment_likes', type_='unique')
    # ### end Alembic cli ###
    pass