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

  context "color_code がない時" do
    before { day_off_type.color_code = nil }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end
  end

  context "day_off_unit が 0.5 刻みの時" do
    it "有効である" do
      valid_values = [0, 0.5, 1, 1.5, 2]

      valid_values.each do |value|
        day_off_type.day_off_unit = value
        expect(day_off_type).to be_valid
      end
    end
  end

  context "day_off_unit が 0.5 刻みではない時" do
    before { day_off_type.day_off_unit = 1.2 }

    it "無効である" do
      expect(day_off_type).to be_invalid
    end

    it "エラーメッセージが追加される" do
      day_off_type.valid?

      expect(day_off_type.errors[:day_off_unit]).to include(
        "は0.5刻みで入力してください"
      )
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
