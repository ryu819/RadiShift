# frozen_string_literal: true

class User < ApplicationRecord
  belongs_to :facility, optional: true
  belongs_to :demo_environment, optional: true
  has_one_attached :avatar_image
  has_many :day_off_requests, dependent: :destroy
  has_many :work_requests, dependent: :destroy
  has_many :work_assignments, dependent: :destroy
  has_many :day_off_assignments, dependent: :destroy
  has_many :modality_assignments, dependent: :destroy
  has_many :schedule_month_member_orders, dependent: :destroy
  validates :name, presence: true
  validates :avatar_image,   content_type: { in: %w[image/jpeg image/png],
                                             message: "対応している画像形式（JPEG・PNG）のファイルを選択してください。" },
                             size: { less_than: 5.megabytes,
                                     message: "5MiB未満の画像を選択してください。" }
  validates :display_order, presence: true, numericality: { only_integer: true, greater_than: 0 },
                            if: -> { facility.present? }

  validates :display_order, absence: true, if: -> { facility.nil? }
  validates :google_sub, uniqueness: true, allow_nil: true

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

  def password_set?
    encrypted_password.present?
  end

  def demo_expired?
    demo_environment&.expired? || false
  end

  def active_for_authentication?
    super && !demo_expired?
  end

  def resend_confirmation_instructions
    with_lock do
      if confirmation_sent_at.nil? || confirmation_sent_at <= 1.minute.ago
        self.confirmation_token = nil
        super
      end
    end
  end

  private

  def password_required?
    return false if google_sub.present? &&
                    encrypted_password.blank? &&
                    password.nil? &&
                    password_confirmation.nil?

    super
  end
end
