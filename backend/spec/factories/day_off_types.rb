# frozen_string_literal: true

FactoryBot.define do
  factory :day_off_type do
    facility
    name { "休み" }
    day_off_unit { 1.0 }
    is_active { true }
    color_code { "#FF0000" }
    uses_slot { true }
  end
end
