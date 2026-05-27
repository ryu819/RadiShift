# frozen_string_literal: true

class DayOffAssignment < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :user
  belongs_to :day_off_type

  validates :user_id, uniqueness: { scope: [:schedule_day_id, :day_off_type_id] }
end
