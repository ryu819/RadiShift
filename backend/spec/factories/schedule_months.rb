# frozen_string_literal: true

FactoryBot.define do
  factory :schedule_month do
    facility
    year { 2025 }
    month { 1 }
    monthly_days_off { 8.0 }
  end
end
