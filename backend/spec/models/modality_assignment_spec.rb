# frozen_string_literal: true

require "rails_helper"

RSpec.describe ModalityAssignment, type: :model do
  let(:facility) { create(:facility) }
  let(:user) { create(:user, facility: facility) }
  let(:schedule_month) { create(:schedule_month, facility: facility) }
  let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
  let(:modality_type) { create(:modality_type, facility: facility, name: "CT") }

  let(:modality_assignment) { build(:modality_assignment, schedule_day: schedule_day, user: user, modality_type: modality_type) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(modality_assignment).to be_valid
    end
  end

  context "schedule_day がない時" do
    before { modality_assignment.schedule_day = nil }

    it "無効である" do
      expect(modality_assignment).to be_invalid
    end
  end

  context "user がない時" do
    before { modality_assignment.user = nil }

    it "無効である" do
      expect(modality_assignment).to be_invalid
    end
  end

  context "modality_type がない時" do
    before { modality_assignment.modality_type = nil }

    it "無効である" do
      expect(modality_assignment).to be_invalid
    end
  end

  context "同じ日付・同じモダリティ・同じユーザーの割当がすでにある時" do
    before { create(:modality_assignment, schedule_day: schedule_day, user: user, modality_type: modality_type) }

    it "無効である" do
      expect(modality_assignment).to be_invalid
    end
  end
end
