# frozen_string_literal: true

FactoryBot.define do
  factory :work_request do
    facility
    user { association(:user, facility: facility) }
    schedule_day { association(:schedule_day, schedule_month: association(:schedule_month, facility: facility)) }
    work_type { association(:work_type, facility: facility) }
  end
end
