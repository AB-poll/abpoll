"""“added_trivia”

Revision ID: 5a0b23a34776
Revises: 3a9b11fb89ec
Create Date: 2022-03-30 03:57:23.228733

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a0b23a34776'
down_revision = '3a9b11fb89ec'
branch_labels = None
depends_on = None


def upgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    # op.add_column('post_viewed', sa.Column('user_vote_id', sa.Integer(), nullable=True))
    # op.add_column('posts', sa.Column('post_format', sa.String(), nullable=True))
    # op.add_column('posts', sa.Column('options', sa.ARRAY(sa.String(length=90)), nullable=True))
    # op.add_column('posts', sa.Column('options_vote', sa.ARRAY(sa.Integer()), nullable=True))
    # op.add_column('posts', sa.Column('selected_option', sa.Integer(), nullable=True))
    # ### end Alembic cli ###
    pass


def downgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    # op.drop_column('posts', 'selected_option')
    # op.drop_column('posts', 'options_vote')
    # op.drop_column('posts', 'options')
    # op.drop_column('posts', 'post_format')
    # op.drop_column('post_viewed', 'user_vote_id')
    # ### end Alembic cli ###
    pass