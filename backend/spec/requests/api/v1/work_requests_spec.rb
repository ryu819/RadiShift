# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::WorkRequests", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/work_requests" do
    subject { get(api_v1_work_requests_path, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 6, 10)) }
    let(:work_type) { create(:work_type, facility: user.facility) }
    let(:other_user) { create(:user, facility: user.facility) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      let!(:own_work_request) { create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type) }
      let!(:other_user_work_request) { create(:work_request, facility: user.facility, user: other_user, schedule_day: schedule_day, work_type: work_type) }
      let!(:other_facility_work_request) { create(:work_request) }

      it "同じ施設の勤務希望を全て返す" do
        subject
        res = JSON.parse(response.body)
        work_request_ids = res["work_requests"].map { |work_request| work_request["id"] }
        expect(work_request_ids).to include(own_work_request.id)
        expect(work_request_ids).to include(other_user_work_request.id)
        expect(work_request_ids).not_to include(other_facility_work_request.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者でない時" do
      let!(:own_work_request) { create(:work_request, facility: user.facility, user: user, schedule_day: schedule_day, work_type: work_type) }
      let!(:other_user_work_request) { create(:work_request, facility: user.facility, user: other_user, schedule_day: schedule_day, work_type: work_type) }

      it "自分の勤務希望だけを返す" do
        subject
        res = JSON.parse(response.body)
        work_request_ids = res["work_requests"].map { |work_request| work_request["id"] }
        expect(work_request_ids).to include(own_work_request.id)
        expect(work_request_ids).not_to include(other_user_work_request.id)
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

  describe "POST /api/v1/work_requests" do
    subject { post(api_v1_work_requests_path, params: params, headers: { "Authorization": token }, as: :json) }

    let(:schedule_day_date) { Date.current + (user.facility.request_deadline + 1).days }
    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: schedule_day_date.year, month: schedule_day_date.month) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: schedule_day_date) }
    let(:work_type) { create(:work_type, facility: user.facility, auto_approve: true) }
    let(:params) { { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: false } } }

    context "締切内で auto_approve が true の時" do
      it "勤務希望を作成し、勤務割当も作成して approved になる" do
        expect { subject }.to change { WorkRequest.count }.by(1).and change { WorkAssignment.count }.by(1)
        res = JSON.parse(response.body)
        work_request = WorkRequest.last
        expect(res["message"]).to eq("申請は承認されました。")
        expect(work_request).to be_approved
        expect(WorkAssignment.last.user).to eq(user)
        expect(WorkAssignment.last.work_type).to eq(work_type)
        expect(response).to have_http_status(:created)
      end
    end

    context "締切内だが auto_approve が false の時" do
      let(:work_type) { create(:work_type, facility: user.facility, auto_approve: false) }

      it "勤務希望だけを作成し、pending のままになる" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        res = JSON.parse(response.body)
        work_request = WorkRequest.last
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(res["message"]).to eq("申請しました。")
        expect(work_request).to be_pending
        expect(response).to have_http_status(:created)
      end
    end

    context "申請締切日を過ぎている時" do
      let(:schedule_day_date) { Date.current + (user.facility.request_deadline - 1).days }

      it "勤務希望だけを作成し、pending のままになる" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        res = JSON.parse(response.body)
        work_request = WorkRequest.last
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(res["message"]).to eq("申請締切日を過ぎているため、管理者承認待ちとして申請しました。")
        expect(work_request).to be_pending
        expect(response).to have_http_status(:created)
      end
    end

    context "すでに同じ勤務割当がある時" do
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type) }

      it "勤務希望を作成し、rejected になる" do
        work_assignment_count = WorkAssignment.count
        expect { subject }.to change { WorkRequest.count }.by(1)
        res = JSON.parse(response.body)
        work_request = WorkRequest.last
        expect(WorkAssignment.count).to eq(work_assignment_count)
        expect(res["message"]).to eq("申請は否認されました。")
        expect(work_request).to be_rejected
        expect(response).to have_http_status(:created)
      end
    end

    context "返上申請で返上対象の勤務割当がある時" do
      let(:params) { { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: true } } }
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: user, work_type: work_type) }

      it "勤務希望を作成し、勤務割当を削除して approved になる" do
        expect { subject }.to change { WorkRequest.count }.by(1).and change { WorkAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        work_request = WorkRequest.last
        expect(res["message"]).to eq("申請は承認されました。")
        expect(work_request).to be_approved
        expect(response).to have_http_status(:created)
      end
    end

    context "返上申請で返上対象の勤務割当がない時" do
      let(:params) { { work_request: { schedule_day_id: schedule_day.id, work_type_id: work_type.id, is_return: true } } }

      it "作成に失敗する" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("返上対象の勤務割当が存在しません。")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "別施設の対象日を指定した時" do
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
      let(:work_type) { create(:work_type, facility: create(:facility), auto_approve: true) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { WorkRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務パターンが存在しません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:schedule_month) { create(:schedule_month, facility: create(:facility), year: 2026, month: 6) }
      let(:work_type) { create(:work_type) }
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
    let(:work_type) { create(:work_type, facility: user.facility, auto_approve: false) }
    let(:work_request) do
      create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                            is_return: false)
    end
    let(:params) { { work_request: { request_status: "approved" } } }

    context "管理者が通常申請を approved にした時" do
      it "勤務希望を更新し、勤務割当を作成する" do
        expect { subject }.to change { WorkAssignment.count }.by(1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務希望を更新しました。")
        expect(work_request.reload).to be_approved
        expect(WorkAssignment.last.user).to eq(target_user)
        expect(WorkAssignment.last.work_type).to eq(work_type)
        expect(response).to have_http_status(:ok)
      end
    end

    context "すでに勤務割当がある通常申請を approved にした時" do
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: target_user, work_type: work_type) }

      it "勤務割当を重複作成しない" do
        expect { subject }.not_to change { WorkAssignment.count }
        expect(work_request.reload).to be_approved
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者が返上申請を approved にした時" do
      let(:work_request) do
        create(:work_request, facility: user.facility, user: target_user, schedule_day: schedule_day, work_type: work_type, request_status: :pending,
                              is_return: true)
      end
      let!(:work_assignment) { create(:work_assignment, schedule_day: schedule_day, user: target_user, work_type: work_type) }

      it "勤務希望を更新し、勤務割当を削除する" do
        expect { subject }.to change { WorkAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務希望を更新しました。")
        expect(work_request.reload).to be_approved
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者が rejected にした時" do
      let(:params) { { work_request: { request_status: "rejected" } } }

      it "勤務希望だけを更新する" do
        expect { subject }.not_to change { WorkAssignment.count }
        expect(work_request.reload).to be_rejected
        expect(response).to have_http_status(:ok)
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
    let(:work_type) { create(:work_type, facility: user.facility) }
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
