"""added_subscription_models

Revision ID: 09a53c26edd6
Revises: 46ede1285785
Create Date: 2022-09-10 18:31:33.593992

"""
from alembic import op
import sqlalchemy as sa
from lib.util_sqlalchemy import AwareDateTime

# revision identifiers, used by Alembic.
revision = '09a53c26edd6'
down_revision = '46ede1285785'
branch_labels = None
depends_on = None


def upgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    op.create_table('coupons',
    sa.Column('created_on', AwareDateTime(), nullable=True),
    sa.Column('updated_on', AwareDateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(length=128), nullable=True),
    sa.Column('duration', sa.Enum('forever', 'once', 'repeating', name='duration_types'), server_default='forever', nullable=False),
    sa.Column('amount_off', sa.Integer(), nullable=True),
    sa.Column('percent_off', sa.Integer(), nullable=True),
    sa.Column('currency', sa.String(length=8), nullable=True),
    sa.Column('duration_in_months', sa.Integer(), nullable=True),
    sa.Column('max_redemptions', sa.Integer(), nullable=True),
    sa.Column('redeem_by', AwareDateTime(), nullable=True),
    sa.Column('times_redeemed', sa.Integer(), nullable=False),
    sa.Column('valid', sa.Boolean(), server_default='1', nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_coupons_code'), 'coupons', ['code'], unique=True)
    op.create_index(op.f('ix_coupons_duration'), 'coupons', ['duration'], unique=False)
    op.create_index(op.f('ix_coupons_max_redemptions'), 'coupons', ['max_redemptions'], unique=False)
    op.create_index(op.f('ix_coupons_redeem_by'), 'coupons', ['redeem_by'], unique=False)
    op.create_index(op.f('ix_coupons_times_redeemed'), 'coupons', ['times_redeemed'], unique=False)
    op.create_table('credit_cards',
    sa.Column('created_on', AwareDateTime(), nullable=True),
    sa.Column('updated_on', AwareDateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('brand', sa.String(length=32), nullable=True),
    sa.Column('last4', sa.String(length=4), nullable=True),
    sa.Column('exp_date', sa.Date(), nullable=True),
    sa.Column('is_expiring', sa.Boolean(), server_default='0', nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_cards_exp_date'), 'credit_cards', ['exp_date'], unique=False)
    op.create_index(op.f('ix_credit_cards_user_id'), 'credit_cards', ['user_id'], unique=False)
    op.create_table('invoices',
    sa.Column('created_on', AwareDateTime(), nullable=True),
    sa.Column('updated_on', AwareDateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('plan', sa.String(length=128), nullable=True),
    sa.Column('receipt_number', sa.String(length=128), nullable=True),
    sa.Column('description', sa.String(length=128), nullable=True),
    sa.Column('period_start_on', sa.Date(), nullable=True),
    sa.Column('period_end_on', sa.Date(), nullable=True),
    sa.Column('currency', sa.String(length=8), nullable=True),
    sa.Column('tax', sa.Integer(), nullable=True),
    sa.Column('tax_percent', sa.Float(), nullable=True),
    sa.Column('total', sa.Integer(), nullable=True),
    sa.Column('brand', sa.String(length=32), nullable=True),
    sa.Column('last4', sa.String(length=4), nullable=True),
    sa.Column('exp_date', sa.Date(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoices_exp_date'), 'invoices', ['exp_date'], unique=False)
    op.create_index(op.f('ix_invoices_plan'), 'invoices', ['plan'], unique=False)
    op.create_index(op.f('ix_invoices_receipt_number'), 'invoices', ['receipt_number'], unique=False)
    op.create_index(op.f('ix_invoices_user_id'), 'invoices', ['user_id'], unique=False)
    op.create_table('subscriptions',
    sa.Column('created_on', AwareDateTime(), nullable=True),
    sa.Column('updated_on', AwareDateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('plan', sa.String(length=128), nullable=True),
    sa.Column('coupon', sa.String(length=128), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=False)
    op.add_column('users', sa.Column('name', sa.String(length=128), nullable=True))
    op.add_column('users', sa.Column('payment_id', sa.String(length=128), nullable=True))
    op.add_column('users', sa.Column('cancelled_subscription_on', AwareDateTime(), nullable=True))
    op.add_column('users', sa.Column('previous_plan', sa.String(length=128), nullable=True))
    op.create_index(op.f('ix_users_name'), 'users', ['name'], unique=False)
    op.create_index(op.f('ix_users_payment_id'), 'users', ['payment_id'], unique=False)
    # ### end Alembic cli ###


def downgrade():
    # ### cli auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_users_payment_id'), table_name='users')
    op.drop_index(op.f('ix_users_name'), table_name='users')
    op.drop_column('users', 'previous_plan')
    op.drop_column('users', 'cancelled_subscription_on')
    op.drop_column('users', 'payment_id')
    op.drop_column('users', 'name')
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    op.drop_table('subscriptions')
    op.drop_index(op.f('ix_invoices_user_id'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_receipt_number'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_plan'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_exp_date'), table_name='invoices')
    op.drop_table('invoices')
    op.drop_index(op.f('ix_credit_cards_user_id'), table_name='credit_cards')
    op.drop_index(op.f('ix_credit_cards_exp_date'), table_name='credit_cards')
    op.drop_table('credit_cards')
    op.drop_index(op.f('ix_coupons_times_redeemed'), table_name='coupons')
    op.drop_index(op.f('ix_coupons_redeem_by'), table_name='coupons')
    op.drop_index(op.f('ix_coupons_max_redemptions'), table_name='coupons')
    op.drop_index(op.f('ix_coupons_duration'), table_name='coupons')
    op.drop_index(op.f('ix_coupons_code'), table_name='coupons')
    op.drop_table('coupons')
    # ### end Alembic cli ###
