# frozen_string_literal: true

class DayOffAssignment < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :user
  belongs_to :day_off_type
  belongs_to :day_off_request, optional: true

  validates :user_id, uniqueness: { scope: [:schedule_day_id, :day_off_type_id] }

  def created_from_request?
    day_off_request_id.present?
  end
end
