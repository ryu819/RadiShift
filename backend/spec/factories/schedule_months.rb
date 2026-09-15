# frozen_string_literal: true

FactoryBot.define do
  factory :schedule_month do
    transient do
      date { Date.current.tomorrow }
    end
    facility
    year { date.year }
    month { date.month }
    monthly_days_off { 8.0 }
    is_published { false }
  end
end
