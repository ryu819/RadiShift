# frozen_string_literal: true

class WorkAssignment < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :user
  belongs_to :work_type
  belongs_to :work_request, optional: true
  belongs_to :primary_work_assignment, class_name: "WorkAssignment", optional: true
  has_one :next_day_work_assignment, class_name: "WorkAssignment", foreign_key: :primary_work_assignment_id,
                                     inverse_of: :primary_work_assignment, dependent: nil

  validates :user_id, uniqueness: { scope: [:schedule_day_id, :work_type_id] }

  def created_from_request?
    work_request_id.present?
  end

  def next_day_assignment?
    primary_work_assignment_id.present?
  end

  def next_day_work_type
    type = work_type.next_day_work_type
    type if type&.is_active?
  end

  def next_day_schedule_day
    ScheduleDay.joins(:schedule_month).find_by(
      date: schedule_day.date + 1.day,
      schedule_months: { facility_id: work_type.facility_id }
    )
  end

  def next_day_error_message
    type = next_day_work_type
    day = next_day_schedule_day if type
    return unless type && day
    return unless WorkAssignment.exists?(schedule_day: day, user: user, work_type: type)

    "翌日の勤務はすでに割り当てられています。"
  end

  def create_next_day_work_assignment!
    type = next_day_work_type
    day = next_day_schedule_day if type
    return unless type && day

    WorkAssignment.create!(schedule_day: day, user: user, work_type: type, primary_work_assignment: self)
  end
end
