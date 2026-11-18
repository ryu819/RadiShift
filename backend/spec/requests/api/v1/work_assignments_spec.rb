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

      context "過去日の schedule_day_id を送る時" do
        let(:schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.yesterday) }
        let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.current.yesterday) }

        it "勤務割当を作成できない" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("過去日のシフトは変更できません。")
          expect(response).to have_http_status(:unprocessable_content)
        end
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

      context "月末に翌日の勤務が設定された勤務タイプを送る時" do
        let(:primary_date) { Date.current.next_month.end_of_month }
        let(:schedule_month) { create(:schedule_month, facility: user.facility, date: primary_date) }
        let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: primary_date) }
        let(:next_month) { create(:schedule_month, facility: user.facility, date: primary_date.tomorrow) }
        let(:next_schedule_day) { create(:schedule_day, schedule_month: next_month, date: primary_date.tomorrow) }
        let(:next_day_work_type) { create(:work_type, facility: user.facility, name: "明け") }
        let(:work_type) { create(:work_type, facility: user.facility, name: "夜勤", next_day_work_type: next_day_work_type) }

        it "翌月のシフト表があれば、翌月1日にも勤務割当を作成する" do
          next_schedule_day
          expect { subject }.to change { WorkAssignment.count }.by(2)
          work_assignment = WorkAssignment.find_by(schedule_day: schedule_day, user: assigned_user, work_type: work_type)
          expect(work_assignment.next_day_work_assignment.schedule_day).to eq(next_schedule_day)
          expect(work_assignment.next_day_work_assignment.work_type).to eq(next_day_work_type)
          expect(response).to have_http_status(:created)
        end

        it "翌月のシフト表がなければ、主勤務の勤務割当だけ作成する" do
          expect { subject }.to change { WorkAssignment.count }.by(1)
          expect(response).to have_http_status(:created)
        end

        it "翌日に同じ勤務割当がすでにあれば、どちらの勤務割当も作成しない" do
          create(:work_assignment, schedule_day: next_schedule_day, user: assigned_user, work_type: next_day_work_type)
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("翌日の勤務はすでに割り当てられています。")
          expect(response).to have_http_status(:unprocessable_content)
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

      context "過去日の勤務割当の時" do
        before do
          work_assignment.schedule_day.update!(date: Date.current.yesterday)
        end

        it "勤務割当を削除できない" do
          expect { subject }.not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("過去日のシフトは変更できません。")
          expect(work_assignment.reload).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "脱退済みユーザーの勤務割当の時" do
        before do
          work_assignment.user.update!(facility: nil, display_order: nil)
        end

        it "勤務割当を削除できる" do
          expect { subject }.to change { WorkAssignment.count }.by(-1)
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("勤務割当を削除しました。")
          expect(response).to have_http_status(:ok)
        end
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

      context "翌日の勤務とセットの時" do
        let!(:next_day_work_assignment) do
          schedule_day = work_assignment.schedule_day
          create(:work_assignment, facility: user.facility, user: work_assignment.user, primary_work_assignment: work_assignment,
                                   schedule_day: create(:schedule_day, schedule_month: schedule_day.schedule_month, date: schedule_day.date.tomorrow))
        end

        it "主勤務を削除すると翌日の勤務もまとめて削除する" do
          expect { subject }.to change { WorkAssignment.count }.by(-2)
          expect(response).to have_http_status(:ok)
        end

        it "翌日の勤務は個別に削除できない" do
          expect { delete(api_v1_work_assignment_path(next_day_work_assignment), headers: { "Authorization": token }) }
            .not_to change { WorkAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("セットの翌日勤務は個別に削除できません。")
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

    context "過去日の申請由来の勤務割当の時" do
      before do
        schedule_day.update!(date: Date.current.yesterday)
      end

      it "管理者管理に切り替えない" do
        subject
        res = JSON.parse(response.body)
        expect(work_assignment.reload.work_request).to eq(assigned_user_work_request)
        expect(res["message"]).to eq("過去日のシフトは変更できません。")
        expect(response).to have_http_status(:unprocessable_content)
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
