# frozen_string_literal: true

FactoryBot.define do
  factory :facility do
    sequence(:name) { |n| "テスト病院#{n}" }
    request_deadline { 7 }
  end
end
