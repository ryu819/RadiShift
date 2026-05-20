# frozen_string_literal: true

FactoryBot.define do
  factory :day_off_slot do
    schedule_day
    day_off_type
    max_slots { 4 }
  end
end
