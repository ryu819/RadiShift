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

    context "管理者が当月を指定した時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.beginning_of_month, is_published: false) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.current.beginning_of_month) }
      let!(:current_member) { create(:user, facility: user.facility) }
      let!(:left_member) { create(:user, facility: nil) }
      let!(:work_assignment) { create(:work_assignment, user: left_member, schedule_day: schedule_day) }
      let!(:day_off_assignment) { create(:day_off_assignment, user: left_member, schedule_day: schedule_day) }

      it "現在所属メンバーとAssignmentを持つ脱退メンバーを返す" do
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).to include(user.id, current_member.id, left_member.id)
        expect(response).to have_http_status(:ok)
      end

      it "最後のAssignmentがなくなると脱退メンバーを返さない" do
        work_assignment.destroy!
        day_off_assignment.destroy!
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).not_to include(left_member.id)
      end
    end

    context "管理者が公開済み過去月を指定した時" do
      let(:user) { create(:user, :admin) }
      let(:past_date) { Date.current.prev_month.beginning_of_month }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: past_date, is_published: true) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: past_date) }
      let(:left_member) { create(:user, facility: nil) }
      let!(:work_assignment) { create(:work_assignment, user: left_member, schedule_day: schedule_day) }

      it "Assignmentを持つ脱退メンバーを返す" do
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).to include(left_member.id)
      end
    end

    context "管理者が未来月を指定した時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.next_month.beginning_of_month) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.current.next_month.beginning_of_month) }
      let!(:current_member) { create(:user, facility: user.facility) }
      let(:left_member) { create(:user, facility: nil) }
      let!(:work_assignment) { create(:work_assignment, user: left_member, schedule_day: schedule_day) }

      it "現在所属しているメンバーだけを返す" do
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).to include(user.id, current_member.id)
        expect(member_ids).not_to include(left_member.id)
      end
    end

    context "管理者がモダリティ割当のある月を指定した時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, is_published: false) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
      let(:member) { create(:user, facility: user.facility) }
      let(:modality_type) { create(:modality_type, facility: user.facility) }
      let!(:modality_assignment) { create(:modality_assignment, user: member, schedule_day: schedule_day, modality_type: modality_type) }

      it "モダリティ割当を返す" do
        subject
        res = JSON.parse(response.body)
        assignment = res["modality_assignments_by_user_and_day"][member.id.to_s][schedule_day.id.to_s].first
        expect(assignment["id"]).to eq(modality_assignment.id)
        expect(assignment["modality_type"]["id"]).to eq(modality_type.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "当月にモダリティ割当だけ残る脱退メンバーがいる時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.beginning_of_month) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.current.beginning_of_month) }
      let(:left_member) { create(:user, facility: nil) }
      let!(:modality_assignment) { create(:modality_assignment, user: left_member, schedule_day: schedule_day) }

      it "脱退メンバーをmembersに含める" do
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).to include(left_member.id)
      end
    end

    context "削除済みユーザーに過去の勤務割当がある時" do
      let(:user) { create(:user, :admin) }
      let(:date) { Date.current.prev_month.beginning_of_month }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: date, is_published: true) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: date) }
      let(:deleted_member) { create(:user, facility: nil, is_deleted: true, name: "山田 太郎") }
      let!(:work_assignment) { create(:work_assignment, facility: user.facility, user: deleted_member, schedule_day: schedule_day) }

      it "名前付きでmembersに含める" do
        subject
        res = JSON.parse(response.body)
        member = res["members"].find { |item| item["id"] == deleted_member.id }
        expect(member["name"]).to eq(deleted_member.name)
        expect(response).to have_http_status(:ok)
      end
    end

    context "削除済みユーザーにAssignmentがない時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.beginning_of_month) }
      let!(:deleted_member) { create(:user, facility: nil, is_deleted: true) }

      it "membersに含めない" do
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).not_to include(deleted_member.id)
      end
    end

    context "一般メンバーが公開済み月を指定した時" do
      let(:user) { create(:user, :with_facility) }
      let(:schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.beginning_of_month, is_published: true) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
      let(:left_member) { create(:user, facility: nil) }
      let(:work_request) { create(:work_request, facility: user.facility, user: left_member, schedule_day: schedule_day) }
      let(:day_off_request) { create(:day_off_request, facility: user.facility, user: left_member, schedule_day: schedule_day) }
      let!(:work_assignment) { create(:work_assignment, facility: user.facility, user: left_member, schedule_day: schedule_day, work_request: work_request) }
      let!(:day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: left_member, schedule_day: schedule_day, day_off_request: day_off_request)
      end

      it "勤務・休み割当を返すが申請由来情報は返さない" do
        subject
        res = JSON.parse(response.body)
        work_assignment_json = res["work_assignments_by_user_and_day"][left_member.id.to_s][schedule_day.id.to_s].first
        day_off_assignment_json = res["day_off_assignments_by_user_and_day"][left_member.id.to_s][schedule_day.id.to_s].first
        expect(work_assignment_json["id"]).to eq(work_assignment.id)
        expect(day_off_assignment_json["id"]).to eq(day_off_assignment.id)
        expect(work_assignment_json).not_to have_key("work_request_id")
        expect(day_off_assignment_json).not_to have_key("day_off_request_id")
        expect(response).to have_http_status(:ok)
      end

      it "Assignmentが残る脱退メンバーをmembersに含める" do
        subject
        res = JSON.parse(response.body)
        member_ids = res["members"].map { |member| member["id"] }
        expect(member_ids).to include(left_member.id)
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
