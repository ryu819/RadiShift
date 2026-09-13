# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::DayOffSlots", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "POST /api/v1/day_off_slots" do
    subject { post(api_v1_day_off_slots_path, params: params, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }
    let(:params) { { day_off_slot: { schedule_day_id: schedule_day.id, day_off_type_id: day_off_type.id, max_slots: 5 } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み枠を作成できる" do
        expect { subject }.to change { DayOffSlot.count }.by(1)
        res = JSON.parse(response.body)
        day_off_slot = DayOffSlot.find_by(schedule_day: schedule_day, day_off_type: day_off_type)
        expect(res["message"]).to eq("休み枠を作成しました。")
        expect(day_off_slot.max_slots).to eq(5)
        expect(response).to have_http_status(:created)
      end

      context "schedule_day_id がない時" do
        let(:params) { { day_off_slot: { schedule_day_id: nil, day_off_type_id: day_off_type.id, max_slots: 5 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlot.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠の作成に失敗しました。")
          expect(res["errors"]["schedule_day"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_type_id がない時" do
        let(:params) { { day_off_slot: { schedule_day_id: schedule_day.id, day_off_type_id: nil, max_slots: 5 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlot.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠の作成に失敗しました。")
          expect(res["errors"]["day_off_type"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の schedule_day_id を送る時" do
        let(:other_facility) { create(:facility) }
        let(:other_schedule_month) { create(:schedule_month, facility: other_facility) }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }
        let(:params) { { day_off_slot: { schedule_day_id: other_schedule_day.id, day_off_type_id: day_off_type.id, max_slots: 5 } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffSlot.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("対象日が存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の day_off_type_id を送る時" do
        let(:other_facility) { create(:facility) }
        let(:other_day_off_type) { create(:day_off_type, facility: other_facility) }
        let(:params) { { day_off_slot: { schedule_day_id: schedule_day.id, day_off_type_id: other_day_off_type.id, max_slots: 5 } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffSlot.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "max_slots がない時" do
        let(:params) { { day_off_slot: { schedule_day_id: schedule_day.id, day_off_type_id: day_off_type.id, max_slots: nil } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlot.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠の作成に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "max_slots が 0 未満の時" do
        let(:params) { { day_off_slot: { schedule_day_id: schedule_day.id, day_off_type_id: day_off_type.id, max_slots: -1 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlot.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠の作成に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
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
      let(:params) { { day_off_slot: { schedule_day_id: 1, day_off_type_id: 1, max_slots: 5 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/day_off_slots/:id" do
    subject { put(api_v1_day_off_slot_path(day_off_slot), params: params, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:day_off_type) { create(:day_off_type, facility: user.facility) }
    let(:day_off_slot) { create(:day_off_slot, schedule_day: schedule_day, day_off_type: day_off_type, max_slots: 5) }
    let(:params) { { day_off_slot: { max_slots: 3 } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み枠を更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み枠を更新しました。")
        expect(day_off_slot.reload.max_slots).to eq(3)
        expect(response).to have_http_status(:ok)
      end

      context "max_slots がない時" do
        let(:params) { { day_off_slot: { max_slots: nil } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠の更新に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(day_off_slot.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "max_slots が 0 未満の時" do
        let(:params) { { day_off_slot: { max_slots: -1 } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠の更新に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(day_off_slot.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { day_off_slot: { schedule_day_id: schedule_day.id + 1, day_off_type_id: day_off_type.id + 1, max_slots: 2 } } }

        it "schedule_day_id と day_off_type_id は更新されない" do
          subject
          day_off_slot.reload
          expect(day_off_slot.schedule_day_id).to eq(schedule_day.id)
          expect(day_off_slot.day_off_type_id).to eq(day_off_type.id)
          expect(day_off_slot.max_slots).to eq(2)
          expect(response).to have_http_status(:ok)
        end
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
      let(:day_off_slot) { create(:day_off_slot) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休み枠を更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:other_facility) { create(:facility) }
      let(:other_schedule_month) { create(:schedule_month, facility: other_facility) }
      let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }
      let(:other_day_off_type) { create(:day_off_type, facility: other_facility) }
      let(:day_off_slot) { create(:day_off_slot, schedule_day: other_schedule_day, day_off_type: other_day_off_type, max_slots: 5) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
