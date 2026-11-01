# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Users::Registrations", type: :request do
  describe "DELETE /api/v1/signup" do
    let(:user) { create(:user, :with_facility) }
    let(:facility) { user.facility }
    let!(:token) { login_and_get_token(user) }
    let(:past_date) { Date.current.prev_month.beginning_of_month }
    let(:past_schedule_day) do
      create(:schedule_day, schedule_month: create(:schedule_month, facility: facility, date: past_date), date: past_date)
    end
    let!(:work_assignment) { create(:work_assignment, facility: facility, user: user, schedule_day: past_schedule_day) }
    let!(:work_request) do
      create(:work_request, facility: facility, user: user, schedule_day: past_schedule_day, request_status: :approved)
    end

    it "有効なJWTでも404を返し、ユーザーと関連データを削除しない" do
      expect do
        delete "/api/v1/signup", headers: { "Authorization": token }
      end.not_to change { [User.count, WorkAssignment.count, WorkRequest.count] }

      expect(response).to have_http_status(:not_found)
      expect(user.reload.is_deleted).to be false
    end
  end

  describe "POST /api/v1/signup" do
    let(:params) do
      { user: { name: "新規ユーザー", email: "new_user@example.com", password: "password123", password_confirmation: "password123" } }
    end

    it "新規登録でき、認証メールを送る" do
      expect do
        post "/api/v1/signup", params: params, as: :json
      end.to change { User.count }.by(1).and change { ActionMailer::Base.deliveries.count }.by(1)

      expect(response).to have_http_status(:created)
    end
  end
end
