# frozen_string_literal: true

require "rails_helper"

RSpec.describe DemoEnvironment, type: :model do
  describe "#expired?" do
    it "作成から24時間未満なら期限切れではない" do
      demo_environment = create(:demo_environment, created_at: 23.hours.ago)

      expect(demo_environment.expired?).to be false
    end

    it "作成から24時間以上なら期限切れである" do
      demo_environment = create(:demo_environment, created_at: 24.hours.ago)

      expect(demo_environment.expired?).to be true
    end
  end

  describe ".expired" do
    it "作成から24時間以上経過したデモ環境だけを返す" do
      expired_environment = create(:demo_environment, created_at: 24.hours.ago)
      create(:demo_environment, created_at: 23.hours.ago)

      expect(DemoEnvironment.expired).to contain_exactly(expired_environment)
    end
  end
end
