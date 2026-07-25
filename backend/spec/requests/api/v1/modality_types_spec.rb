# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::ModalityTypes", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/modality_types" do
    subject { get(api_v1_modality_types_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:active_modality_type) { create(:modality_type, facility: user.facility, name: "CT", is_active: true) }
      let!(:inactive_modality_type) { create(:modality_type, facility: user.facility, name: "MRI", is_active: false) }
      let!(:other_facility_modality_type) { create(:modality_type, facility: create(:facility), name: "一般撮影", is_active: true) }

      it "ログインユーザーの施設の有効なモダリティパターンだけを返す" do
        subject
        res = JSON.parse(response.body)
        modality_type_ids = res.map { |modality_type| modality_type["id"] }
        expect(modality_type_ids).to include(active_modality_type.id)
        expect(modality_type_ids).not_to include(inactive_modality_type.id)
        expect(modality_type_ids).not_to include(other_facility_modality_type.id)
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

  describe "POST /api/v1/modality_types" do
    subject { post(api_v1_modality_types_path, params: params, headers: { "Authorization": token }) }

    let(:params) { { modality_type: { name: "CT", color_code: "#FF0000" } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "モダリティパターンを作成できる" do
        expect { subject }.to change { ModalityType.count }.by(1)
        res = JSON.parse(response.body)
        modality_type = user.facility.modality_types.find_by(name: "CT")
        expect(res["message"]).to eq("モダリティパターンを作成しました。")
        expect(modality_type.color_code).to eq("#FF0000")
        expect(modality_type.facility).to eq(user.facility)
        expect(response).to have_http_status(:created)
      end

      context "name がない時" do
        let(:params) { { modality_type: { name: nil, color_code: "#FF0000" } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { ModalityType.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティパターンの作成に失敗しました。")
          expect(res["errors"]["name"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { modality_type: { name: "CT", color_code: "#FF0000", is_active: false } } }

        it "is_active は反映されず true で作成される" do
          expect { subject }.to change { ModalityType.count }.by(1)
          modality_type = user.facility.modality_types.find_by(name: "CT")
          expect(modality_type.is_active).to be true
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

  describe "PUT /api/v1/modality_types/:id" do
    subject { put(api_v1_modality_type_path(modality_type), params: params, headers: { "Authorization": token }) }

    let(:params) { { modality_type: { name: "MRI", color_code: "#0000FF" } } }

    let(:modality_type) { create(:modality_type, facility: user.facility, name: "CT", color_code: "#FF0000") }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "モダリティパターンを更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("モダリティパターンを更新しました。")
        expect(modality_type.reload.name).to eq("MRI")
        expect(modality_type.color_code).to eq("#0000FF")
        expect(response).to have_http_status(:ok)
      end

      context "name がない時" do
        let(:params) { { modality_type: { name: nil, color_code: "#0000FF" } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティパターンの更新に失敗しました。")
          expect(res["errors"]["name"]).to be_present
          expect(modality_type.reload.name).to eq("CT")
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { modality_type: { name: "MRI", color_code: "#0000FF", is_active: false } } }

        it "is_active は更新されない" do
          original_is_active = modality_type.is_active
          subject
          modality_type.reload
          expect(modality_type.name).to eq("MRI")
          expect(modality_type.color_code).to eq("#0000FF")
          expect(modality_type.is_active).to eq(original_is_active)
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
      let(:modality_type) { create(:modality_type, name: "CT", color_code: "#FF0000") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のモダリティパターンを更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:modality_type) { create(:modality_type, facility: create(:facility), name: "CT") }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/modality_types/:id" do
    subject { delete(api_v1_modality_type_path(modality_type), headers: { "Authorization": token }) }

    let(:modality_type) { create(:modality_type, facility: user.facility, name: "CT", is_active: true) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "モダリティパターンを論理削除できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("モダリティパターンを削除しました。")
        expect(modality_type.reload.is_active).to be false
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
      let(:modality_type) { create(:modality_type, name: "CT") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のモダリティパターンを削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:modality_type) { create(:modality_type, facility: create(:facility), name: "CT") }

      it "not_found エラーが返る" do
        subject
        expect(modality_type.reload.is_active).to be true
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
