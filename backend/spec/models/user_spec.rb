# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  let(:user) { build(:user, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(user).to be_valid
    end

    it "認証済みである" do
      expect(user).to be_confirmed
    end
  end

  context "name がない時" do
    before { user.name = nil }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "email がない時" do
    before { user.email = nil }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "password がない時" do
    before { user.password = nil }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "email が重複している時" do
    before { create(:user, email: user.email) }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "施設に紐づいているとき" do
    it "施設に属する" do
      expect(user.facility).to eq(facility)
    end
  end
end
