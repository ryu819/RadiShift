# frozen_string_literal: true

class User < ApplicationRecord
  belongs_to :facility, optional: true
  has_one_attached :avatar_image do |attachable|
    attachable.variant :avatar, resize_to_fill: [256, 256]
  end
  has_many :day_off_requests, dependent: :destroy
  has_many :work_requests, dependent: :destroy
  has_many :work_assignments, dependent: :restrict_with_error
  has_many :day_off_assignments, dependent: :restrict_with_error
  has_many :modality_assignments, dependent: :restrict_with_error
  validates :name, presence: true
  validates :avatar_image,   content_type: { in: %w[image/jpeg image/png],
                                             message: "対応している画像形式（JPEG・PNG）のファイルを選択してください。" },
                             size: { less_than: 5.megabytes,
                                     message: "5MB以下の画像を選択してください。" }
  devise :database_authenticatable, :registerable, :validatable, :confirmable, :recoverable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  def cleanup_shift_data_for_facility_departure!
    next_month = Date.current.next_month

    future_schedule_months = facility.schedule_months.where(
      "year > :year OR (year = :year AND month >= :month)",
      year: next_month.year,
      month: next_month.month
    )

    future_schedule_days = ScheduleDay.where(
      schedule_month: future_schedule_months
    )

    facility.work_requests
      .pending
      .where(user: self)
      .destroy_all

    facility.day_off_requests
      .pending
      .where(user: self)
      .destroy_all

    work_assignments
      .where(schedule_day: future_schedule_days)
      .destroy_all

    day_off_assignments
      .where(schedule_day: future_schedule_days)
      .destroy_all

    modality_assignments
      .where(schedule_day: future_schedule_days)
      .destroy_all
  end
end
