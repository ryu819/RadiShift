# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::WorkAssignments", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "POST /api/v1/work_assignments" do
    subject { post(api_v1_work_assignments_path, params: params, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility) }
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
        let(:other_schedule_month) { create(:schedule_month, facility: other_facility) }
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

      context "無効化済みの work_type_id を送る時" do
        let(:work_type) { create(:work_type, facility: user.facility, name: "日勤", is_active: false) }

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

      context "無効化済みの work_type_id を送る時" do
        let(:work_type) { create(:work_type, facility: user.facility, name: "夜勤", is_active: false) }

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

      context "勤務タイプが無効化済みの時" do
        before { work_assignment.work_type.update!(is_active: false) }

        it "勤務割当を削除できる" do
          expect { subject }.to change { WorkAssignment.count }.by(-1)
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務割当を削除しました。")
          expect(response).to have_http_status(:ok)
        end
      end

      context "申請由来の勤務割当の勤務タイプが無効化済みの時" do
        before do
          work_request = create(
            :work_request,
            facility: user.facility,
            user: work_assignment.user,
            schedule_day: work_assignment.schedule_day,
            work_type: work_assignment.work_type,
            request_status: :approved
          )

          work_assignment.update!(work_request: work_request)
          work_assignment.work_type.update!(is_active: false)
        end

        it "通常操作では削除できない" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("申請による勤務割当は通常操作では削除できません。")
          expect(response).to have_http_status(:conflict)
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

  describe "PATCH /api/v1/work_assignments/:id/override" do
    subject { patch(override_api_v1_work_assignment_path(work_assignment), headers: { "Authorization": token }) }

    let(:user) { create(:user, :admin) }
    let(:assigned_user) { create(:user, facility: user.facility) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility) }

    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

    let(:work_type) {  create(:work_type, facility: user.facility, is_requestable: true) }

    let(:assigned_user_work_request) do
      create(:work_request, facility: user.facility, user: assigned_user, schedule_day: schedule_day, work_type: work_type, request_status: :approved)
    end

    let!(:work_assignment) do
      create(:work_assignment, user: assigned_user, schedule_day: schedule_day, work_type: work_type, work_request: assigned_user_work_request)
    end

    context "申請由来の勤務割当の時" do
      it "管理者管理に切り替える" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(work_assignment.reload.work_request).to be_nil
        expect(res["message"]).to eq("勤務割当を管理者管理に切り替えました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "承認待ちの返上申請がある時" do
      let!(:return_work_request) do
        create(:work_request, facility: user.facility, user: assigned_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                              is_return: true)
      end

      it "管理者管理に切り替えない" do
        subject
        res = JSON.parse(response.body)
        expect(work_assignment.reload.work_request).to eq(assigned_user_work_request)
        expect(res["message"]).to eq("承認待ちの返上申請があるため変更できません。先に返上申請を処理してください。")
        expect(response).to have_http_status(:conflict)
      end
    end

    context "すでに管理者管理の勤務割当の時" do
      let(:work_assignment) do
        create(:work_assignment, facility: user.facility, user: assigned_user, schedule_day: schedule_day, work_type: work_type, work_request: nil)
      end

      it "conflictエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この勤務割当はすでに管理者管理です。")
        expect(response).to have_http_status(:conflict)
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }

      it "forbiddenエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "別施設の勤務割当の時" do
      let(:work_assignment) { create(:work_assignment, facility: create(:facility)) }

      it "not_foundエラーを返す" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
