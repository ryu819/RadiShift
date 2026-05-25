# frozen_string_literal: true

class WorkType < ApplicationRecord
  belongs_to :facility
  has_many :work_requests, dependent: :destroy
  scope :active, -> { where(is_active: true) }
  validates :name, presence: true, uniqueness: { scope: :facility_id }
end
