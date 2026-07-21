# frozen_string_literal: true

FactoryBot.define do
  factory :facility do
    sequence(:name) { |n| "テスト病院#{n}" }
    request_deadline_day { 15 }
    sequence(:invite_code) { |n| "abcdefghi#{n}" }
    sequence(:invite_expires_at) { 1.week.from_now.end_of_day }
  end
end
