# frozen_string_literal: true

FactoryBot.define do
  factory :modality_type do
    facility
    name { "CT" }
    is_active { true }
    color_code { "#FF0000" }
  end
end
