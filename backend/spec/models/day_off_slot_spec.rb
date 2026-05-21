# frozen_string_literal: true

require "rails_helper"

RSpec.describe DayOffSlot, type: :model do
  let(:facility) { build(:facility) }
  let(:schedule_month) { build(:schedule_month, facility: facility) }
  let(:schedule_day) { build(:schedule_day, schedule_month: schedule_month) }
  let(:day_off_type) { build(:day_off_type, facility: facility) }
  let(:day_off_slot) { build(:day_off_slot, schedule_day: schedule_day, day_off_type: day_off_type) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(day_off_slot).to be_valid
    end
  end

  context "schedule_day がない時" do
    before { day_off_slot.schedule_day = nil }

    it "無効である" do
      expect(day_off_slot).to be_invalid
    end
  end

  context "day_off_type がない時" do
    before { day_off_slot.day_off_type = nil }

    it "無効である" do
      expect(day_off_slot).to be_invalid
    end
  end

  context "max_slots がない時" do
    before { day_off_slot.max_slots = nil }

    it "無効である" do
      expect(day_off_slot).to be_invalid
    end
  end

  context "max_slots が 0 未満の時" do
    before { day_off_slot.max_slots = -1 }

    it "無効である" do
      expect(day_off_slot).to be_invalid
    end
  end

  context "max_slots が整数でない時" do
    before { day_off_slot.max_slots = 1.5 }

    it "無効である" do
      expect(day_off_slot).to be_invalid
    end
  end

  context "同じ日付に同じ休み種別の枠がすでにある時" do
    before { create(:day_off_slot, schedule_day: schedule_day, day_off_type: day_off_type) }

    it "無効である" do
      expect(day_off_slot).to be_invalid
    end
  end
end
