# frozen_string_literal: true

require "rails_helper"

RSpec.describe DayOffAssignment, type: :model do
  let(:facility) { create(:facility) }
  let(:user) { create(:user, facility: facility) }
  let(:schedule_month) { create(:schedule_month, facility: facility) }
  let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
  let(:day_off_type) { create(:day_off_type, facility: facility, name: "休み") }

  let(:day_off_assignment) { build(:day_off_assignment, schedule_day: schedule_day, user: user, day_off_type: day_off_type) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(day_off_assignment).to be_valid
    end
  end

  context "schedule_day がない時" do
    before { day_off_assignment.schedule_day = nil }

    it "無効である" do
      expect(day_off_assignment).to be_invalid
    end
  end

  context "user がない時" do
    before { day_off_assignment.user = nil }

    it "無効である" do
      expect(day_off_assignment).to be_invalid
    end
  end

  context "day_off_type がない時" do
    before { day_off_assignment.day_off_type = nil }

    it "無効である" do
      expect(day_off_assignment).to be_invalid
    end
  end

  context "同じ日付・同じ休み種別・同じユーザーの割当がすでにある時" do
    before { create(:day_off_assignment, schedule_day: schedule_day, user: user, day_off_type: day_off_type) }

    it "無効である" do
      expect(day_off_assignment).to be_invalid
    end
  end
end
