# frozen_string_literal: true

require "rails_helper"

RSpec.describe Facility, type: :model do
  let(:facility) { build(:facility) }
  let(:user) { create(:user, facility: facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(facility).to be_valid
    end
  end

  context "name がない時" do
    before { facility.name = nil }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "name が重複している時" do
    before { create(:facility, name: facility.name) }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "request_deadline_day がない時" do
    before { facility.request_deadline_day = nil }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "request_deadline_day が1未満の時" do
    before { facility.request_deadline_day = 0 }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "request_deadline_day が31を超えている時" do
    before { facility.request_deadline_day = 32 }

    it "無効である" do
      expect(facility).to be_invalid
    end
  end

  context "デモ環境に紐づいている時" do
    let(:demo_environment) { create(:demo_environment) }
    let(:facility) { create(:facility, demo_environment: demo_environment) }

    it "デモ環境に属する" do
      expect(facility.demo_environment).to eq(demo_environment)
    end
  end

  describe "#request_deadline_date_for" do
    context "締切日が前月に存在する時" do
      before { facility.request_deadline_day = 15 }

      it "対象月の前月の締切日を返す" do
        target_date = Date.new(2026, 8, 20)

        res = facility.request_deadline_date_for(target_date)

        expect(res).to eq(Date.new(2026, 7, 15))
      end
    end

    context "設定した締切日が前月に存在しない時" do
      before { facility.request_deadline_day = 31 }

      it "前月の月末日を返す" do
        target_date = Date.new(2026, 3, 10)

        res = facility.request_deadline_date_for(target_date)

        expect(res).to eq(Date.new(2026, 2, 28))
      end
    end
  end

  describe "#next_request_deadline" do
    context "今月の締切日前の時" do
      it "翌月シフトの締切情報を返す" do
        date = Date.new(2026, 7, 10)
        res = facility.next_request_deadline(date)
        expect(res).to eq(
          {
            year: 2026,
            month: 8,
            deadline_date: Date.new(2026, 7, 15),
            days_remaining: 5
          }
        )
      end
    end

    context "今月の締切日を過ぎている時" do
      it "翌々月シフトの締切情報を返す" do
        date = Date.new(2026, 7, 20)
        res = facility.next_request_deadline(date)
        expect(res).to eq(
          {
            year: 2026,
            month: 9,
            deadline_date: Date.new(2026, 8, 15),
            days_remaining: 26
          }
        )
      end
    end
  end

  describe "#active_members_in_display_order" do
    let(:facility) { create(:facility) }

    let!(:second_member) { create(:user, facility: facility, display_order: 2) }

    let!(:first_member) { create(:user, facility: facility, display_order: 1) }

    let!(:deleted_member) { create(:user, facility: facility, display_order: 3, is_deleted: true) }

    it "削除済みを除いてdisplay_order順で返す" do
      expect(
        facility.active_members_in_display_order.ids
      ).to eq(
        [
          first_member.id,
          second_member.id
        ]
      )
    end
  end

  describe "#next_member_display_order" do
    let(:facility) { create(:facility) }

    before do
      create(:user, facility: facility, display_order: 2)

      create(:user, facility: facility, display_order: 5)
    end

    it "現在の最大値+1を返す" do
      expect(facility.next_member_display_order).to eq(6)
    end
  end

  context "施設を削除したとき" do
    it "ユーザーのfacility_idがnilになる" do
      facility.destroy!
      expect(user.reload.facility_id).to be_nil
    end
  end
end
