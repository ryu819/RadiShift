# frozen_string_literal: true

class User < ApplicationRecord
  belongs_to :facility, optional: true
  has_one_attached :avatar_image
  validates :name, presence: true
  devise :database_authenticatable, :registerable, :validatable, :confirmable, :recoverable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
end
