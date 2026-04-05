# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { "田中太郎" }
    sequence(:email) { |n| "#{n}_test@example.com" }
    password { "password" }
    is_admin { false }
    confirmed_at { Time.current }

    trait :with_facility do
      facility
    end

    trait :admin do
      is_admin { true }
      facility
    end
  end
end
