# frozen_string_literal: true

class User < ApplicationRecord
  belongs_to :facility, optional: true
  has_one_attached :avatar_image
  validates :name, presence: true
  validates :avatar_image,   content_type: { in: %w[image/jpeg image/png],
                                             message: "対応している画像形式（JPEG・PNG）のファイルを選択してください。" },
                             size: { less_than: 5.megabytes,
                                     message: "ファイルサイズは5MB以下にしてください。" }
  devise :database_authenticatable, :registerable, :validatable, :confirmable, :recoverable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
end
