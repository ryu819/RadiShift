# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { "田中太郎" }
    sequence(:email) { |n| "#{n}_test@example.com" }
    password { "password" }
    is_admin { false }
    confirmed_at { Time.current }

    trait :with_facility do
      facility
    end

    trait :admin do
      is_admin { true }
      facility
    end

    trait :with_avatar do
      after(:build) do |user|
        file = Rack::Test::UploadedFile.new(
          Rails.root.join("spec/fixtures/files/test.png"),
          "image/png"
        )

        user.avatar_image.attach(file)
      end
    end
  end
end
