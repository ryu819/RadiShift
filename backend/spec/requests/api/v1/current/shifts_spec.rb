# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::Shifts", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/current/shifts/:id" do
    subject { get(api_v1_current_shift_path(schedule_month), headers: { "Authorization": token }) }

    let(:schedule_month) do
      create(:schedule_month, date: Date.current, facility: user.facility, is_published: schedule_month_is_published)
    end

    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

    let(:schedule_month_is_published) { true }
    context "シフトが公開済みの時" do
      let(:work_type) { create(:work_type, facility: user.facility) }
      let(:other_user) { create(:user, facility: user.facility) }
      let(:other_schedule_month) do
        create(:schedule_month, date: Date.current.next_month, facility: user.facility, is_published: true)
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
      let(:schedule_month_is_published) { false }

      context "勤務割当がある時" do
        let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }
        let(:work_request) do
          create(:work_request, user: user, facility: user.facility, schedule_day: schedule_day, work_type: work_type, request_status: :approved)
        end
        let!(:request_based_work_assignment) do
          create(:work_assignment, user: user, schedule_day: schedule_day, work_type: work_type, work_request: work_request)
        end
        let!(:admin_work_assignment) do
          create(:work_assignment, user: user, schedule_day: schedule_day, work_type: create(:work_type, facility: user.facility), work_request: nil)
        end

        it "申請由来の勤務割当だけを返す" do
          subject
          res = JSON.parse(response.body)
          work_assignment_ids = res["work_assignments"].map { |assignment| assignment["id"] }
          expect(work_assignment_ids).to include(request_based_work_assignment.id)
          expect(work_assignment_ids).not_to include(admin_work_assignment.id)
          expect(response).to have_http_status(:ok)
        end
      end

      context "休み割当がある時" do
        let(:day_off_type) { create(:day_off_type, facility: user.facility) }
        let(:day_off_request) do
          create(:day_off_request, user: user, facility: user.facility, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :approved)
        end
        let!(:request_based_day_off_assignment) do
          create(:day_off_assignment, user: user, schedule_day: schedule_day, day_off_type: day_off_type, day_off_request: day_off_request)
        end
        let!(:admin_day_off_assignment) do
          create(:day_off_assignment, user: user, schedule_day: schedule_day, day_off_type: create(:day_off_type, facility: user.facility),
                                      day_off_request: nil)
        end

        it "申請由来の休み割当だけを返す" do
          subject
          res = JSON.parse(response.body)
          day_off_assignment_ids = res["day_off_assignments"].map { |assignment| assignment["id"] }
          expect(day_off_assignment_ids).to include(request_based_day_off_assignment.id)
          expect(day_off_assignment_ids).not_to include(admin_day_off_assignment.id)
          expect(response).to have_http_status(:ok)
        end
      end

      context "モダリティ割当がある時" do
        let!(:modality_assignment) do
          create(:modality_assignment, user: user, schedule_day: schedule_day, modality_type: create(:modality_type, facility: user.facility))
        end
        it "モダリティ割当を返さない" do
          subject
          res = JSON.parse(response.body)
          expect(res["modality_assignments"]).to eq([])
        end
      end
    end

    context "休み割当がある公開済みシフトの時" do
      let(:day_off_type) { create(:day_off_type, facility: user.facility) }
      let(:other_user) { create(:user, facility: user.facility) }
      let(:other_schedule_month) do
        create(:schedule_month, date: Date.current.next_month, facility: user.facility, is_published: true)
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

      it "選択月にある自分の休み割当だけを返す" do
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

    context "モダリティ割当がある公開済みシフトの時" do
      let(:modality_type) { create(:modality_type, facility: user.facility) }
      let(:other_user) { create(:user, facility: user.facility) }
      let!(:own_modality_assignment) { create(:modality_assignment, user: user, schedule_day: schedule_day, modality_type: modality_type) }
      let!(:other_user_modality_assignment) { create(:modality_assignment, user: other_user, schedule_day: schedule_day, modality_type: modality_type) }
      it "選択月にある自分のモダリティ割当だけを返す" do
        subject
        res = JSON.parse(response.body)
        modality_assignment_ids = res["modality_assignments"].map { |modality_assignment| modality_assignment["id"] }
        expect(modality_assignment_ids).to include(own_modality_assignment.id)
        expect(modality_assignment_ids).not_to include(other_user_modality_assignment.id)
        expect(res["modality_assignments"].first["user_id"]).to eq(user.id)
        expect(res["modality_assignments"].first["schedule_day_id"]).to eq(schedule_day.id)
        expect(res["modality_assignments"].first["modality_type"]).to be_present
        expect(response).to have_http_status(:ok)
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
