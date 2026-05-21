# frozen_string_literal: true

require "rails_helper"

RSpec.describe DayOffSlotRule, type: :model do
  let(:facility) { build(:facility) }
  let(:day_off_type) { build(:day_off_type, facility: facility) }

  let(:day_off_slot_rule) { build(:day_off_slot_rule, facility: facility, day_off_type: day_off_type) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(day_off_slot_rule).to be_valid
    end
  end

  context "facility がない時" do
    before { day_off_slot_rule.facility = nil }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "day_off_type がない時" do
    before { day_off_slot_rule.day_off_type = nil }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "weekday がない時" do
    before { day_off_slot_rule.weekday = nil }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "weekday が 0 未満の時" do
    before { day_off_slot_rule.weekday = -1 }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "weekday が 7 より大きい時" do
    before { day_off_slot_rule.weekday = 8 }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "weekday が整数でない時" do
    before { day_off_slot_rule.weekday = 1.5 }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "max_slots がない時" do
    before { day_off_slot_rule.max_slots = nil }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "max_slots が 0 未満の時" do
    before { day_off_slot_rule.max_slots = -1 }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "max_slots が整数でない時" do
    before { day_off_slot_rule.max_slots = 1.5 }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end

  context "同じ施設・同じ休み種別・同じ曜日のルールがすでにある時" do
    before { create(:day_off_slot_rule, facility: facility, day_off_type: day_off_type, weekday: 1) }

    it "無効である" do
      expect(day_off_slot_rule).to be_invalid
    end
  end
end
