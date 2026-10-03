# frozen_string_literal: true

class DemoEnvironment < ApplicationRecord
  LIFETIME = 24.hours

  has_many :facilities, dependent: :destroy
  has_many :users, dependent: :destroy

  scope :expired, -> { where(created_at: ..LIFETIME.ago) }

  def expired?
    created_at <= LIFETIME.ago
  end
end
