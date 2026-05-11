# frozen_string_literal: true

FactoryBot.define do
  factory :schedule_day do
    schedule_month
    date { Date.new(2026, 1, 1) }
  end
end
