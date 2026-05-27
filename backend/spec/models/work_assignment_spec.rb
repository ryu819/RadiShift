# frozen_string_literal: true

require "rails_helper"

RSpec.describe WorkAssignment, type: :model do
  let(:facility) { create(:facility) }
  let(:user) { create(:user, facility: facility) }
  let(:schedule_month) { create(:schedule_month, facility: facility) }
  let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
  let(:work_type) { create(:work_type, facility: facility, name: "日勤") }

  let(:work_assignment) { build(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(work_assignment).to be_valid
    end
  end

  context "schedule_day がない時" do
    before { work_assignment.schedule_day = nil }

    it "無効である" do
      expect(work_assignment).to be_invalid
    end
  end

  context "user がない時" do
    before { work_assignment.user = nil }

    it "無効である" do
      expect(work_assignment).to be_invalid
    end
  end

  context "work_type がない時" do
    before { work_assignment.work_type = nil }

    it "無効である" do
      expect(work_assignment).to be_invalid
    end
  end

  context "同じ日付・同じ勤務種別・同じユーザーの割当がすでにある時" do
    before { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type) }

    it "無効である" do
      expect(work_assignment).to be_invalid
    end
  end
end
