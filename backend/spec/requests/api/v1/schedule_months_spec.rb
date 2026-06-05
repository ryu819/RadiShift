# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::ScheduleMonths", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/schedule_months" do
    subject { get(api_v1_schedule_months_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:february_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 2) }
      let!(:january_schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }

      let!(:other_facility_schedule_month) { create(:schedule_month, year: 2026, month: 3) }

      it "正常にログインユーザーの施設の対象月一覧を取得できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["schedule_months"].map { |schedule_month| schedule_month["id"] }).to eq(
          [
            january_schedule_month.id,
            february_schedule_month.id
          ]
        )
        expect(res["schedule_months"].map { |schedule_month| schedule_month["id"] }).not_to include(
          other_facility_schedule_month.id
        )
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

  describe "GET /api/v1/schedule_months/:id" do
    subject { get(api_v1_schedule_month_path(schedule_month), headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }
      let!(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
      let!(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }
      let!(:day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: day_off_type, max_slots: 5) }

      it "正常に対象月・日付一覧・休み枠一覧を取得できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["schedule_month"]["id"]).to eq(schedule_month.id)
        expect(res["schedule_month"]["schedule_days"].first["id"]).to eq(schedule_day.id)
        expect(res["schedule_month"]["schedule_days"].first["day_off_slots"].first["id"]).to eq(day_off_slot.id)
        expect(res["schedule_month"]["schedule_days"].first["day_off_slots"].first["max_slots"]).to eq(5)
        expect(res["schedule_month"]["schedule_days"].first["day_off_slots"].first["day_off_type"]["id"]).to eq(day_off_type.id)
        expect(res["schedule_month"]["schedule_days"].first["day_off_slots"].first["day_off_type"]["name"]).to eq("休み")
        expect(response).to have_http_status(:ok)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:schedule_month) { create(:schedule_month, year: 2026, month: 1) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の対象月を指定した時" do
      let!(:schedule_month) { create(:schedule_month, year: 2026, month: 1) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/schedule_months" do
    subject { post(api_v1_schedule_months_path, params: params, headers: { "Authorization": token }) }

    let(:params) { { schedule_month: { year: 2026, month: 1, monthly_days_off: 8.0 } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }

      before do
        (0..7).each do |weekday|
          create(:day_off_slot_rule, facility: user.facility, day_off_type: day_off_type, weekday: weekday, max_slots: 5)
        end
      end

      it "正常に対象月のシフトを作成できる" do
        expect { subject }
          .to change { ScheduleMonth.count }.by(1)
                .and change { ScheduleDay.count }.by(31)
                       .and change { DayOffSlot.count }.by(31)

        res = JSON.parse(response.body)
        schedule_month = user.facility.schedule_months.find_by(year: 2026, month: 1)

        expect(res["message"]).to eq("対象月のシフトを作成しました。")
        expect(schedule_month.monthly_days_off).to eq(8.0)
        expect(response).to have_http_status(:created)
      end

      it "対象月の日数分 schedule_days が作成される" do
        subject
        schedule_month = user.facility.schedule_months.find_by(year: 2026, month: 1)
        expect(schedule_month.schedule_days.count).to eq(31)
      end

      it "対象月の日数分 day_off_slots が作成される" do
        subject
        schedule_month = user.facility.schedule_months.find_by(year: 2026, month: 1)
        expect(DayOffSlot.joins(schedule_day: :schedule_month).where(schedule_months: { id: schedule_month.id }).count).to eq(31)
      end

      it "休み枠ルールの max_slots を使って day_off_slots が作成される" do
        subject

        schedule_month = user.facility.schedule_months.find_by(year: 2026, month: 1)
        schedule_day = schedule_month.schedule_days.find_by(date: Date.new(2026, 1, 2))
        day_off_slot = schedule_day.day_off_slots.find_by(day_off_type: day_off_type)

        expect(day_off_slot.max_slots).to eq(5)
      end

      it "祝日は is_holiday が true で作成される" do
        subject
        schedule_month = user.facility.schedule_months.find_by(year: 2026, month: 1)
        schedule_day = schedule_month.schedule_days.find_by(date: Date.new(2026, 1, 1))
        expect(schedule_day.is_holiday).to be(true)
      end

      context "バリデーションエラーの時" do
        let(:params) { { schedule_month: { year: 2026, month: 13, monthly_days_off: 8.0 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { ScheduleMonth.count }

          res = JSON.parse(response.body)

          expect(response).to have_http_status(:unprocessable_content)
          expect(res["errors"]).to be_present
          expect(res["message"]).to eq("対象月のシフト作成に失敗しました。")
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

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/schedule_months/:id" do
    subject { put(api_v1_schedule_month_path(schedule_month), params: params, headers: { "Authorization": token }) }

    let(:params) { { schedule_month: { monthly_days_off: 9.5 } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      let!(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1, monthly_days_off: 8.0) }

      it "正常に対象月のシフトを更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("対象月のシフトを更新しました。")
        expect(schedule_month.reload.monthly_days_off).to eq(9.5)
        expect(response).to have_http_status(:ok)
      end

      context "バリデーションエラーの時" do
        let(:params) { { schedule_month: { monthly_days_off: "" } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(response).to have_http_status(:unprocessable_content)
          expect(res["errors"]).to be_present
          expect(res["message"]).to eq("対象月のシフトの更新に失敗しました。")
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { schedule_month: { year: 2027, month: 12, monthly_days_off: 9.0 } } }

        it "year と month は更新されない" do
          original_year = schedule_month.year
          original_month = schedule_month.month
          subject
          schedule_month.reload
          expect(schedule_month.year).to eq(original_year)
          expect(schedule_month.month).to eq(original_month)
          expect(schedule_month.monthly_days_off).to eq(9.0)
          expect(response).to have_http_status(:ok)
        end
      end
    end

    context "管理者でない時" do
      let!(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:schedule_month) { create(:schedule_month, year: 2026, month: 1) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の対象月を指定した時" do
      let(:user) { create(:user, :admin) }
      let!(:schedule_month) { create(:schedule_month, year: 2026, month: 1, monthly_days_off: 8.0) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/schedule_months/:id" do
    subject { delete(api_v1_schedule_month_path(schedule_month), headers: { "Authorization": token }) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      let!(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }

      let!(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }

      it "正常に対象月のシフトを削除できる" do
        expect { subject }.to change { ScheduleMonth.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("対象月のシフトを削除しました。")
        expect(response).to have_http_status(:ok)
      end

      it "紐づく schedule_days も削除される" do
        expect { subject }.to change { ScheduleDay.count }.by(-1)
      end
    end

    context "管理者でない時" do
      let!(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:schedule_month) { create(:schedule_month, year: 2026, month: 1) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の対象月を指定した時" do
      let(:user) { create(:user, :admin) }
      let!(:schedule_month) { create(:schedule_month, year: 2026, month: 1) }

      it "not_found エラーが返る" do
        expect { subject }.not_to change { ScheduleMonth.count }
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
