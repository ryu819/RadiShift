# frozen_string_literal: true

class ModalityType < ApplicationRecord
  belongs_to :facility
  scope :active, -> { where(is_active: true) }
  validates :name, presence: true, uniqueness: { scope: :facility_id }
end
