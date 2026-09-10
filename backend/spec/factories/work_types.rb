# frozen_string_literal: true

FactoryBot.define do
  factory :work_type do
    facility
    name { "日勤" }
    is_active { true }
    color_code { "#FF0000" }
    is_requestable { false }
  end
end
