# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::DayOffAssignments", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "POST /api/v1/day_off_assignments" do
    subject { post(api_v1_day_off_assignments_path, params: params, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:assigned_user) { create(:user, facility: user.facility) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }
    let(:params) { { day_off_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, day_off_type_id: day_off_type.id } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み割当を作成できる" do
        expect { subject }.to change { DayOffAssignment.count }.by(1)
        res = JSON.parse(response.body)
        day_off_assignment = DayOffAssignment.find_by(schedule_day: schedule_day, user: assigned_user, day_off_type: day_off_type)
        expect(res["message"]).to eq("休み割当を作成しました。")
        expect(day_off_assignment.schedule_day).to eq(schedule_day)
        expect(day_off_assignment.user).to eq(assigned_user)
        expect(day_off_assignment.day_off_type).to eq(day_off_type)
        expect(response).to have_http_status(:created)
      end

      context "schedule_day_id がない時" do
        let(:params) { { day_off_assignment: { schedule_day_id: nil, user_id: assigned_user.id, day_off_type_id: day_off_type.id } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み割当の作成に失敗しました。")
          expect(res["errors"]["schedule_day"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "user_id がない時" do
        let(:params) { { day_off_assignment: { schedule_day_id: schedule_day.id, user_id: nil, day_off_type_id: day_off_type.id } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み割当の作成に失敗しました。")
          expect(res["errors"]["user"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_type_id がない時" do
        let(:params) { { day_off_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, day_off_type_id: nil } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み割当の作成に失敗しました。")
          expect(res["errors"]["day_off_type"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の schedule_day_id を送る時" do
        let(:other_facility) { create(:facility) }
        let(:other_schedule_month) { create(:schedule_month, facility: other_facility) }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }
        let(:params) { { day_off_assignment: { schedule_day_id: other_schedule_day.id, user_id: assigned_user.id, day_off_type_id: day_off_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("対象日が存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の user_id を送る時" do
        let(:other_user) { create(:user, facility: create(:facility)) }
        let(:params) { { day_off_assignment: { schedule_day_id: schedule_day.id, user_id: other_user.id, day_off_type_id: day_off_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("ユーザーが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の day_off_type_id を送る時" do
        let(:other_day_off_type) { create(:day_off_type, facility: create(:facility), name: "休み") }
        let(:params) { { day_off_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, day_off_type_id: other_day_off_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "無効化済みの day_off_type_id を送る時" do
        let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み", is_active: false) }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
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
      let(:params) { { day_off_assignment: { schedule_day_id: 1, user_id: 1, day_off_type_id: 1 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/day_off_assignments/:id" do
    subject { put(api_v1_day_off_assignment_path(day_off_assignment), params: params, headers: { "Authorization": token }) }

    let(:day_off_assignment) { create(:day_off_assignment, facility: user.facility) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "午後休み") }
    let(:params) { { day_off_assignment: { day_off_type_id: day_off_type.id } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み割当を更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み割当を更新しました。")
        expect(day_off_assignment.reload.day_off_type).to eq(day_off_type)
        expect(response).to have_http_status(:ok)
      end

      context "day_off_type_id がない時" do
        let(:params) { { day_off_assignment: { day_off_type_id: nil } } }

        it "更新に失敗する" do
          original_day_off_type = day_off_assignment.day_off_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み割当の更新に失敗しました。")
          expect(res["errors"]["day_off_type"]).to be_present
          expect(day_off_assignment.reload.day_off_type).to eq(original_day_off_type)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の day_off_type_id を送る時" do
        let(:other_day_off_type) { create(:day_off_type, facility: create(:facility), name: "休み") }
        let(:params) { { day_off_assignment: { day_off_type_id: other_day_off_type.id } } }

        it "not_found エラーが返る" do
          original_day_off_type = day_off_assignment.day_off_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
          expect(day_off_assignment.reload.day_off_type).to eq(original_day_off_type)
          expect(response).to have_http_status(:not_found)
        end
      end

      context "無効化済みの day_off_type_id を送る時" do
        let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "午後休み", is_active: false) }

        it "not_found エラーが返る" do
          original_day_off_type = day_off_assignment.day_off_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
          expect(day_off_assignment.reload.day_off_type).to eq(original_day_off_type)
          expect(response).to have_http_status(:not_found)
        end
      end

      context "permitしていない項目を送る時" do
        let(:schedule_month) { day_off_assignment.schedule_day.schedule_month }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 1, 3)) }
        let(:other_user) { create(:user, facility: user.facility) }
        let(:params) { { day_off_assignment: { schedule_day_id: other_schedule_day.id, user_id: other_user.id, day_off_type_id: day_off_type.id } } }

        it "schedule_day_id と user_id は更新されない" do
          original_schedule_day = day_off_assignment.schedule_day
          original_user = day_off_assignment.user
          subject
          day_off_assignment.reload
          expect(day_off_assignment.schedule_day).to eq(original_schedule_day)
          expect(day_off_assignment.user).to eq(original_user)
          expect(day_off_assignment.day_off_type).to eq(day_off_type)
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
      let(:day_off_assignment) { create(:day_off_assignment) }
      let(:params) { { day_off_assignment: { day_off_type_id: 1 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休み割当を更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:day_off_assignment) { create(:day_off_assignment, facility: create(:facility)) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/day_off_assignments/:id" do
    subject { delete(api_v1_day_off_assignment_path(day_off_assignment), headers: { "Authorization": token }) }

    let!(:day_off_assignment) { create(:day_off_assignment, facility: user.facility) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み割当を削除できる" do
        expect { subject }.to change { DayOffAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み割当を削除しました。")
        expect(response).to have_http_status(:ok)
      end

      context "脱退済みユーザーの休み割当の時" do
        before do
          day_off_assignment.user.update!(facility: nil, display_order: nil)
        end

        it "休み割当を削除できる" do
          expect { subject }.to change { DayOffAssignment.count }.by(-1)
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み割当を削除しました。")
          expect(response).to have_http_status(:ok)
        end
      end

      context "休みタイプが無効化済みの時" do
        before do
          day_off_assignment.day_off_type.update!(is_active: false)
        end

        it "休み割当を削除できる" do
          expect { subject }.to change { DayOffAssignment.count }.by(-1)
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み割当を削除しました。")
          expect(response).to have_http_status(:ok)
        end
      end

      context "申請由来の休み割当の休みタイプが無効化済みの時" do
        before do
          day_off_request = create(
            :day_off_request,
            facility: user.facility,
            user: day_off_assignment.user,
            schedule_day: day_off_assignment.schedule_day,
            day_off_type: day_off_assignment.day_off_type,
            request_status: :approved
          )

          day_off_assignment.update!(day_off_request: day_off_request)
          day_off_assignment.day_off_type.update!(is_active: false)
        end

        it "通常操作では削除できない" do
          expect { subject }.not_to change { DayOffAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("申請による休み割当は通常操作では削除できません。")
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
      let(:day_off_assignment) { create(:day_off_assignment) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休み割当を削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:day_off_assignment) { create(:day_off_assignment, facility: create(:facility)) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/v1/day_off_assignments/:id/override" do
    subject { patch(override_api_v1_day_off_assignment_path(day_off_assignment), headers: { "Authorization": token }) }

    let(:user) { create(:user, :admin) }
    let(:assigned_user) { create(:user, facility: user.facility) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility) }

    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

    let(:day_off_type) { create(:day_off_type, facility: user.facility) }

    let(:assigned_user_day_off_request) do
      create(:day_off_request, facility: user.facility, user: assigned_user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :approved)
    end

    let!(:day_off_assignment) do
      create(:day_off_assignment, user: assigned_user, schedule_day: schedule_day, day_off_type: day_off_type, day_off_request: assigned_user_day_off_request)
    end

    context "申請由来の休み割当の時" do
      it "管理者管理に切り替える" do
        expect { subject }.not_to change { DayOffAssignment.count }
        res = JSON.parse(response.body)
        expect(day_off_assignment.reload.day_off_request).to be_nil
        expect(res["message"]).to eq("休み割当を管理者管理に切り替えました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "承認待ちの返上申請がある時" do
      let!(:return_day_off_request) do
        create(:day_off_request, facility: user.facility, user: assigned_user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :pending,
                                 is_return: true)
      end

      it "管理者管理に切り替えない" do
        subject
        res = JSON.parse(response.body)
        expect(day_off_assignment.reload.day_off_request).to eq(assigned_user_day_off_request)
        expect(res["message"]).to eq("承認待ちの返上申請があるため変更できません。先に返上申請を処理してください。")
        expect(response).to have_http_status(:conflict)
      end
    end

    context "すでに管理者管理の休み割当の時" do
      let(:day_off_assignment) do
        create(:day_off_assignment, facility: user.facility, user: assigned_user, schedule_day: schedule_day, day_off_type: day_off_type, day_off_request: nil)
      end

      it "conflictエラーを返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この休み割当はすでに管理者管理です。")
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

    context "別施設の休み割当の時" do
      let(:other_facility) { create(:facility) }
      let(:day_off_assignment) { create(:day_off_assignment, facility: create(:facility)) }

      it "not_foundエラーを返す" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
