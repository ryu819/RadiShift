# frozen_string_literal: true

class ScheduleMonthMemberOrder < ApplicationRecord
  belongs_to :schedule_month
  belongs_to :user

  validates :display_order, presence: true,
                            numericality: { only_integer: true, greater_than: 0 }

  validates :user_id, uniqueness: { scope: :schedule_month_id }
end
