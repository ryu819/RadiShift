# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Facilities::Invitations", type: :request do
  let(:user) { create(:user, :admin, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/facility/invitation" do
    subject { get(api_v1_facility_invitation_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      context "管理者である時" do
        before do
          user.facility.update!(
            invite_code: "testcode",
            invite_expires_at: 1.week.from_now.end_of_day
          )
        end

        it "招待コードを取得できる" do
          subject
          res = JSON.parse(response.body)

          expect(res["invite_code"]).to eq("testcode")
          expect(res["invite_expires_at"]).to be_present
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

  describe "POST /api/v1/facility/invitation" do
    subject { post(api_v1_facility_invitation_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      context "管理者である時" do
        it "招待コードを作成できる" do
          subject
          res = JSON.parse(response.body)

          expect(res["message"]).to eq("招待コードを作成しました。")
          expect(res["invite_code"]).to eq(user.reload.facility.invite_code)
          expect(res["invite_expires_at"]).to eq(user.facility.invite_expires_at.as_json)
          expect(response).to have_http_status(:created)
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

  describe "DELETE /api/v1/facility/invitation" do
    subject { delete(api_v1_facility_invitation_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      context "管理者である時" do
        before do
          user.facility.update!(
            invite_code: "testcode",
            invite_expires_at: 1.week.from_now.end_of_day
          )
        end

        it "招待コードを削除できる" do
          subject
          res = JSON.parse(response.body)

          expect(res["message"]).to eq("招待コードを削除しました。")
          expect(user.reload.facility.invite_code).to be_nil
          expect(user.facility.invite_expires_at).to be_nil
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
