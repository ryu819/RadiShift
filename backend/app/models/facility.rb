# frozen_string_literal: true

class Facility < ApplicationRecord
  has_many :users, dependent: :nullify
  validates :name, presence: true, uniqueness: true
end
