# frozen_string_literal: true

class WorkAssignment < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :user
  belongs_to :work_type

  validates :user_id, uniqueness: { scope: [:schedule_day_id, :work_type_id] }
end
