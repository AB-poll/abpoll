"""“add_a_sentiment_field”

Revision ID: 60c8b765d395
Revises: 09a53c26edd6
Create Date: 2022-10-02 19:08:39.529117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '60c8b765d395'
down_revision = '09a53c26edd6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('posts', sa.Column('sentiment', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('posts', 'sentiment')
    # ### end Alembic commands ###
