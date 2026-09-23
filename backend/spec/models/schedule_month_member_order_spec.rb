# frozen_string_literal: true

require "rails_helper"

RSpec.describe ScheduleMonthMemberOrder, type: :model do
  let(:schedule_month_member_order) { build(:schedule_month_member_order, schedule_month: schedule_month, user: user, display_order: 1) }
  let(:schedule_month) { create(:schedule_month) }
  let(:user) { create(:user, facility: schedule_month.facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(schedule_month_member_order).to be_valid
    end
  end

  context "schedule_month がない時" do
    before { schedule_month_member_order.schedule_month = nil }

    it "無効である" do
      expect(schedule_month_member_order).to be_invalid
    end
  end

  context "user がない時" do
    before { schedule_month_member_order.user = nil }

    it "無効である" do
      expect(schedule_month_member_order).to be_invalid
    end
  end

  context "display_order がない時" do
    before { schedule_month_member_order.display_order = nil }

    it "無効である" do
      expect(schedule_month_member_order).to be_invalid
    end
  end

  context "display_order が 0 の時" do
    before { schedule_month_member_order.display_order = 0 }

    it "無効である" do
      expect(schedule_month_member_order).to be_invalid
    end
  end

  context "display_order が負の整数の時" do
    before { schedule_month_member_order.display_order = -1 }

    it "無効である" do
      expect(schedule_month_member_order).to be_invalid
    end
  end

  context "display_order が整数ではない時" do
    before { schedule_month_member_order.display_order = 1.5 }

    it "無効である" do
      expect(schedule_month_member_order).to be_invalid
    end
  end

  context "同じschedule_monthとuserの組み合わせが存在する時" do
    before { create(:schedule_month_member_order, schedule_month: schedule_month, user: user, display_order: 1) }

    it "無効である" do
      duplicate_order = build(:schedule_month_member_order, schedule_month: schedule_month, user: user, display_order: 2)

      expect(duplicate_order).to be_invalid
    end
  end
end
