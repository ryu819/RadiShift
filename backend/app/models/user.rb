# frozen_string_literal: true

class User < ApplicationRecord
  belongs_to :facility, optional: true
  has_one_attached :avatar_image
  has_many :day_off_requests, dependent: :destroy
  has_many :work_requests, dependent: :destroy
  validates :name, presence: true
  validates :avatar_image,   content_type: { in: %w[image/jpeg image/png],
                                             message: "対応している画像形式（JPEG・PNG）のファイルを選択してください。" },
                             size: { less_than: 5.megabytes,
                                     message: "5MB以下の画像を選択してください。" }
  devise :database_authenticatable, :registerable, :validatable, :confirmable, :recoverable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
end
