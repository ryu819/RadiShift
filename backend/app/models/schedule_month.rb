# frozen_string_literal: true

class ScheduleMonth < ApplicationRecord
  belongs_to :facility

  validates :year, presence: true
  validates :month, presence: true,
                    numericality: {
                      only_integer: true,
                      greater_than_or_equal_to: 1,
                      less_than_or_equal_to: 12
                    }

  validates :monthly_days_off, presence: true,
                               numericality: {
                                 greater_than_or_equal_to: 0
                               }

  validate :monthly_days_off_must_be_half_step

  private

  def monthly_days_off_must_be_half_step
    return if monthly_days_off.blank?

    return if ((monthly_days_off * 2) % 1).zero?

    errors.add(:monthly_days_off, "は0.5刻みで入力してください")
  end
end
