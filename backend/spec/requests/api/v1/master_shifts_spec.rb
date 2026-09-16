# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::MasterShifts", type: :request do
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/master_shifts" do
    subject { get(api_v1_master_shifts_path, headers: { "Authorization": token }) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      let!(:february_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 2, is_published: false) }
      let!(:january_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1, is_published: true) }
      let!(:other_facility_schedule_month) { create(:schedule_month, year: 2026, month: 3, is_published: true) }

      it "公開状態に関係なく自施設の対象月を年月順で返す" do
        subject
        res = JSON.parse(response.body)
        ids = res.map { |schedule_month| schedule_month["id"] }

        expect(ids).to eq([january_schedule_month.id, february_schedule_month.id])
        expect(ids).not_to include(other_facility_schedule_month.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "一般メンバーである時" do
      let(:user) { create(:user, :with_facility) }
      let!(:published_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1, is_published: true) }
      let!(:unpublished_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 2, is_published: false) }
      let!(:other_facility_schedule_month) { create(:schedule_month, year: 2026, month: 3, is_published: true) }

      it "自施設の公開済み対象月だけ返す" do
        subject
        res = JSON.parse(response.body)
        ids = res.map { |schedule_month| schedule_month["id"] }
        expect(ids).to eq([published_schedule_month.id])
        expect(ids).not_to include(unpublished_schedule_month.id, other_facility_schedule_month.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }

      it "not_foundエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "GET /api/v1/master_shifts/:id" do
    subject { get(api_v1_master_shift_path(schedule_month), headers: { "Authorization": token }) }

    context "管理者が未公開月を指定した時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, is_published: false) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
      let(:member) { create(:user, facility: user.facility) }
      let(:work_type) { create(:work_type, facility: user.facility) }
      let(:day_off_type) { create(:day_off_type, facility: user.facility) }

      let(:work_request) { create(:work_request, facility: user.facility, user: member, schedule_day: schedule_day, work_type: work_type) }

      let(:day_off_request) { create(:day_off_request, facility: user.facility, user: member, schedule_day: schedule_day, day_off_type: day_off_type) }

      let!(:work_assignment) do
        create(:work_assignment, facility: user.facility, user: member, schedule_day: schedule_day, work_type: work_type, work_request: work_request)
      end
      let!(:day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: member, schedule_day: schedule_day, day_off_type: day_off_type,
                                    day_off_request: day_off_request)
      end

      it "勤務割当にwork_request_idを含めて返す" do
        subject
        res = JSON.parse(response.body)
        assignment = res["work_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        expect(assignment["id"]).to eq(work_assignment.id)
        expect(assignment["work_request_id"]).to eq(work_request.id)
        expect(response).to have_http_status(:ok)
      end

      it "休み割当にday_off_request_idを含めて返す" do
        subject
        res = JSON.parse(response.body)
        assignment = res["day_off_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        expect(assignment["id"]).to eq(day_off_assignment.id)
        expect(assignment["day_off_request_id"]).to eq(day_off_request.id)
        expect(response).to have_http_status(:ok)
      end

      it "無効化済みタイプの既存割当も返す" do
        work_type.update!(is_active: false)
        day_off_type.update!(is_active: false)
        subject
        res = JSON.parse(response.body)
        work_assignment_json = res["work_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        day_off_assignment_json = res["day_off_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        expect(work_assignment_json["id"]).to eq(work_assignment.id)
        expect(work_assignment_json["work_type"]["id"]).to eq(work_type.id)
        expect(day_off_assignment_json["id"]).to eq(day_off_assignment.id)
        expect(day_off_assignment_json["day_off_type"]["id"]).to eq(day_off_type.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者が公開済み月を指定した時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, is_published: true) }
      it "正常に取得できる" do
        subject
        expect(response).to have_http_status(:ok)
      end
    end

    context "一般メンバーが公開済み月を指定した時" do
      let(:user) { create(:user, :with_facility) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, is_published: true) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
      let(:member) { create(:user, facility: user.facility) }
      let(:work_type) { create(:work_type, facility: user.facility) }
      let(:day_off_type) { create(:day_off_type, facility: user.facility) }

      let(:work_request) { create(:work_request, facility: user.facility, user: member, schedule_day: schedule_day, work_type: work_type) }

      let(:day_off_request) { create(:day_off_request, facility: user.facility, user: member, schedule_day: schedule_day, day_off_type: day_off_type) }

      let!(:work_assignment) do
        create(:work_assignment, facility: user.facility, user: member, schedule_day: schedule_day, work_type: work_type, work_request: work_request)
      end
      let!(:day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: member, schedule_day: schedule_day, day_off_type: day_off_type,
                                    day_off_request: day_off_request)
      end

      it "勤務・休み割当を返すが申請由来情報は返さない" do
        subject
        res = JSON.parse(response.body)
        work_assignment_json = res["work_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        day_off_assignment_json = res["day_off_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        expect(work_assignment_json["id"]).to eq(work_assignment.id)
        expect(day_off_assignment_json["id"]).to eq(day_off_assignment.id)
        expect(work_assignment_json).not_to have_key("work_request_id")
        expect(day_off_assignment_json).not_to have_key("day_off_request_id")
        expect(response).to have_http_status(:ok)
      end
    end

    context "一般メンバーが未公開月を指定した時" do
      let(:user) { create(:user, :with_facility) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, is_published: false) }

      it "not_foundエラーを返す" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の対象月を指定した時" do
      let(:user) { create(:user, :with_facility) }
      let(:schedule_month) { create(:schedule_month, is_published: true) }

      it "not_foundエラーを返す" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:schedule_month) { create(:schedule_month, is_published: true) }

      it "not_foundエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
