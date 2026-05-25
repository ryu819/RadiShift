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
end
