# frozen_string_literal: true

class Facility < ApplicationRecord
  has_many :users, dependent: :nullify
  has_many :schedule_months, dependent: :destroy
  validates :name, presence: true, uniqueness: true
end
