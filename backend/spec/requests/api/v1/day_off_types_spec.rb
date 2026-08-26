# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::DayOffTypes", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/day_off_types" do
    subject { get(api_v1_day_off_types_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:active_day_off_type) { create(:day_off_type, facility: user.facility, name: "休み", day_off_unit: 1.0, is_active: true) }

      let!(:inactive_day_off_type) { create(:day_off_type, facility: user.facility, name: "午後休み", day_off_unit: 0.5, is_active: false) }

      let!(:other_facility_day_off_type) { create(:day_off_type, facility: create(:facility), name: "午前休み", day_off_unit: 0.5, is_active: true) }

      it "ログインユーザーの施設の有効な休みタイプだけを返す" do
        subject
        res = JSON.parse(response.body)
        day_off_type_ids = res.map { |day_off_type| day_off_type["id"] }
        expect(day_off_type_ids).to include(active_day_off_type.id)
        expect(day_off_type_ids).not_to include(inactive_day_off_type.id)
        expect(day_off_type_ids).not_to include(other_facility_day_off_type.id)
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

  describe "POST /api/v1/day_off_types" do
    subject { post(api_v1_day_off_types_path, params: params, headers: { "Authorization": token }) }

    let(:params) { { day_off_type: { name: "休み", day_off_unit: 1.0, color_code: "#FF0000", uses_slot: false } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休みタイプを作成できる" do
        expect { subject }.to change { DayOffType.count }.by(1)
        res = JSON.parse(response.body)
        day_off_type = user.facility.day_off_types.find_by(name: "休み")
        expect(res["message"]).to eq("休みタイプを作成しました。")
        expect(day_off_type.day_off_unit).to eq(1.0)
        expect(day_off_type.color_code).to eq("#FF0000")
        expect(day_off_type.uses_slot).to be false
        expect(day_off_type.facility).to eq(user.facility)
        expect(response).to have_http_status(:created)
      end

      context "name がない時" do
        let(:params) { { day_off_type: { name: nil, day_off_unit: 1.0, color_code: "#FF0000" } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffType.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みタイプの作成に失敗しました。")
          expect(res["errors"]["name"]).to include("休みタイプ名を入力してください")
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_unit がない時" do
        let(:params) { { day_off_type: { name: "休み", day_off_unit: nil, color_code: "#FF0000" } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffType.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みタイプの作成に失敗しました。")
          expect(res["errors"]["day_off_unit"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_unit が 0 未満の時" do
        let(:params) { { day_off_type: { name: "休み", day_off_unit: -0.5, color_code: "#FF0000" } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { DayOffType.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みタイプの作成に失敗しました。")
          expect(res["errors"]["day_off_unit"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { day_off_type: { name: "休み", day_off_unit: 1.0, color_code: "#FF0000", is_active: false } } }

        it "is_active は反映されず true で作成される" do
          expect { subject }.to change { DayOffType.count }.by(1)
          day_off_type = user.facility.day_off_types.find_by(name: "休み")
          expect(day_off_type.is_active).to be true
          expect(response).to have_http_status(:created)
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

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/day_off_types/:id" do
    subject { put(api_v1_day_off_type_path(day_off_type), params: params, headers: { "Authorization": token }) }

    let(:params) { { day_off_type: { name: "午後休み", day_off_unit: 0.5, color_code: "#0000FF", uses_slot: false } } }

    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み", day_off_unit: 1.0, color_code: "#FF0000", uses_slot: true) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休みタイプを更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休みタイプを更新しました。")
        expect(day_off_type.reload.name).to eq("午後休み")
        expect(day_off_type.day_off_unit).to eq(0.5)
        expect(day_off_type.color_code).to eq("#0000FF")
        expect(day_off_type.uses_slot).to be false
        expect(response).to have_http_status(:ok)
      end

      context "name がない時" do
        let(:params) { { day_off_type: { name: nil, day_off_unit: 0.5, color_code: "#0000FF" } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みタイプの更新に失敗しました。")
          expect(res["errors"]["name"]).to be_present
          expect(day_off_type.reload.name).to eq("休み")
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "day_off_unit が 0 未満の時" do
        let(:params) { { day_off_type: { name: "午後休み", day_off_unit: -0.5, color_code: "#0000FF" } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("休みタイプの更新に失敗しました。")
          expect(res["errors"]["day_off_unit"]).to be_present
          expect(day_off_type.reload.day_off_unit).to eq(1.0)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { day_off_type: { name: "午後休み", day_off_unit: 0.5, color_code: "#0000FF", uses_slot: false, is_active: false } } }

        it "is_active は更新されない" do
          original_is_active = day_off_type.is_active
          subject
          day_off_type.reload
          expect(day_off_type.name).to eq("午後休み")
          expect(day_off_type.day_off_unit).to eq(0.5)
          expect(day_off_type.color_code).to eq("#0000FF")
          expect(day_off_type.uses_slot).to be false
          expect(day_off_type.is_active).to eq(original_is_active)
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

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休みタイプを更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:day_off_type) { create(:day_off_type, facility: create(:facility), name: "休み") }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/day_off_types/:id" do
    subject { delete(api_v1_day_off_type_path(day_off_type), headers: { "Authorization": token }) }

    let(:day_off_type) { create(:day_off_type, facility: user.facility, name: "休み", day_off_unit: 1.0, is_active: true) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "休みタイプを論理削除できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("休みタイプを削除しました。")
        expect(day_off_type.reload.is_active).to be false
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

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の休みタイプを削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:day_off_type) { create(:day_off_type, facility: create(:facility), name: "休み") }

      it "not_found エラーが返る" do
        subject
        expect(day_off_type.reload.is_active).to be true
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
