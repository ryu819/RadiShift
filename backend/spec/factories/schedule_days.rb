# frozen_string_literal: true

FactoryBot.define do
  factory :schedule_day do
    schedule_month
    date { Date.new(2026, 1, 2) }
    is_holiday { false }

    trait :holiday do
      date { Date.new(2026, 1, 1) }
      is_holiday { true }
    end
  end
end
