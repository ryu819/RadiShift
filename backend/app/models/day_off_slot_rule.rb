# frozen_string_literal: true

class DayOffSlotRule < ApplicationRecord
  belongs_to :facility
  belongs_to :day_off_type
  validates :weekday, presence: true,
                      numericality: {
                        only_integer: true,
                        greater_than_or_equal_to: 0,
                        less_than_or_equal_to: 7
                      }
  validates :max_slots, presence: true,
                        numericality: {
                          only_integer: true,
                          greater_than_or_equal_to: 0
                        }
  validates :day_off_type_id, uniqueness: { scope: [:facility_id, :weekday] }
end
