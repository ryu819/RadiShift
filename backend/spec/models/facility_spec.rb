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

  context "施設を削除したとき" do
    it "ユーザーのfacility_idがnilになる" do
      facility.destroy!
      expect(user.reload.facility_id).to be_nil
    end
  end
end
