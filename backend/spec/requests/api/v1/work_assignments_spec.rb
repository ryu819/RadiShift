# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::WorkAssignments", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/work_assignments" do
    subject do
      get(api_v1_work_assignments_path, params: { year: year, month: month }, headers: { "Authorization": token })
    end

    let(:year) { 2026 }
    let(:month) { 9 }

    context "施設に所属している時" do
      let(:schedule_month) { create(:schedule_month, facility: user.facility, year: year, month: month) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
      let!(:work_assignment) { create(:work_assignment, facility: user.facility, user: user, schedule_day: schedule_day) }
      let(:other_user) { create(:user, facility: user.facility) }
      let!(:other_user_work_assignment) { create(:work_assignment, facility: user.facility, user: other_user, schedule_day: schedule_day) }

      it "ログインユーザー自身の勤務割当だけを返す" do
        subject
        res = JSON.parse(response.body)
        work_assignment_ids = res.map { |work_assignment| work_assignment["id"] }
        expect(work_assignment_ids).to include(work_assignment.id)
        expect(work_assignment_ids).not_to include(other_user_work_assignment.id)
        expect(res.first["user_id"]).to eq(user.id)
        expect(res.first["work_type"]).to be_present
        expect(response).to have_http_status(:ok)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/work_assignments" do
    subject { post(api_v1_work_assignments_path, params: params, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:assigned_user) { create(:user, facility: user.facility) }
    let(:work_type) { create(:work_type, facility: user.facility, name: "日勤") }
    let(:params) { { work_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, work_type_id: work_type.id } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "勤務割当を作成できる" do
        expect { subject }.to change { WorkAssignment.count }.by(1)

        res = JSON.parse(response.body)
        work_assignment = WorkAssignment.find_by(schedule_day: schedule_day, user: assigned_user, work_type: work_type)

        expect(res["message"]).to eq("勤務割当を作成しました。")
        expect(work_assignment.schedule_day).to eq(schedule_day)
        expect(work_assignment.user).to eq(assigned_user)
        expect(work_assignment.work_type).to eq(work_type)
        expect(response).to have_http_status(:created)
      end

      context "schedule_day_id がない時" do
        let(:params) { { work_assignment: { schedule_day_id: nil, user_id: assigned_user.id, work_type_id: work_type.id } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務割当の作成に失敗しました。")
          expect(res["errors"]["schedule_day"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "user_id がない時" do
        let(:params) { { work_assignment: { schedule_day_id: schedule_day.id, user_id: nil, work_type_id: work_type.id } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務割当の作成に失敗しました。")
          expect(res["errors"]["user"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "work_type_id がない時" do
        let(:params) { { work_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, work_type_id: nil } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務割当の作成に失敗しました。")
          expect(res["errors"]["work_type"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の schedule_day_id を送る時" do
        let(:other_facility) { create(:facility) }
        let(:other_schedule_month) { create(:schedule_month, facility: other_facility, year: 2026, month: 1) }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }
        let(:params) { { work_assignment: { schedule_day_id: other_schedule_day.id, user_id: assigned_user.id, work_type_id: work_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("対象日が存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の user_id を送る時" do
        let(:other_user) { create(:user, facility: create(:facility)) }
        let(:params) { { work_assignment: { schedule_day_id: schedule_day.id, user_id: other_user.id, work_type_id: work_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("ユーザーが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の work_type_id を送る時" do
        let(:other_work_type) { create(:work_type, facility: create(:facility), name: "日勤") }
        let(:params) { { work_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, work_type_id: other_work_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務パターンが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context "管理者でない時" do
      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:params) { { work_assignment: { schedule_day_id: 1, user_id: 1, work_type_id: 1 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/work_assignments/:id" do
    subject { put(api_v1_work_assignment_path(work_assignment), params: params, headers: { "Authorization": token }) }

    let(:work_assignment) { create(:work_assignment, facility: user.facility) }
    let(:work_type) { create(:work_type, facility: user.facility, name: "夜勤") }
    let(:params) { { work_assignment: { work_type_id: work_type.id } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "勤務割当を更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務割当を更新しました。")
        expect(work_assignment.reload.work_type).to eq(work_type)
        expect(response).to have_http_status(:ok)
      end

      context "work_type_id がない時" do
        let(:params) { { work_assignment: { work_type_id: nil } } }

        it "更新に失敗する" do
          original_work_type = work_assignment.work_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務割当の更新に失敗しました。")
          expect(res["errors"]["work_type"]).to be_present
          expect(work_assignment.reload.work_type).to eq(original_work_type)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の work_type_id を送る時" do
        let(:other_work_type) { create(:work_type, facility: create(:facility), name: "夜勤") }
        let(:params) { { work_assignment: { work_type_id: other_work_type.id } } }

        it "not_found エラーが返る" do
          original_work_type = work_assignment.work_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務パターンが存在しません。")
          expect(work_assignment.reload.work_type).to eq(original_work_type)
          expect(response).to have_http_status(:not_found)
        end
      end

      context "permitしていない項目を送る時" do
        let(:schedule_month) { work_assignment.schedule_day.schedule_month }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 1, 3)) }
        let(:other_user) { create(:user, facility: user.facility) }
        let(:params) { { work_assignment: { schedule_day_id: other_schedule_day.id, user_id: other_user.id, work_type_id: work_type.id } } }

        it "schedule_day_id と user_id は更新されない" do
          original_schedule_day = work_assignment.schedule_day
          original_user = work_assignment.user
          subject
          work_assignment.reload
          expect(work_assignment.schedule_day).to eq(original_schedule_day)
          expect(work_assignment.user).to eq(original_user)
          expect(work_assignment.work_type).to eq(work_type)
          expect(response).to have_http_status(:ok)
        end
      end
    end

    context "管理者でない時" do
      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:work_assignment) { create(:work_assignment) }
      let(:params) { { work_assignment: { work_type_id: 1 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の勤務割当を更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:work_assignment) { create(:work_assignment, facility: create(:facility)) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/work_assignments/:id" do
    subject { delete(api_v1_work_assignment_path(work_assignment), headers: { "Authorization": token }) }

    let!(:work_assignment) { create(:work_assignment, facility: user.facility) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "勤務割当を削除できる" do
        expect { subject }.to change { WorkAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務割当を削除しました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者でない時" do
      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:work_assignment) { create(:work_assignment) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の勤務割当を削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:work_assignment) { create(:work_assignment, facility: create(:facility)) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
