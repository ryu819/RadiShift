# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Admin::PendingRequests", type: :request do
  let(:user) { create(:user, :admin) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/admin/pending_requests" do
    subject { get(api_v1_admin_pending_requests_path, headers: { "Authorization": token }) }

    let(:other_user) { create(:user, facility: user.facility) }
    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 9) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 9, 10)) }
    let(:work_type) { create(:work_type, facility: user.facility) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }

    context "管理者である時" do
      let!(:pending_day_off_request) do
        create(:day_off_request, facility: user.facility, user: other_user, schedule_day: schedule_day, day_off_type: day_off_type, request_status: :pending)
      end

      let!(:approved_work_request) do
        create(:work_request, facility: user.facility, user: other_user, schedule_day: schedule_day, work_type: work_type, request_status: :approved)
      end

      let!(:rejected_day_off_request) do
        create(:day_off_request, facility: user.facility, user: other_user, schedule_day: schedule_day, day_off_type: day_off_type,
                                 request_status: :rejected)
      end

      let!(:other_facility_work_request) { create(:work_request, facility: create(:facility)) }

      it "自施設の未処理申請だけを返す" do
        subject
        res = JSON.parse(response.body)
        request_ids = res.map { |request| [request["request_kind"], request["id"]] }
        expect(request_ids).to include(["day_off", pending_day_off_request.id])
        expect(request_ids).not_to include(["work", approved_work_request.id],
                                           ["day_off", rejected_day_off_request.id],
                                           ["work", other_facility_work_request.id])
        expect(response).to have_http_status(:ok)
      end
    end

    context "未処理申請がない時" do
      it "空の配列を返す" do
        subject
        res = JSON.parse(response.body)
        expect(res).to eq([])
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

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
