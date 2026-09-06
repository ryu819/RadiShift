# frozen_string_literal: true

require "rails_helper"

RSpec.describe DayOffRequest, type: :model do
  let(:day_off_request) { build(:day_off_request) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(day_off_request).to be_valid
    end
  end

  context "user がない時" do
    before { day_off_request.user = nil }

    it "無効である" do
      expect(day_off_request).to be_invalid
    end
  end

  context "facility がない時" do
    before { day_off_request.facility = nil }

    it "無効である" do
      expect(day_off_request).to be_invalid
    end
  end

  context "schedule_day がない時" do
    before { day_off_request.schedule_day = nil }

    it "無効である" do
      expect(day_off_request).to be_invalid
    end
  end

  context "day_off_type がない時" do
    before { day_off_request.day_off_type = nil }

    it "無効である" do
      expect(day_off_request).to be_invalid
    end
  end

  describe "request_status" do
    it "申請状態の種類を持つ" do
      expect(DayOffRequest.request_statuses).to eq(
        {
          "pending" => 0,
          "approved" => 1,
          "rejected" => 2
        }
      )
    end
  end

  describe "pending の重複" do
    let(:user) { create(:user, :with_facility) }
    let(:schedule_month) { create(:schedule_month, facility: user.facility) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }

    context "同じユーザー・対象日・休みタイプの pending がすでにある時" do
      before do
        create(
          :day_off_request,
          facility: user.facility,
          user: user,
          schedule_day: schedule_day,
          day_off_type: day_off_type,
          request_status: :pending
        )
      end

      it "同じ pending は無効である" do
        duplicate_request = build(
          :day_off_request,
          facility: user.facility,
          user: user,
          schedule_day: schedule_day,
          day_off_type: day_off_type,
          request_status: :pending
        )

        expect(duplicate_request).to be_invalid
        expect(duplicate_request.errors[:schedule_day_id]).to be_present
      end
    end
  end
end
