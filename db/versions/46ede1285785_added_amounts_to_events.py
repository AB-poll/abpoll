"""“added_amounts_to_events”

Revision ID: 46ede1285785
Revises: 62f4149036a5
Create Date: 2022-06-29 00:48:36.466035

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '46ede1285785'
down_revision = '62f4149036a5'
branch_labels = None
depends_on = None


def upgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    op.add_column('events', sa.Column('a_amount', sa.Integer(), nullable=True))
    op.add_column('events', sa.Column('b_amount', sa.Integer(), nullable=True))
    op.create_unique_constraint(None, 'events', ['id'])
    op.create_unique_constraint(None, 'predictions', ['id'])
    # ### end Alembic cli ###


def downgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'predictions', type_='unique')
    op.drop_constraint(None, 'events', type_='unique')
    op.drop_column('events', 'b_amount')
    op.drop_column('events', 'a_amount')
    # ### end Alembic cli ###