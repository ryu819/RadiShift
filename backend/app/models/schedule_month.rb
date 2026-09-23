# frozen_string_literal: true

class ScheduleMonth < ApplicationRecord
  belongs_to :facility

  has_many :schedule_days, -> { order(date: :asc) }, dependent: :destroy, inverse_of: :schedule_month
  has_many :schedule_month_member_orders, dependent: :destroy
  validates :year, presence: true
  validates :month, presence: true,
                    numericality: {
                      only_integer: true,
                      greater_than_or_equal_to: 1,
                      less_than_or_equal_to: 12
                    }

  validates :monthly_days_off, presence: true,
                               numericality: {
                                 greater_than_or_equal_to: 0
                               }

  validate :monthly_days_off_must_be_half_step

  def member_order_fixed?
    schedule_month_member_orders.exists?
  end

  def capture_member_order!
    return if member_order_fixed?

    facility.active_members_in_display_order.each_with_index do |user, index|
      schedule_month_member_orders.create!(
        user: user,
        display_order: index + 1
      )
    end
  end

  def append_member_to_fixed_order!(user)
    return unless member_order_fixed?

    member_order = schedule_month_member_orders.find_by(user: user)

    return if member_order

    next_display_order =
      schedule_month_member_orders.maximum(:display_order).to_i + 1

    schedule_month_member_orders.create!(
      user: user,
      display_order: next_display_order
    )
  end

  private

  def monthly_days_off_must_be_half_step
    return if monthly_days_off.blank?

    return if ((monthly_days_off * 2) % 1).zero?

    errors.add(:monthly_days_off, "は0.5刻みで入力してください")
  end
end
