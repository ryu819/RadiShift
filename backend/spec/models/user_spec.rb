# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  let(:test_user) { build(:user) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(test_user).to be_valid
    end

    it "認証済みである" do
      expect(test_user).to be_confirmed
    end
  end

  context "name がない時" do
    before { test_user.name = nil }

    it "無効である" do
      expect(test_user).to be_invalid
    end
  end

  context "email がない時" do
    before { test_user.email = nil }

    it "無効である" do
      expect(test_user).to be_invalid
    end
  end

  context "password がない時" do
    before { test_user.password = nil }

    it "無効である" do
      expect(test_user).to be_invalid
    end
  end

  context "email が重複している時" do
    before { create(:user, email: test_user.email) }

    it "無効である" do
      expect(test_user).to be_invalid
    end
  end
end
