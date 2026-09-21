# frozen_string_literal: true

require "rails_helper"

RSpec.describe ScheduleDay, type: :model do
  let(:schedule_day) { build(:schedule_day, schedule_month: schedule_month) }
  let(:schedule_month) { build(:schedule_month, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(schedule_day).to be_valid
    end
  end

  context "date がない時" do
    before { schedule_day.date = nil }

    it "無効である" do
      expect(schedule_day).to be_invalid
    end
  end

  context "Schedule_month がない時" do
    before { schedule_day.schedule_month = nil }

    it "無効である" do
      expect(schedule_day).to be_invalid
    end
  end

  describe "#holiday_name" do
    context "祝日の時" do
      let(:schedule_day) { build(:schedule_day, date: Date.new(2026, 1, 1)) }

      it "祝日名を返す" do
        expect(schedule_day.holiday_name).to eq("元日")
      end
    end

    context "祝日ではない時" do
      let(:schedule_day) { build(:schedule_day, date: Date.new(2026, 7, 13)) }
      it "nil を返す" do
        expect(schedule_day.holiday_name).to be_nil
      end
    end
  end

  describe "#day" do
    let(:schedule_day) { build(:schedule_day, date: Date.new(2026, 1, 1)) }
    it "日にちを返す" do
      expect(schedule_day.day).to eq(1)
    end
  end

  describe "#weekday_label" do
    weekday_cases = [
      [Date.new(2026, 7, 12), "日"],
      [Date.new(2026, 7, 13), "月"],
      [Date.new(2026, 7, 14), "火"],
      [Date.new(2026, 7, 15), "水"],
      [Date.new(2026, 7, 16), "木"],
      [Date.new(2026, 7, 17), "金"],
      [Date.new(2026, 7, 18), "土"]
    ]

    weekday_cases.each do |target_date, expected_label|
      it "#{target_date}の曜日として#{expected_label}を返す" do
        schedule_day.date = target_date

        expect(schedule_day.weekday_label).to eq(expected_label)
      end
    end
  end

  describe "#is_sunday" do
    context "日曜日の時" do
      before { schedule_day.date = Date.new(2026, 7, 12) }

      it "trueを返す" do
        expect(schedule_day.is_sunday).to be(true)
      end
    end

    context "日曜日ではない時" do
      before { schedule_day.date = Date.new(2026, 7, 13) }

      it "falseを返す" do
        expect(schedule_day.is_sunday).to be(false)
      end
    end
  end

  describe "#is_saturday" do
    context "土曜日の時" do
      before { schedule_day.date = Date.new(2026, 7, 18) }

      it "trueを返す" do
        expect(schedule_day.is_saturday).to be(true)
      end
    end

    context "土曜日ではない時" do
      before { schedule_day.date = Date.new(2026, 7, 13) }

      it "falseを返す" do
        expect(schedule_day.is_saturday).to be(false)
      end
    end
  end
end
