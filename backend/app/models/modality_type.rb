# frozen_string_literal: true

class ModalityType < ApplicationRecord
  belongs_to :facility
  has_many :modality_assignments, dependent: :destroy
  scope :active, -> { where(is_active: true) }
  validates :name, presence: true
end
