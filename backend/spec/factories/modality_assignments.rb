# frozen_string_literal: true

FactoryBot.define do
  factory :modality_assignment do
    transient do
      facility { association(:facility) }
    end

    user { association(:user, facility: facility) }
    schedule_day { association(:schedule_day, schedule_month: association(:schedule_month, facility: facility)) }
    modality_type { association(:modality_type, facility: facility) }
  end
end
