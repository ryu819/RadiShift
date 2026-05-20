# frozen_string_literal: true

class DayOffSlot < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :day_off_type
  validates :max_slots, presence: true,
                        numericality: {
                          only_integer: true,
                          greater_than_or_equal_to: 0
                        }
  validates :day_off_type_id, uniqueness: { scope: :schedule_day_id }
end