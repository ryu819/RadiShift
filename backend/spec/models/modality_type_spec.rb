# frozen_string_literal: true

require "rails_helper"

RSpec.describe ModalityType, type: :model do
  let(:modality_type) { build(:modality_type, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(modality_type).to be_valid
    end
  end

  context "name がない時" do
    before { modality_type.name = nil }

    it "無効である" do
      expect(modality_type).to be_invalid
    end
  end

  context "facility がない時" do
    before { modality_type.facility = nil }

    it "無効である" do
      expect(modality_type).to be_invalid
    end
  end

  context "name が同じ施設内で重複している時" do
    let(:facility) { create(:facility) }
    let(:modality_type) { build(:modality_type, facility: facility, name: "CT") }

    before { create(:modality_type, facility: facility, name: "CT") }

    it "無効である" do
      expect(modality_type).to be_invalid
    end
  end

  context "施設に紐づいている時" do
    it "施設に属する" do
      expect(modality_type.facility).to eq(facility)
    end
  end

  describe "ModalityType.active" do
    let(:facility) { create(:facility) }
    let!(:active_modality_type) { create(:modality_type, facility: facility, name: "CT", is_active: true) }
    let!(:inactive_modality_type) { create(:modality_type, facility: facility, name: "MRI", is_active: false) }

    it "有効なモダリティ種別だけを返す" do
      expect(ModalityType.active).to include(active_modality_type)
      expect(ModalityType.active).not_to include(inactive_modality_type)
    end
  end
end
