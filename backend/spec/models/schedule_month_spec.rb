# frozen_string_literal: true

require "rails_helper"

RSpec.describe ScheduleMonth, type: :model do
  let(:schedule_month) { build(:schedule_month, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(schedule_month).to be_valid
    end
  end

  context "year がない時" do
    before { schedule_month.year = nil }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  context "month がない時" do
    before { schedule_month.month = nil }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  context "month が 1 未満の時" do
    before { schedule_month.month = 0 }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  context "month が 12 より大きい時" do
    before { schedule_month.month = 13 }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  context "monthly_days_off がない時" do
    before { schedule_month.monthly_days_off = nil }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  context "monthly_days_off が 0 未満の時" do
    before { schedule_month.monthly_days_off = -0.5 }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  context "monthly_days_off が 0 の時" do
    before { schedule_month.monthly_days_off = 0 }

    it "有効である" do
      expect(schedule_month).to be_valid
    end
  end

  context "monthly_days_off が 0.5 刻みの時" do
    it "有効である" do
      valid_values = [0, 0.5, 1, 1.5, 2]

      valid_values.each do |value|
        schedule_month.monthly_days_off = value
        expect(schedule_month).to be_valid
      end
    end
  end

  context "monthly_days_off が 0.5 刻みではない時" do
    before { schedule_month.monthly_days_off = 8.25 }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end

    it "エラーメッセージが追加される" do
      schedule_month.valid?

      expect(schedule_month.errors[:monthly_days_off]).to include(
        "は0.5刻みで入力してください"
      )
    end
  end

  context "施設に紐づいている時" do
    it "施設に属する" do
      expect(schedule_month.facility).to eq(facility)
    end
  end

  context "施設に紐づいていない時" do
    before { schedule_month.facility = nil }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end
end
