# frozen_string_literal: true

require "rails_helper"

RSpec.describe WorkRequest, type: :model do
  let(:work_request) { build(:work_request) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(work_request).to be_valid
    end
  end

  context "user がない時" do
    before { work_request.user = nil }

    it "無効である" do
      expect(work_request).to be_invalid
    end
  end

  context "facility がない時" do
    before { work_request.facility = nil }

    it "無効である" do
      expect(work_request).to be_invalid
    end
  end

  context "schedule_day がない時" do
    before { work_request.schedule_day = nil }

    it "無効である" do
      expect(work_request).to be_invalid
    end
  end

  context "work_type がない時" do
    before { work_request.work_type = nil }

    it "無効である" do
      expect(work_request).to be_invalid
    end
  end

  describe "request_status" do
    it "申請状態の種類を持つ" do
      expect(WorkRequest.request_statuses).to eq(
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
    let(:work_type) { create(:work_type, facility: user.facility) }

    context "同じユーザー・対象日・勤務タイプの pending がすでにある時" do
      before do
        create(
          :work_request,
          facility: user.facility,
          user: user,
          schedule_day: schedule_day,
          work_type: work_type,
          request_status: :pending
        )
      end

      it "同じ pending は無効である" do
        duplicate_request = build(
          :work_request,
          facility: user.facility,
          user: user,
          schedule_day: schedule_day,
          work_type: work_type,
          request_status: :pending
        )

        expect(duplicate_request).to be_invalid
        expect(duplicate_request.errors[:schedule_day_id]).to be_present
      end
    end
  end
end
