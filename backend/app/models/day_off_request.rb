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
  }
end
