# frozen_string_literal: true

class WorkRequest < ApplicationRecord
  belongs_to :user
  belongs_to :facility
  belongs_to :schedule_day
  belongs_to :work_type

  enum :request_status, {
    pending: 0,
    approved: 1,
    rejected: 2
  }, validate: true

  validates :schedule_day_id,
            uniqueness: {
              scope: [:user_id, :work_type_id],
              conditions: -> { where(request_status: :pending) },
              message: "には同じ勤務希望がすでに申請されています。"
            },
            if: :pending?
end
