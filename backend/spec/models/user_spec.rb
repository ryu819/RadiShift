# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  let(:user) { build(:user, facility: facility) }
  let(:facility) { build(:facility) }

  context "有効な属性を持つ時" do
    it "有効である" do
      expect(user).to be_valid
    end

    it "認証済みである" do
      expect(user).to be_confirmed
    end
  end

  context "name がない時" do
    before { user.name = nil }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "email がない時" do
    before { user.email = nil }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "password がない時" do
    before { user.password = nil }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "email が重複している時" do
    before { create(:user, email: user.email) }

    it "無効である" do
      expect(user).to be_invalid
    end
  end

  context "施設に紐づいているとき" do
    it "施設に属する" do
      expect(user.facility).to eq(facility)
    end
  end

  describe "#cleanup_shift_data_for_facility_departure!" do
    subject(:cleanup) { user.cleanup_shift_data_for_facility_departure! }

    let(:facility) { create(:facility) }
    let(:user) { create(:user, facility: facility) }
    let(:work_type) { create(:work_type, facility: facility) }
    let(:day_off_type) { create(:day_off_type, facility: facility) }
    let(:modality_type) { create(:modality_type, facility: facility) }

    def create_schedule_day(date, facility:)
      schedule_month = create(
        :schedule_month,
        facility: facility,
        date: date
      )

      create(:schedule_day, schedule_month: schedule_month, date: date)
    end

    context "勤務割当がある時" do
      let(:past_day) { create_schedule_day(Date.current.prev_month.beginning_of_month, facility: facility) }
      let(:current_day) { create_schedule_day(Date.current.beginning_of_month, facility: facility) }
      let(:future_day) { create_schedule_day(Date.current.next_month.beginning_of_month, facility: facility) }

      let!(:past_work) { create(:work_assignment, user: user, schedule_day: past_day, work_type: work_type) }
      let!(:current_work) { create(:work_assignment, user: user, schedule_day: current_day, work_type: work_type) }
      let!(:future_work) { create(:work_assignment, user: user, schedule_day: future_day, work_type: work_type) }

      it "過去・当月を残し、来月以降を削除する" do
        cleanup

        expect(user.work_assignments.ids).to contain_exactly(
          past_work.id,
          current_work.id
        )
      end
    end

    context "休み割当がある時" do
      let(:past_day) { create_schedule_day(Date.current.prev_month.beginning_of_month, facility: facility) }
      let(:current_day) { create_schedule_day(Date.current.beginning_of_month, facility: facility) }
      let(:future_day) { create_schedule_day(Date.current.next_month.beginning_of_month, facility: facility) }

      let!(:past_day_off) { create(:day_off_assignment, user: user, schedule_day: past_day, day_off_type: day_off_type) }
      let!(:current_day_off) { create(:day_off_assignment, user: user, schedule_day: current_day, day_off_type: day_off_type) }
      let!(:future_day_off) { create(:day_off_assignment, user: user, schedule_day: future_day, day_off_type: day_off_type) }

      it "過去・当月を残し、来月以降を削除する" do
        cleanup

        expect(user.day_off_assignments.ids).to contain_exactly(
          past_day_off.id,
          current_day_off.id
        )
      end
    end

    context "モダリティ割当がある時" do
      let(:past_day) { create_schedule_day(Date.current.prev_month.beginning_of_month, facility: facility) }
      let(:current_day) { create_schedule_day(Date.current.beginning_of_month, facility: facility) }
      let(:future_day) { create_schedule_day(Date.current.next_month.beginning_of_month, facility: facility) }

      let!(:past_modality) { create(:modality_assignment, user: user, schedule_day: past_day, modality_type: modality_type) }
      let!(:current_modality) { create(:modality_assignment, user: user, schedule_day: current_day, modality_type: modality_type) }
      let!(:future_modality) { create(:modality_assignment, user: user, schedule_day: future_day, modality_type: modality_type) }

      it "過去・当月を残し、来月以降を削除する" do
        cleanup

        expect(user.modality_assignments.ids).to contain_exactly(
          past_modality.id,
          current_modality.id
        )
      end
    end

    context "勤務申請がある時" do
      let(:schedule_day) { create_schedule_day(Date.current.next_month.beginning_of_month, facility: facility) }

      let!(:pending_work) { create(:work_request, facility: facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :pending) }
      let!(:approved_work) do
        create(:work_request, facility: facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :approved)
      end
      let!(:rejected_work) do
        create(:work_request, facility: facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :rejected)
      end

      it "pendingだけを削除する" do
        cleanup

        expect(user.work_requests.ids).to contain_exactly(
          approved_work.id,
          rejected_work.id
        )
      end
    end

    context "休み申請がある時" do
      let(:schedule_day) { create_schedule_day(Date.current.next_month.beginning_of_month, facility: facility) }

      let!(:pending_day_off) do
        create(:day_off_request, facility: facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :pending)
      end
      let!(:approved_day_off) do
        create(:day_off_request, facility: facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :approved)
      end
      let!(:rejected_day_off) do
        create(:day_off_request, facility: facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :rejected)
      end

      it "pendingだけを削除する" do
        cleanup

        expect(user.day_off_requests.ids).to contain_exactly(
          approved_day_off.id,
          rejected_day_off.id
        )
      end
    end
  end
end
