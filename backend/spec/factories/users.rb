# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    facility
    name { "田中太郎" }
    sequence(:email) { |n| "#{n}_test@example.com" }
    password { "password" }
    is_admin { false }
    confirmed_at { Time.current }
  end
end
