# frozen_string_literal: true

class Facility < ApplicationRecord
  has_many :users, dependent: :nullify
  has_many :schedule_months, dependent: :destroy
  has_many :work_types, dependent: :destroy
  has_many :day_off_types, dependent: :destroy
  validates :name, presence: true, uniqueness: true
end
