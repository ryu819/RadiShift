# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::Shifts", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/current/shifts/:id" do
    subject { get(api_v1_current_shift_path(schedule_month), headers: { "Authorization": token }) }

    let(:schedule_month) do
      create(:schedule_month, facility: user.facility, year: 2026, month: 9, status: schedule_month_status)
    end

    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

    let(:schedule_month_status) { :published }
    context "シフトが公開済みの時" do
      let(:work_type) { create(:work_type, facility: user.facility) }
      let(:other_user) { create(:user, facility: user.facility) }
      let(:other_schedule_month) do
        create(:schedule_month, facility: user.facility, year: 2026, month: 10, status: :published)
      end

      let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }
      let!(:own_work_assignment) do
        create(:work_assignment, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type)
      end

      let!(:other_user_work_assignment) do
        create(:work_assignment, facility: user.facility, user: other_user, schedule_day: schedule_day, work_type: work_type)
      end

      let!(:other_month_work_assignment) do
        create(:work_assignment, facility: user.facility, user: user, schedule_day: other_schedule_day, work_type: work_type)
      end

      it "選択月にある自分の勤務割当だけを返す" do
        subject
        res = JSON.parse(response.body)
        work_assignment_ids = res["work_assignments"].map { |work_assignment| work_assignment["id"] }
        expect(work_assignment_ids).to include(own_work_assignment.id)
        expect(work_assignment_ids).not_to include(other_user_work_assignment.id)
        expect(work_assignment_ids).not_to include(other_month_work_assignment.id)
        expect(res["work_assignments"].first["user_id"]).to eq(user.id)
        expect(res["work_assignments"].first["schedule_day_id"]).to eq(schedule_day.id)
        expect(res["work_assignments"].first["work_type"]).to be_present
        expect(response).to have_http_status(:ok)
      end
    end

    context "シフトが公開前の時" do
      let(:work_type) { create(:work_type, facility: user.facility) }
      let(:schedule_month_status) { :accepting_requests }

      let!(:work_assignment) do
        create(:work_assignment, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type)
      end

      it "勤務割当を空配列で返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["work_assignments"]).to eq([])
        expect(response).to have_http_status(:ok)
      end
    end

    context "休み割当がある時" do
      let(:day_off_type) { create(:day_off_type, facility: user.facility) }
      let(:other_user) { create(:user, facility: user.facility) }
      let(:other_schedule_month) do
        create(:schedule_month, facility: user.facility, year: 2026, month: 10, status: :published)
      end

      let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }

      let!(:own_day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type)
      end

      let!(:other_user_day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: other_user, schedule_day: schedule_day, day_off_type: day_off_type)
      end

      let!(:other_month_day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: user, schedule_day: other_schedule_day, day_off_type: day_off_type)
      end

      it "公開状態に関係なく選択月にある自分の休み割当だけを返す" do
        subject
        res = JSON.parse(response.body)
        day_off_assignment_ids = res["day_off_assignments"].map { |day_off_assignment| day_off_assignment["id"] }
        expect(day_off_assignment_ids).to include(own_day_off_assignment.id)
        expect(day_off_assignment_ids).not_to include(other_user_day_off_assignment.id)
        expect(day_off_assignment_ids).not_to include(other_month_day_off_assignment.id)
        expect(res["day_off_assignments"].first["user_id"]).to eq(user.id)
        expect(res["day_off_assignments"].first["schedule_day_id"]).to eq(schedule_day.id)
        expect(res["day_off_assignments"].first["day_off_type"]).to be_present
        expect(response).to have_http_status(:ok)
      end
    end

    context "休み枠が設定されている時" do
      let(:active_day_off_type) { create(:day_off_type, facility: user.facility, is_active: true, uses_slot: true) }

      let(:inactive_day_off_type) { create(:day_off_type, facility: user.facility, is_active: false, uses_slot: true) }

      let(:no_slot_day_off_type) { create(:day_off_type, facility: user.facility, is_active: true, uses_slot: false) }

      let!(:active_day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: active_day_off_type, max_slots: 3) }

      let!(:inactive_day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: inactive_day_off_type, max_slots: 3) }

      let!(:no_slot_day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: no_slot_day_off_type, max_slots: 3) }

      let!(:first_day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: user, schedule_day: schedule_day, day_off_type: active_day_off_type)
      end

      it "有効かつ枠を使用する休みタイプのみの残り枠を返す" do
        subject
        res = JSON.parse(response.body)
        day_off_slot_ids = res["day_off_slots"].map { |day_off_slot| day_off_slot["id"] }
        expect(day_off_slot_ids).to include(active_day_off_slot.id)
        expect(day_off_slot_ids).not_to include(inactive_day_off_slot.id)
        expect(day_off_slot_ids).not_to include(no_slot_day_off_slot.id)
        expect(res["day_off_slots"].first["max_slots"]).to eq(3)
        expect(res["day_off_slots"].first["remaining_slots"]).to eq(2)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:schedule_month) { create(:schedule_month) }

      it "not_foundエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
