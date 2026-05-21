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
end
