# frozen_string_literal: true

class ModalityAssignment < ApplicationRecord
  belongs_to :schedule_day
  belongs_to :user
  belongs_to :modality_type

  validates :user_id, uniqueness: { scope: [:schedule_day_id, :modality_type_id] }
end
