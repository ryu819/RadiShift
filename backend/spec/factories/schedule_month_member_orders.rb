# frozen_string_literal: true

FactoryBot.define do
  factory :schedule_month_member_order do
    transient do
      facility { association(:facility) }
    end

    schedule_month { association(:schedule_month, facility: facility) }
    user { association(:user, facility: facility) }
    display_order { 1 }
  end
end
