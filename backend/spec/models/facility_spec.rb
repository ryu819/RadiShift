# frozen_string_literal: true

require "rails_helper"

RSpec.describe Facility, type: :model do
  let(:facility) { build(:facility) }
  let(:user) { create(:user, facility: facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(facility).to be_valid
    end
  end

  context "name がない時" do
    before { facility.name = nil }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "name が重複している時" do
    before { create(:facility, name: facility.name) }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "施設を削除したとき" do
    it "ユーザーのfacility_idがnilになる" do
      facility.destroy!
      expect(user.reload.facility_id).to be_nil
    end
  end
end
