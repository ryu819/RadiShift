# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::DayOffSlotRules", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/day_off_slot_rules" do
    subject { get(api_v1_day_off_slot_rules_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }
      let!(:day_off_slot_rule) { create(:day_off_slot_rule, facility: user.facility, day_off_type: day_off_type, weekday: 1, max_slots: 5) }

      let(:other_facility) { create(:facility) }
      let(:other_day_off_type) { create(:day_off_type, facility: other_facility, name: "休み") }
      let!(:other_facility_day_off_slot_rule) do
        create(:day_off_slot_rule, facility: other_facility, day_off_type: other_day_off_type, weekday: 1, max_slots: 5)
      end

      it "ログインユーザーの施設の休み枠ルールだけを返す" do
        subject
        res = JSON.parse(response.body)
        day_off_slot_rule_ids = res["day_off_slot_rules"].map { |rule| rule["id"] }
        expect(day_off_slot_rule_ids).to include(day_off_slot_rule.id)
        expect(day_off_slot_rule_ids).not_to include(other_facility_day_off_slot_rule.id)
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

  describe "POST /api/v1/day_off_slot_rules" do
    subject { post(api_v1_day_off_slot_rules_path, params: params, headers: { "Authorization": token }) }

    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }

    let(:params) { {  day_off_slot_rule: { day_off_type_id: day_off_type.id, weekday: 1, max_slots: 5 } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み枠ルールを作成できる" do
        expect { subject }.to change { DayOffSlotRule.count }.by(1)
        res = JSON.parse(response.body)
        day_off_slot_rule = user.facility.day_off_slot_rules.find_by(day_off_type_id: day_off_type.id, weekday: 1)
        expect(res["message"]).to eq("休み枠ルールを作成しました。")
        expect(day_off_slot_rule.max_slots).to eq(5)
        expect(day_off_slot_rule.facility).to eq(user.facility)
        expect(response).to have_http_status(:created)
      end

      context "day_off_type_id がない時" do
        let(:params) { { day_off_slot_rule: { day_off_type_id: nil, weekday: 1, max_slots: 5 } } }

        it "unprocessable_content エラーが返る" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの作成に失敗しました。")
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の day_off_type_id を送る時" do
        let(:other_facility) { create(:facility) }
        let(:other_day_off_type) { create(:day_off_type, facility: other_facility, name: "休み") }

        let(:params) { { day_off_slot_rule: { day_off_type_id: other_day_off_type.id, weekday: 1, max_slots: 5 } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "weekday がない時" do
        let(:params) { { day_off_slot_rule: { day_off_type_id: day_off_type.id, weekday: nil, max_slots: 5 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの作成に失敗しました。")
          expect(res["errors"]["weekday"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が 7 より大きい時" do
        let(:params) { { day_off_slot_rule: { day_off_type_id: day_off_type.id, weekday: 8, max_slots: 5 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの作成に失敗しました。")
          expect(res["errors"]["weekday"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "max_slots がない時" do
        let(:params) { { day_off_slot_rule: { day_off_type_id: day_off_type.id, weekday: 1, max_slots: nil } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの作成に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "max_slots が 0 未満の時" do
        let(:params) { { day_off_slot_rule: { day_off_type_id: day_off_type.id, weekday: 1, max_slots: -1 } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの作成に失敗しました。")
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
      let(:day_off_type) { create(:day_off_type, name: "休み") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/day_off_slot_rules/:id" do
    subject { put(api_v1_day_off_slot_rule_path(day_off_slot_rule), params: params, headers: { "Authorization": token }) }

    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }
    let(:day_off_slot_rule) { create(:day_off_slot_rule, facility: user.facility, day_off_type: day_off_type, weekday: 1, max_slots: 5) }

    let(:params) { {  day_off_slot_rule: { max_slots: 4 } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み枠ルールを更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み枠ルールを更新しました。")
        expect(day_off_slot_rule.reload.max_slots).to eq(4)
        expect(response).to have_http_status(:ok)
      end

      context "max_slots がない時" do
        let(:params) { { day_off_slot_rule: { max_slots: nil } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの更新に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(day_off_slot_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "max_slots が 0 未満の時" do
        let(:params) { { day_off_slot_rule: { day_off_type_id: day_off_type.id, weekday: 2, max_slots: -1 } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休み枠ルールの更新に失敗しました。")
          expect(res["errors"]["max_slots"]).to be_present
          expect(day_off_slot_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:other_day_off_type) { create(:day_off_type, facility: user.facility, name: "午後休み") }
        let(:params) { { day_off_slot_rule: { day_off_type_id: other_day_off_type.id, weekday: 2, max_slots: 4 } } }

        it "day_off_type_id と weekday は更新されない" do
          subject
          day_off_slot_rule.reload
          expect(day_off_slot_rule.day_off_type).to eq(day_off_type)
          expect(day_off_slot_rule.weekday).to eq(1)
          expect(day_off_slot_rule.max_slots).to eq(4)
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
      let(:day_off_type) { create(:day_off_type, name: "休み", day_off_unit: 1.0) }
      let(:day_off_slot_rule) { create(:day_off_slot_rule) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休み枠ルールを更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:other_facility) { create(:facility) }
      let(:other_day_off_type) { create(:day_off_type, facility: other_facility, name: "休み") }
      let(:day_off_slot_rule) { create(:day_off_slot_rule, facility: other_facility, day_off_type: other_day_off_type, weekday: 1, max_slots: 5) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/day_off_slot_rules/:id" do
    subject { delete(api_v1_day_off_slot_rule_path(day_off_slot_rule), headers: { "Authorization": token }) }

    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }
    let!(:day_off_slot_rule) { create(:day_off_slot_rule, facility: user.facility, day_off_type: day_off_type, weekday: 1, max_slots: 5) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休み枠ルールを削除できる" do
        expect { subject }.to change { DayOffSlotRule.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み枠ルールを削除しました。")
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
      let(:day_off_type) { create(:day_off_type, name: "休み", day_off_unit: 1.0) }
      let(:day_off_slot_rule) { create(:day_off_slot_rule) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休み枠ルールを削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:other_facility) { create(:facility) }
      let(:other_day_off_type) { create(:day_off_type, facility: other_facility, name: "休み") }
      let(:day_off_slot_rule) { create(:day_off_slot_rule, facility: other_facility, day_off_type: other_day_off_type, weekday: 1, max_slots: 5) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
