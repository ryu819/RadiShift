# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::WorkTypes", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/work_types" do
    subject { get(api_v1_work_types_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:active_work_type) { create(:work_type, facility: user.facility, name: "日勤", is_active: true) }
      let!(:inactive_work_type) { create(:work_type, facility: user.facility, name: "夜勤", is_active: false) }

      let!(:other_facility_work_type) { create(:work_type, name: "遅番", is_active: true) }

      it "ログインユーザーの施設の有効な勤務パターンだけを返す" do
        subject
        res = JSON.parse(response.body)
        work_type_ids = res["work_types"].map { |work_type| work_type["id"] }
        expect(work_type_ids).to include(active_work_type.id)
        expect(work_type_ids).not_to include(inactive_work_type.id)
        expect(work_type_ids).not_to include(other_facility_work_type.id)
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

  describe "POST /api/v1/work_types" do
    subject { post(api_v1_work_types_path, params: params, headers: { "Authorization": token }) }

    let(:params) { { work_type: { name: "日勤", color_code: "#FF0000" } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      it "勤務パターンを作成できる" do
        expect { subject }.to change { WorkType.count }.by(1)

        res = JSON.parse(response.body)
        work_type = user.facility.work_types.find_by(name: "日勤")

        expect(res["message"]).to eq("勤務パターンを作成しました。")
        expect(work_type.color_code).to eq("#FF0000")
        expect(work_type.facility).to eq(user.facility)
        expect(response).to have_http_status(:created)
      end

      context "name がない時" do
        let(:params) { { work_type: { name: nil, color_code: "#FF0000" } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { WorkType.count }

          res = JSON.parse(response.body)

          expect(res["message"]).to eq("勤務パターンの作成に失敗しました。")
          expect(res["errors"]["name"]).to include("勤務パターン名を入力してください")
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "permitしていない項目を送る時" do
        let(:params) { { work_type: { name: "日勤", color_code: "#FF0000", is_active: false } } }

        it "is_active は反映されず true で作成される" do
          expect { subject }.to change { WorkType.count }.by(1)

          work_type = user.facility.work_types.find_by(name: "日勤")

          expect(work_type.color_code).to eq("#FF0000")
          expect(work_type.is_active).to be true
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

  describe "PUT /api/v1/work_types/:id" do
    subject { put(api_v1_work_type_path(work_type), params: params, headers: { "Authorization": token }) }

    let(:params) { { work_type: { name: "夜勤", color_code: "#0000FF" } } }

    let(:work_type) { create(:work_type, facility: user.facility, name: "日勤", color_code: "#FF0000") }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      it "勤務パターンを更新できる" do
        subject
        res = JSON.parse(response.body)

        expect(res["message"]).to eq("勤務パターンを更新しました。")
        expect(work_type.reload.name).to eq("夜勤")
        expect(work_type.color_code).to eq("#0000FF")
        expect(response).to have_http_status(:ok)
      end

      context "permitしていない項目を送る時" do
        let(:params) { { work_type: { name: "夜勤", color_code: "#0000FF", is_active: false } } }

        it "is_active は更新されない" do
          original_is_active = work_type.is_active
          subject
          work_type.reload
          expect(work_type.name).to eq("夜勤")
          expect(work_type.color_code).to eq("#0000FF")
          expect(work_type.is_active).to eq(original_is_active)
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
      let(:work_type) { create(:work_type, name: "日勤", color_code: "#FF0000") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の勤務パターンを更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:other_facility) { create(:facility) }
      let(:work_type) { create(:work_type, facility: other_facility, name: "日勤") }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/work_types/:id" do
    subject { delete(api_v1_work_type_path(work_type), headers: { "Authorization": token }) }

    let(:work_type) { create(:work_type, facility: user.facility, name: "日勤", is_active: true) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }
      it "勤務パターンを論理削除できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("勤務パターンを削除しました。")
        expect(work_type.reload.is_active).to be false
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
      let(:work_type) { create(:work_type, name: "日勤", color_code: "#FF0000") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設の勤務パターンを削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:other_facility) { create(:facility) }
      let(:work_type) { create(:work_type, facility: other_facility, name: "日勤") }

      it "not_found エラーが返る" do
        subject
        expect(work_type.reload.is_active).to be true
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
