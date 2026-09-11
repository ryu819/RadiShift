# frozen_string_literal: true

class WorkAssignment < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :user
  belongs_to :work_type
  belongs_to :work_request, optional: true

  validates :user_id, uniqueness: { scope: [:schedule_day_id, :work_type_id] }

  def created_from_request?
    work_request_id.present?
  end
end
