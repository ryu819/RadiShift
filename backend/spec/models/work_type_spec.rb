# frozen_string_literal: true

require "rails_helper"

RSpec.describe WorkType, type: :model do
  let(:work_type) { build(:work_type, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(work_type).to be_valid
    end
  end

  context "name がない時" do
    before { work_type.name = nil }

    it "無効である" do
      expect(work_type).to be_invalid
    end
  end

  context "facility がない時" do
    before { work_type.facility = nil }

    it "無効である" do
      expect(work_type).to be_invalid
    end
  end

  context "name が同じ施設内で重複している時" do
    let(:facility) { create(:facility) }
    let(:work_type) { build(:work_type, facility: facility, name: "日勤") }

    before { create(:work_type, facility: facility, name: "日勤") }

    it "無効である" do
      expect(work_type).to be_invalid
    end
  end

  context "施設に紐づいている時" do
    it "施設に属する" do
      expect(work_type.facility).to eq(facility)
    end
  end

  describe "WorkType.active" do
    let(:facility) { create(:facility) }
    let!(:active_work_type) { create(:work_type, facility: facility, name: "日勤", is_active: true) }
    let!(:inactive_work_type) { create(:work_type, facility: facility, name: "夜勤", is_active: false) }

    it "有効な勤務種別だけを返す" do
      expect(WorkType.active).to include(active_work_type)
      expect(WorkType.active).not_to include(inactive_work_type)
    end
  end
end
