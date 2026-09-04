# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Admin::MasterShifts", type: :request do
  let(:token) { login_and_get_token(user) }
  describe "GET /api/v1/admin/master_shift" do
    subject do
      get(api_v1_admin_master_shift_path(schedule_month), headers: { "Authorization": token })
    end

    let(:schedule_month) do
      create(:schedule_month, facility: user.facility, year: 2026,
                              month: 9)
    end

    let(:first_day) { create(:schedule_day, schedule_month: schedule_month) }

    let(:member) { create(:user, facility: user.facility) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      let!(:work_assignment) { create(:work_assignment, facility: user.facility, user: member, schedule_day: first_day) }
      let!(:day_off_assignment) { create(:day_off_assignment, facility: user.facility, user: member, schedule_day: first_day) }

      it "勤務割当をユーザーと日付でグループ化して返す" do
        subject

        res = JSON.parse(response.body)
        grouped_assignments = res["work_assignments_by_user_and_day"]

        member_assignments = grouped_assignments[member.id.to_s][first_day.id.to_s]
        member_assignment = member_assignments.first

        expect(member_assignment["id"]).to eq(work_assignment.id)
        expect(member_assignment["work_type"]["id"]).to eq(
          work_assignment.work_type_id
        )

        expect(response).to have_http_status(:ok)
      end

      it "休み割当をユーザーと日付でグループ化して返す" do
        subject

        res = JSON.parse(response.body)
        grouped_assignments = res["day_off_assignments_by_user_and_day"]

        member_assignments = grouped_assignments[member.id.to_s][first_day.id.to_s]
        member_assignment = member_assignments.first

        expect(member_assignment["id"]).to eq(day_off_assignment.id)
        expect(member_assignment["day_off_type"]["id"]).to eq(
          day_off_assignment.day_off_type_id
        )

        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }
      let!(:work_assignment) { create(:work_assignment) }

      it "forbiddenエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:work_assignment) { create(:work_assignment) }
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
