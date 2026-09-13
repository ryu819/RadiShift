# frozen_string_literal: true

class DayOffType < ApplicationRecord
  belongs_to :facility
  has_many :day_off_slots, dependent: :destroy
  has_many :day_off_slot_rules, dependent: :destroy
  has_many :day_off_requests, dependent: :destroy
  has_many :day_off_assignments, dependent: :destroy
  scope :active, -> { where(is_active: true) }
  validates :name, presence: true
  validates :color_code, presence: true
  validates :day_off_unit, presence: true,
                           numericality: {
                             greater_than_or_equal_to: 0
                           }

  validate :day_off_unit_must_be_half_step

  after_update :destroy_day_off_slot_rules,
               if: :day_off_slot_rules_became_unavailable?

  private

  def day_off_unit_must_be_half_step
    return if day_off_unit.blank?

    return if ((day_off_unit * 2) % 1).zero?

    errors.add(:day_off_unit, "は0.5刻みで入力してください")
  end

  def day_off_slot_rules_became_unavailable?
    (saved_change_to_uses_slot? && !uses_slot?) ||
      (saved_change_to_is_active? && !is_active?)
  end

  def destroy_day_off_slot_rules
    day_off_slot_rules.destroy_all
  end
end
