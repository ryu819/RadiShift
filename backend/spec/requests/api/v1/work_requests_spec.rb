# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::WorkRequests", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/work_requests" do
    subject { get(api_v1_work_requests_path, params: { schedule_month_id: schedule_month.id }, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:work_type) { create(:work_type, facility: user.facility) }
    let(:other_user) { create(:user, facility: user.facility) }

    context "施設に所属している時" do
      let!(:own_work_request) { create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type) }
      let!(:other_user_work_request) { create(:work_request, facility: user.facility, user: other_user, schedule_day: schedule_day, work_type: work_type) }
      let(:other_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 7) }

      let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }

      let!(:other_month_work_request) { create(:work_request, facility: user.facility, user: user, schedule_day: other_schedule_day, work_type: work_type) }

      it "自分の勤務希望だけを返す" do
        subject
        res = JSON.parse(response.body)
        work_request_ids = res.map { |work_request| work_request["id"] }
        expect(work_request_ids).to include(own_work_request.id)
        expect(work_request_ids).not_to include(other_user_work_request.id)
        expect(work_request_ids).not_to include(other_month_work_request.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:schedule_month) { create(:schedule_month) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/work_requests" do
    subject { post(api_v1_work_requests_path, params: params, headers: { "Authorization": token }, as: :json) }

    let(:schedule_day_date) { Date.current.next_month(2) }
    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: schedule_day_date.year, month: schedule_day_date.month) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: schedule_day_date) }
    let(:params) { { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: false } } }

    context "申請可能な勤務パターンを通常申請する時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }

      it "勤務希望をpendingで作成し、勤務割当は作成しない" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        work_request = WorkRequest.last
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(work_request).to be_pending
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("申請しました。")
        expect(response).to have_http_status(:created)
      end
    end

    context "申請不可の勤務パターンを通常申請する時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: false) }

      it "勤務希望を作成しない" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この勤務パターンは現在申請できません。")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "申請可能な勤務パターンを返上申請する時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }

      let(:params) do
        { work_request: {     schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: true } }
      end

      let(:work_request) { create(:work_request, schedule_day_id: schedule_day.id, work_type_id: work_type.id, request_status: :approved) }
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type, work_request: work_request) }

      it "返上申請をpendingで作成し、勤務割当は削除しない" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(WorkRequest.last).to be_pending
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("申請しました。")
        expect(response).to have_http_status(:created)
      end
    end

    context "申請不可の勤務パターンを返上申請する時" do
      let(:work_type) do
        create(:work_type, facility: user.facility, is_requestable: false)
      end

      let(:params) do
        { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: true } }
      end

      let(:work_request) do
        create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :approved,
                              is_return: false)
      end

      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type, work_request: work_request) }

      it "返上申請をpendingで作成し、勤務割当は削除しない" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        created_work_request = WorkRequest.last
        res = JSON.parse(response.body)
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(created_work_request).to be_pending
        expect(res["message"]).to eq("申請しました。")
        expect(response).to have_http_status(:created)
      end
    end

    context "すでに同じ勤務割当がある時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }

      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type) }

      it "勤務希望を作成せず、unprocessable_content エラーを返す" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(res["message"]).to eq("すでにシフトが割り当てられているため申請できません。")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "返上申請で返上対象の勤務割当がない時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }

      let(:params) { { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: true } } }

      it "作成に失敗する" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("返上対象の勤務割当が存在しません。")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "別施設の対象日を指定した時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }

      let(:other_facility) { create(:facility) }
      let(:schedule_month) { create(:schedule_month, facility: other_facility, year: schedule_day_date.year, month: schedule_day_date.month) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("対象日が存在しません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の勤務パターンを指定した時" do
      let(:work_type) { create(:work_type, facility: create(:facility), is_requestable: true) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務パターンが存在しません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "無効化された勤務パターンで通常申請する時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true, is_active: false) }

      it "勤務希望を作成せず、unprocessable_content エラーを返す" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この勤務パターンは現在利用できません。")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "無効化された勤務パターンの返上申請をする時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true, is_active: false) }
      let(:params) { { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: true } } }
      let(:work_request) { create(:work_request, schedule_day_id: schedule_day.id, work_type_id: work_type.id, request_status: :approved) }
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type, work_request: work_request) }

      it "返上申請をpendingで作成し、勤務割当は削除しない" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        work_request = WorkRequest.last
        res = JSON.parse(response.body)
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(work_request).to be_pending
        expect(res["message"]).to eq("申請しました。")
        expect(response).to have_http_status(:created)
      end
    end

    context "同じ pending の勤務希望がすでにある時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }

      let!(:existing_work_request) do
        create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :pending)
      end

      it "重複した勤務希望を作成しない" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務希望の申請に失敗しました。")
        expect(res["errors"]["schedule_day_id"]).to eq(["対象日には同じ希望がすでに申請されています。"])
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:schedule_month) { create(:schedule_month, facility: create(:facility), year: 2026, month: 6) }
      let(:work_type) { create(:work_type, is_requestable: true) }
      let(:schedule_day_date) { Date.current }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/work_requests/:id" do
    subject { put(api_v1_work_request_path(work_request), params: params, headers: { "Authorization": token }) }

    let(:user) { create(:user, :admin) }
    let(:target_user) { create(:user, facility: user.facility) }
    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 6, 20)) }
    let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }
    let(:work_request) do
      create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                            is_return: false)
    end
    let(:params) { { work_request: { request_status: "approved" } } }

    context "管理者が通常申請を approved にした時" do
      it "勤務希望を更新し、勤務割当を作成する" do
        expect { subject }.to change { WorkAssignment.count }.by(1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("申請を承認し、シフトを変更しました。")
        expect(work_request.reload).to be_approved
        expect(WorkAssignment.last.user).to eq(target_user)
        expect(WorkAssignment.last.work_type).to eq(work_type)
        expect(response).to have_http_status(:ok)
      end
    end

    context "すでに勤務割当がある通常申請を approved にした時" do
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: target_user, work_type: work_type) }

      it "承認せず、unprocessable_content エラーを返す" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("すでにシフトが割り当てられているため承認できません。")
        expect(work_request.reload).to be_pending
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "管理者が返上申請を approved にした時" do
      let(:work_request) do
        create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                              is_return: true)
      end

      let!(:work_assignment) do
        create(:work_assignment, schedule_day: schedule_day, user: target_user, work_type: work_type, work_request: create(:work_request))
      end

      it "勤務希望を更新し、勤務割当を削除する" do
        expect { subject }.to change { WorkAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("申請を承認し、シフトを変更しました。")
        expect(work_request.reload).to be_approved
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者が rejected にした時" do
      let(:params) { { work_request: { request_status: "rejected" } } }

      it "勤務希望だけを更新する" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("申請を否認しました。")
        expect(work_request.reload).to be_rejected
        expect(response).to have_http_status(:ok)
      end
    end

    context "承認済みの申請を否認しようとした時" do
      let(:work_request) do
        create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :approved,
                              is_return: false)
      end

      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: target_user, work_type: work_type) }

      let(:params) { { work_request: { request_status: "rejected" } } }

      it "申請と勤務割当を変更せず、conflict エラーを返す" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この申請はすでに処理されています。")
        expect(work_request.reload).to be_approved
        expect(response).to have_http_status(:conflict)
      end
    end

    context "否認済みの申請を承認しようとした時" do
      let(:work_request) do
        create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :rejected,
                              is_return: false)
      end

      it "勤務割当を作成せず、conflict エラーを返す" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この申請はすでに処理されています。")
        expect(work_request.reload).to be_rejected
        expect(response).to have_http_status(:conflict)
      end
    end

    context "無効化された勤務パターンの通常申請を approved にした時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true, is_active: false) }

      it "承認せず、unprocessable_content エラーを返す" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この勤務パターンは現在利用できないため承認できません。")
        expect(work_request.reload).to be_pending
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "無効化された勤務パターンの返上申請を approved にした時" do
      let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true, is_active: false) }

      let(:work_request) do
        create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                              is_return: true)
      end

      let!(:work_assignment) do
        create(:work_assignment, schedule_day: schedule_day, user: target_user, work_type: work_type, work_request: create(:work_request))
      end

      it "勤務割当を削除して approved にする" do
        expect { subject }.to change { WorkAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("申請を承認し、シフトを変更しました。")
        expect(work_request.reload).to be_approved
        expect(response).to have_http_status(:ok)
      end
    end

    context "返上申請の承認時に返上対象の勤務割当が存在しない時" do
      let(:work_request) do
        create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                              is_return: true)
      end

      it "承認せず、unprocessable_content エラーを返す" do
        expect { subject }.not_to change { WorkAssignment.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("返上対象の勤務割当が存在しないため承認できません。")
        expect(work_request.reload).to be_pending
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:work_request) { create(:work_request) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の勤務希望を更新しようとした時" do
      let(:work_request) { create(:work_request) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/work_requests/:id" do
    subject { delete(api_v1_work_request_path(work_request), headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.current + 10.days) }
    let(:work_type) { create(:work_type, facility: user.facility, is_requestable: true) }
    let!(:work_request) { create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type) }

    context "自分の勤務希望を削除する時" do
      it "削除できる" do
        work_request
        expect { subject }.to change { WorkRequest.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務希望を削除しました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "同じ施設の他人の勤務希望を削除しようとした時" do
      let(:other_user) { create(:user, facility: user.facility) }
      let(:work_request) { create(:work_request, facility: user.facility, user: other_user, schedule_day: schedule_day, work_type: work_type) }

      it "not_found エラーが返る" do
        work_request
        expect { subject }.not_to change { WorkRequest.count }
        expect(response).to have_http_status(:not_found)
      end
    end

    context "承認済みの自分の勤務希望を削除しようとした時" do
      let!(:work_request) do
        create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :approved)
      end

      it "削除せず、conflict エラーを返す" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この申請はすでに処理されています。")
        expect(work_request.reload).to be_approved
        expect(response).to have_http_status(:conflict)
      end
    end

    context "否認済みの自分の勤務希望を削除しようとした時" do
      let!(:work_request) do
        create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type, request_status: :rejected)
      end

      it "削除せず、conflict エラーを返す" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("この申請はすでに処理されています。")
        expect(work_request.reload).to be_rejected
        expect(response).to have_http_status(:conflict)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:work_request) { create(:work_request) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
