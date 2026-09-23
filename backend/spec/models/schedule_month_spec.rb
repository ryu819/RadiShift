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

  context "facility がない時" do
    before { schedule_month.facility = nil }

    it "無効である" do
      expect(schedule_month).to be_invalid
    end
  end

  describe "#capture_member_order!" do
    let(:facility) { create(:facility) }
    let(:schedule_month) { create(:schedule_month, facility: facility) }
    let!(:first_member) { create(:user, facility: facility, display_order: 1) }
    let!(:second_member) { create(:user, facility: facility, display_order: 2) }

    it "現在の施設メンバー順を保存する" do
      schedule_month.capture_member_order!

      orders = schedule_month.schedule_month_member_orders.order(:display_order)

      expect(orders.map(&:user_id)).to eq([first_member.id, second_member.id])
    end

    it "すでに固定されている場合は上書きしない" do
      schedule_month.capture_member_order!
      original_orders = schedule_month.schedule_month_member_orders.order(:display_order).pluck(:user_id, :display_order)
      first_member.update!(display_order: 2)
      second_member.update!(display_order: 1)
      schedule_month.capture_member_order!
      expect(schedule_month.schedule_month_member_orders.order(:display_order).pluck(:user_id, :display_order)).to eq(original_orders)
    end
  end

  describe "#append_member_to_fixed_order!" do
    let(:facility) { create(:facility) }
    let(:schedule_month) { create(:schedule_month, facility: facility) }
    let(:existing_member) { create(:user, facility: facility, display_order: 1) }
    let(:new_member) { create(:user, facility: facility, display_order: 2) }
    before { create(:schedule_month_member_order, schedule_month: schedule_month, user: existing_member, display_order: 1) }

    it "固定済み順の末尾へ追加する" do
      schedule_month.append_member_to_fixed_order!(new_member)
      expect(schedule_month.schedule_month_member_orders.find_by(user: new_member).display_order).to eq(2)
    end

    it "すでに固定順に存在する場合は元の順番を維持する" do
      schedule_month.append_member_to_fixed_order!(existing_member)
      expect(schedule_month.schedule_month_member_orders.find_by(user: existing_member).display_order).to eq(1)
    end
  end
end
