# frozen_string_literal: true

class DayOffRequest < ApplicationRecord
  belongs_to :user
  belongs_to :facility
  belongs_to :schedule_day
  belongs_to :day_off_type

  enum :request_status, {
    pending: 0,
    approved: 1,
    rejected: 2
  }, validate: true

  validates :schedule_day_id,
            uniqueness: {
              scope: [:user_id, :day_off_type_id],
              conditions: -> { where(request_status: :pending) },
              message: "には同じ休み希望がすでに申請されています。"
            },
            if: :pending?
end
