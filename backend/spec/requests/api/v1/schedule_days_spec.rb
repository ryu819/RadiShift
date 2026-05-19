# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::ScheduleDays", type: :request do
  let(:token) { login_and_get_token(user) }
  let(:schedule_month) { create(:schedule_month, facility: user.facility) }
  let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

  describe "PATCH /api/v1/schedule_days/:id" do
    subject { patch(api_v1_schedule_day_path(schedule_day), params: params, headers: { "Authorization": token }) }

    let(:params) { { schedule_day: { is_holiday: true } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      it "祝日設定を更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("祝日設定を更新しました。")
        expect(schedule_day.reload.is_holiday).to be true
        expect(response).to have_http_status(:ok)
      end

      context "permitしていない項目を送る時" do
        let(:params) { { schedule_day: { date: Date.new(2026, 1, 3), is_holiday: true } } }

        it "date は更新されない" do
          original_date = schedule_day.date
          subject
          schedule_day.reload
          expect(schedule_day.date).to eq(original_date)
          expect(schedule_day.is_holiday).to be true
          expect(response).to have_http_status(:ok)
        end
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:schedule_day) { create(:schedule_day) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
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

    context "別施設の schedule_day を更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_month) { create(:schedule_month, year: 2026, month: 1, monthly_days_off: 8.0) }
      let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end

    context "存在しない schedule_day を更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:schedule_day) { 999_999 }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("対象日が存在しません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
