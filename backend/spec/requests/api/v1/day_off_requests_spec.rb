# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::DayOffRequests", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/day_off_requests" do
    subject { get(api_v1_day_off_requests_path, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 6, 10)) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }
    let(:other_user) { create(:user, facility: user.facility) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      let!(:own_day_off_request) { create(:day_off_request, facility: user.facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type) }
      let!(:other_user_day_off_request) do
        create(:day_off_request, facility: user.facility, user: other_user, schedule_day: schedule_day, day_off_type: day_off_type)
      end
      let!(:other_facility_day_off_request) { create(:day_off_request) }

      it "同じ施設の休み希望を全て返す" do
        subject
        res = JSON.parse(response.body)
        day_off_request_ids = res["day_off_requests"].map { |day_off_request| day_off_request["id"] }
        expect(day_off_request_ids).to include(own_day_off_request.id)
        expect(day_off_request_ids).to include(other_user_day_off_request.id)
        expect(day_off_request_ids).not_to include(other_facility_day_off_request.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者でない時" do
      let!(:own_day_off_request) { create(:day_off_request, facility: user.facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type) }
      let!(:other_user_day_off_request) do
        create(:day_off_request, facility: user.facility, user: other_user, schedule_day: schedule_day, day_off_type: day_off_type)
      end

      it "自分の休み希望だけを返す" do
        subject
        res = JSON.parse(response.body)
        day_off_request_ids = res["day_off_requests"].map { |day_off_request| day_off_request["id"] }
        expect(day_off_request_ids).to include(own_day_off_request.id)
        expect(day_off_request_ids).not_to include(other_user_day_off_request.id)
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

  describe "POST /api/v1/day_off_requests" do
    subject { post(api_v1_day_off_requests_path, params: params, headers: { "Authorization": token }) }

    let(:schedule_day_date) { Date.current.next_month(2) }
    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: schedule_day_date.year, month: schedule_day_date.month) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: schedule_day_date) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility, uses_slot: true) }
    let(:params) { { day_off_request: { schedule_day_id: schedule_day.id, day_off_type_id: day_off_type.id, is_return: false } } }

    context "締切内で休み枠に空きがある時" do
      let!(:day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: day_off_type, max_slots: 2) }

      it "休み希望を作成し、休み割当も作成して approved になる" do
        expect { subject }.to change { DayOffRequest.count }.by(1).and change { DayOffAssignment.count }.by(1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(res["message"]).to eq("申請は承認されました。")
        expect(day_off_request).to be_approved
        expect(DayOffAssignment.last.user).to eq(user)
        expect(response).to have_http_status(:created)
      end
    end

    context "締切内だが休み枠が満枠の時" do
      let!(:day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: day_off_type, max_slots: 1) }
      let!(:day_off_assignment) { create(:day_off_assignment, schedule_day: schedule_day, day_off_type: day_off_type) }

      it "休み希望を作成し、rejected になる" do
        day_off_assignment_count = DayOffAssignment.count
        expect { subject }.to change { DayOffRequest.count }.by(1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(DayOffAssignment.count).to eq(day_off_assignment_count)
        expect(res["message"]).to eq("申請は否認されました。")
        expect(day_off_request).to be_rejected
        expect(response).to have_http_status(:created)
      end
    end

    context "締切内だが DayOffSlot がない時" do
      it "休み希望を作成し、pending のままになる" do
        day_off_assignment_count = DayOffAssignment.count
        expect { subject }.to change { DayOffRequest.count }.by(1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(DayOffAssignment.count).to eq(day_off_assignment_count)
        expect(res["message"]).to eq("申請しました。")
        expect(day_off_request).to be_pending
        expect(response).to have_http_status(:created)
      end
    end

    context "uses_slot が false の休みパターンの時" do
      let(:day_off_type) { create(:day_off_type, facility: user.facility, uses_slot: false) }

      it "休み枠を見ずに休み割当を作成して approved になる" do
        expect { subject }.to change { DayOffRequest.count }.by(1).and change { DayOffAssignment.count }.by(1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(res["message"]).to eq("申請は承認されました。")
        expect(day_off_request).to be_approved
        expect(response).to have_http_status(:created)
      end
    end

    context "すでに同じ休み割当がある時" do
      let!(:day_off_assignment) { create(:day_off_assignment, schedule_day: schedule_day, user: user, day_off_type: day_off_type) }

      it "休み希望を作成し、rejected になる" do
        day_off_assignment_count = DayOffAssignment.count
        expect { subject }.to change { DayOffRequest.count }.by(1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(DayOffAssignment.count).to eq(day_off_assignment_count)
        expect(res["message"]).to eq("申請は否認されました。")
        expect(day_off_request).to be_rejected
        expect(response).to have_http_status(:created)
      end
    end

    context "申請締切日を過ぎている時" do
      let(:schedule_day_date) { Date.current }

      it "休み希望だけを作成し、pending のままになる" do
        expect { subject }.to change { DayOffRequest.count }.by(1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(res["message"]).to eq("申請締切日を過ぎているため、管理者承認待ちとして申請しました。")
        expect(day_off_request).to be_pending
        expect(response).to have_http_status(:created)
      end
    end

    context "返上申請で返上対象の休み割当がある時" do
      let(:params) { { day_off_request: { schedule_day_id: schedule_day.id, day_off_type_id: day_off_type.id, is_return: true } } }
      let!(:day_off_assignment) { create(:day_off_assignment, schedule_day: schedule_day, user: user, day_off_type: day_off_type) }

      it "休み希望を作成し、休み割当を削除して approved になる" do
        expect { subject }.to change { DayOffRequest.count }.by(1).and change { DayOffAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        day_off_request = DayOffRequest.last
        expect(res["message"]).to eq("申請は承認されました。")
        expect(day_off_request).to be_approved
        expect(response).to have_http_status(:created)
      end
    end

    context "返上申請で返上対象の休み割当がない時" do
      let(:params) { { day_off_request: { schedule_day_id: schedule_day.id, day_off_type_id: day_off_type.id, is_return: true } } }

      it "作成に失敗する" do
        expect { subject }.not_to change { DayOffRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("返上対象の休み割当が存在しません。")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "別施設の対象日を指定した時" do
      let(:other_schedule_month) { create(:schedule_month, facility: create(:facility), year: 2026, month: 6) }
      let(:schedule_day) { create(:schedule_day, schedule_month: other_schedule_month, date: Date.new(2026, 6, 20)) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { DayOffRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("対象日が存在しません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休みパターンを指定した時" do
      let(:day_off_type) { create(:day_off_type, facility: create(:facility)) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { DayOffRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休みパターンが存在しません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:schedule_month) { create(:schedule_month, facility: create(:facility), year: 2026, month: 6) }
      let(:day_off_type) { create(:day_off_type) }
      let(:schedule_day_date) { Date.current }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { DayOffRequest.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/day_off_requests/:id" do
    subject { put(api_v1_day_off_request_path(day_off_request), params: params, headers: { "Authorization": token }) }

    let(:user) { create(:user, :admin) }
    let(:target_user) { create(:user, facility: user.facility) }
    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 6, 20)) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }
    let(:day_off_request) do
      create(:day_off_request, facility: user.facility, user: target_user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :pending,
                               is_return: false)
    end
    let(:params) { { day_off_request: { request_status: "approved" } } }

    context "管理者が通常申請を approved にした時" do
      it "休み希望を更新し、休み割当を作成する" do
        expect { subject }.to change { DayOffAssignment.count }.by(1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み希望を更新しました。")
        expect(day_off_request.reload).to be_approved
        expect(DayOffAssignment.last.user).to eq(target_user)
        expect(response).to have_http_status(:ok)
      end
    end

    context "すでに休み割当がある通常申請を approved にした時" do
      let!(:day_off_assignment) { create(:day_off_assignment, schedule_day: schedule_day, user: target_user, day_off_type: day_off_type) }

      it "休み割当を重複作成しない" do
        expect { subject }.not_to change { DayOffAssignment.count }
        expect(day_off_request.reload).to be_approved
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者が返上申請を approved にした時" do
      let(:day_off_request) do
        create(:day_off_request, facility: user.facility, user: target_user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :pending,
                                 is_return: true)
      end
      let!(:day_off_assignment) { create(:day_off_assignment, schedule_day: schedule_day, user: target_user, day_off_type: day_off_type) }

      it "休み希望を更新し、休み割当を削除する" do
        expect { subject }.to change { DayOffAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み希望を更新しました。")
        expect(day_off_request.reload).to be_approved
        expect(response).to have_http_status(:ok)
      end
    end

    context "管理者が rejected にした時" do
      let(:params) { { day_off_request: { request_status: "rejected" } } }

      it "休み希望だけを更新する" do
        expect { subject }.not_to change { DayOffAssignment.count }
        expect(day_off_request.reload).to be_rejected
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
      let(:day_off_request) { create(:day_off_request) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休み希望を更新しようとした時" do
      let(:day_off_request) { create(:day_off_request) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/day_off_requests/:id" do
    subject { delete(api_v1_day_off_request_path(day_off_request), headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 6) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 6, 20)) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }
    let!(:day_off_request) { create(:day_off_request, facility: user.facility, user: user, schedule_day: schedule_day, day_off_type: day_off_type) }

    context "自分の休み希望を削除する時" do
      it "削除できる" do
        expect { subject }.to change { DayOffRequest.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み希望を削除しました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "同じ施設の他人の休み希望を削除しようとした時" do
      let(:other_user) { create(:user, facility: user.facility) }
      let(:day_off_request) { create(:day_off_request, facility: user.facility, user: other_user, schedule_day: schedule_day, day_off_type: day_off_type) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { DayOffRequest.count }
        expect(response).to have_http_status(:not_found)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:day_off_request) { create(:day_off_request) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
