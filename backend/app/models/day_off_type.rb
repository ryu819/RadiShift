# frozen_string_literal: true

class DayOffType < ApplicationRecord
  belongs_to :facility
  has_many :day_off_slots, dependent: :destroy
  scope :active, -> { where(is_active: true) }
  validates :name, presence: true, uniqueness: { scope: :facility_id }
  validates :day_off_unit, presence: true,
                           numericality: {
                             greater_than_or_equal_to: 0
                           }
end
