# frozen_string_literal: true

FactoryBot.define do
  factory :schedule_month do
    facility
    year { 2026 }
    month { 1 }
    monthly_days_off { 8.0 }
    status { :accepting_requests }
  end
end
