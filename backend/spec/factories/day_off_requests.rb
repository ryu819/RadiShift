# frozen_string_literal: true

FactoryBot.define do
  factory :day_off_request do
    facility
    user { association(:user, facility: facility) }
    schedule_day { association(:schedule_day, schedule_month: association(:schedule_month, facility: facility)) }
    day_off_type { association(:day_off_type, facility: facility) }
    request_status { :pending }
    is_return { false }
  end
end
