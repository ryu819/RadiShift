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

  context "Schedule_monthに紐づいている時" do
    it "Schedule_monthに属する" do
      expect(schedule_day.schedule_month).to eq(schedule_month)
    end
  end

  context "Schedule_monthに紐づいていない時" do
    before { schedule_day.schedule_month = nil }

    it "無効である" do
      expect(schedule_day).to be_invalid
    end
  end

  describe "holiday_nameメソッド" do
    context "祝日の時" do
      let(:schedule_day) { build(:schedule_day, :holiday) }

      it "祝日名を返す" do
        expect(schedule_day.holiday_name).to eq("元日")
      end
    end

    context "祝日ではない時" do
      it "nil を返す" do
        expect(schedule_day.holiday_name).to be_nil
      end
    end

    context "date がない時" do
      before { schedule_day.date = nil }

      it "nil を返す" do
        expect(schedule_day.holiday_name).to be_nil
      end
    end
  end

  describe "public_holiday?メソッド" do
    context "祝日の時" do
      let(:schedule_day) { build(:schedule_day, :holiday) }

      it "true を返す" do
        expect(schedule_day.public_holiday?).to be true
      end
    end

    context "祝日ではない時" do
      it "false を返す" do
        expect(schedule_day.public_holiday?).to be false
      end
    end

    context "date がない時" do
      before { schedule_day.date = nil }

      it "false を返す" do
        expect(schedule_day.public_holiday?).to be false
      end
    end
  end

  describe "weekday_typeメソッド" do
    context "祝日の時" do
      let(:schedule_day) { build(:schedule_day, :holiday) }
      it "7 を返す" do
        expect(schedule_day.weekday_type).to eq(7)
      end
    end

    context "祝日ではない時" do
      it "曜日番号を返す" do
        expect(schedule_day.weekday_type).to eq(5)
      end
    end

    context "date がない時" do
      before { schedule_day.date = nil }

      it "nil を返す" do
        expect(schedule_day.weekday_type).to be_nil
      end
    end
  end
end
