# frozen_string_literal: true

FactoryBot.define do
  factory :day_off_slot_rule do
    facility
    day_off_type { association(:day_off_type, facility: facility) }
    weekday { 1 }
    max_slots { 5 }
  end
end
