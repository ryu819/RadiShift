# frozen_string_literal: true

require "rails_helper"

RSpec.describe DayOffType, type: :model do
  let(:day_off_type) { build(:day_off_type, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(day_off_type).to be_valid
    end
  end

  context "name がない時" do
    before { day_off_type.name = nil }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end
  end

  context "day_off_unit がない時" do
    before { day_off_type.day_off_unit = nil }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end
  end

  context "day_off_unit が 0 未満の時" do
    before { day_off_type.day_off_unit = -0.5 }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end
  end

  context "facility がない時" do
    before { day_off_type.facility = nil }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end
  end

  context "name が同じ施設内で重複している時" do
    let(:facility) { create(:facility) }
    let(:day_off_type) { build(:day_off_type, facility: facility, name: "休み") }

    before { create(:day_off_type, facility: facility, name: "休み") }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end
  end

  context "施設に紐づいている時" do
    it "施設に属する" do
      expect(day_off_type.facility).to eq(facility)
    end
  end

  describe "DayOffType.active" do
    let(:facility) { create(:facility) }
    let!(:active_day_off_type) { create(:day_off_type, facility: facility, name: "休み", is_active: true) }
    let!(:inactive_day_off_type) { create(:day_off_type, facility: facility, name: "午後休み", is_active: false) }

    it "有効な休み種別だけを返す" do
      expect(DayOffType.active).to include(active_day_off_type)
      expect(DayOffType.active).not_to include(inactive_day_off_type)
    end
  end
end
