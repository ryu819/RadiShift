# frozen_string_literal: true

FactoryBot.define do
  factory :day_off_slot do
    transient do
      facility { association(:facility) }
    end
    schedule_day { association(:schedule_day, schedule_month: association(:schedule_month, facility: facility)) }
    day_off_type { association(:day_off_type, facility: facility) }
    max_slots { 5 }
  end
end
