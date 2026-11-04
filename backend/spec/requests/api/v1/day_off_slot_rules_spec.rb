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
        day_off_slot_rule_ids = res.map { |rule| rule["id"] }
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

  describe "PATCH /api/v1/day_off_slot_rules/bulk_update" do
    subject do
      patch(bulk_update_api_v1_day_off_slot_rules_path, params: params, headers: { "Authorization": token }, as: :json)
    end

    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み") }
    let!(:monday_rule) { create(:day_off_slot_rule, facility: user.facility, day_off_type: day_off_type, weekday: 1, max_slots: 5) }
    let(:rules) { [{ weekday: 1, max_slots: 2 }, { weekday: 2, max_slots: 3 }] }
    let(:params) { { day_off_type_id: day_off_type.id, day_off_slot_rules: rules } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "未設定の曜日を作成し、設定済みの曜日を更新できる" do
        expect { subject }.to change { DayOffSlotRule.count }.by(1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休み枠ルールを保存しました。")
        expect(monday_rule.reload.max_slots).to eq(2)
        expect(DayOffSlotRule.find_by(weekday: 2).max_slots).to eq(3)
        expect(response).to have_http_status(:ok)
      end

      it "他の休みタイプのルールは変わらない" do
        other_day_off_type = create(:day_off_type, facility: user.facility, name: "午後休み")
        other_rule = create(:day_off_slot_rule, facility: user.facility, day_off_type: other_day_off_type, weekday: 1, max_slots: 7)
        subject
        expect(other_rule.reload.max_slots).to eq(7)
      end

      it "作成済みシフト月の日別休み枠は変わらない" do
        day_off_slot = create(:day_off_slot, facility: user.facility, day_off_type: day_off_type, max_slots: 4)
        subject
        expect(day_off_slot.reload.max_slots).to eq(4)
      end

      context "8曜日すべてを送る時" do
        let(:rules) { (0..7).map { |weekday| { weekday: weekday, max_slots: 1 } } }

        it "8曜日分のルールになる" do
          expect { subject }.to change { DayOffSlotRule.count }.by(7)
          expect(response).to have_http_status(:ok)
        end
      end

      context "別施設の休みタイプを指定した時" do
        let(:day_off_type) { create(:day_off_type, facility: create(:facility), name: "休み") }
        let!(:monday_rule) { nil }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みパターンが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "uses_slot が false の休みタイプを指定した時" do
        let(:day_off_type) { create(:day_off_type, facility: user.facility, uses_slot: false) }

        it "保存しない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "無効化された休みタイプを指定した時" do
        let(:day_off_type) { create(:day_off_type, facility: user.facility, is_active: false) }

        it "保存しない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "1行だけ max_slots が 0 未満の時" do
        let(:rules) { [{ weekday: 1, max_slots: 2 }, { weekday: 2, max_slots: -1 }] }

        it "全件保存せず、曜日ごとのエラーを返す" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          res = JSON.parse(response.body)
          expect(res["errors"]["2"]).to be_present
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "1行だけ max_slots が空の時" do
        let(:rules) { [{ weekday: 1, max_slots: 2 }, { weekday: 2, max_slots: "" }] }

        it "全件保存しない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "1行だけ max_slots が小数の時" do
        let(:rules) { [{ weekday: 1, max_slots: 2 }, { weekday: 2, max_slots: 1.5 }] }

        it "全件保存しない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_slot_rules が空の時" do
        let(:rules) { [] }

        it "unprocessable_content エラーが返る" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_slot_rules の中身がオブジェクトでない時" do
        let(:rules) { [1] }

        it "unprocessable_content エラーが返る" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が 8 の時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { weekday: 8, max_slots: 2 }] }

        it "全件保存しない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が小数（1.5）の時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { weekday: 1.5, max_slots: 2 }] }

        it "全件保存せず、月曜も変わらない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が 1.0 の時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { weekday: 1.0, max_slots: 2 }] }

        it "全件保存せず、月曜も変わらない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が文字列（\"1\"）の時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { weekday: "1", max_slots: 2 }] }

        it "全件保存せず、月曜も変わらない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が文字列（\"1.5\"）の時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { weekday: "1.5", max_slots: 2 }] }

        it "全件保存せず、月曜も変わらない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday が null の時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { weekday: nil, max_slots: 2 }] }

        it "全件保存せず、月曜も変わらない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "weekday がない時" do
        let(:rules) { [{ weekday: 2, max_slots: 3 }, { max_slots: 2 }] }

        it "全件保存せず、月曜も変わらない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "同じ weekday を2つ送った時" do
        let(:rules) { [{ weekday: 1, max_slots: 2 }, { weekday: 1, max_slots: 3 }] }

        it "全件保存しない" do
          expect { subject }.not_to change { DayOffSlotRule.count }
          expect(monday_rule.reload.max_slots).to eq(5)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }

      it "forbidden エラーが返る" do
        expect { subject }.not_to change { DayOffSlotRule.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(monday_rule.reload.max_slots).to eq(5)
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:day_off_type) { create(:day_off_type, name: "休み") }
      let!(:monday_rule) { nil }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
