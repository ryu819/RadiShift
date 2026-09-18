# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Facilities", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }
  describe "GET /api/v1/facility" do
    subject { get(api_v1_facility_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      it "正常にログインユーザーの所属施設を取得できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["id"]).to eq(user.facility_id)
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

  describe "POST /api/v1/facility" do
    subject { post(api_v1_facility_path, params: params, headers: { "Authorization": token }) }

    let(:params) { { facility: { name: "テスト病院" } } }

    context "施設に所属していない時" do
      let(:user) { create(:user) }

      it "正常に施設を作成できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("新規施設を作成しました。")
        expect(user.reload.facility.name).to eq("テスト病院")
        expect(response).to have_http_status(:created)
      end

      it "施設を作成したユーザーが管理者として登録されている" do
        subject
        expect(user.reload.is_admin).to be(true)
      end

      context "バリデーションエラーの時" do
        let(:params) { { facility: { name: "" } } }
        it "作成に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(response).to have_http_status(:unprocessable_content)
          expect(res["errors"]).to be_present
          expect(res["message"]).to eq("施設作成に失敗しました。")
        end
      end
    end

    context "施設に所属している時" do
      it "conflict エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("すでに施設に所属しています。")
        expect(response).to have_http_status(:conflict)
      end
    end
  end

  describe "PUT /api/v1/facility" do
    subject { put(api_v1_facility_path, params: params, headers: { "Authorization": token }) }

    let(:params) { { facility: { name: "テスト更新病院" } } }

    context "施設に所属している時" do
      context "管理者である時" do
        let(:admin_user) { create(:user, :admin) }
        let(:token) { login_and_get_token(admin_user) }
        it "正常に施設を更新できる" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("施設情報を更新しました。")
          expect(admin_user.reload.facility.name).to eq("テスト更新病院")
          expect(response).to have_http_status(:ok)
        end
      end

      context "管理者でバリデーションエラーの時" do
        let(:admin_user) { create(:user, :admin) }
        let(:token) { login_and_get_token(admin_user) }
        let(:params) { { facility: { name: "" } } }

        it "更新に失敗する" do
          subject
          res = JSON.parse(response.body)
          expect(response).to have_http_status(:unprocessable_content)
          expect(res["errors"]).to be_present
          expect(res["message"]).to eq("施設の更新に失敗しました。")
        end
      end

      context "管理者でpermitしていない項目を送る時" do
        let(:admin_user) { create(:user, :admin) }
        let(:token) { login_and_get_token(admin_user) }
        let(:params) { { facility: { invite_code: "testcode" } } }
        it "invite_code は更新されない" do
          expect do
            subject
          end.not_to change { admin_user.reload.facility.invite_code }
          expect(response).to have_http_status(:ok)
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

  describe "DELETE /api/v1/facility" do
    subject { delete(api_v1_facility_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      context "管理者である時" do
        let!(:admin_user) { create(:user, :admin, :with_facility) }
        let!(:token) { login_and_get_token(admin_user) }
        it "正常に施設を削除できる" do
          expect { subject }
            .to change { Facility.count }.by(-1)

          res = JSON.parse(response.body)
          expect(res["message"]).to eq("施設を削除しました。")
          expect(response).to have_http_status(:ok)
        end

        it "削除後にユーザーは管理者権限を失い、施設から外れる" do
          subject
          expect(admin_user.reload.is_admin).to be(false)
          expect(admin_user.reload.facility).to be_nil
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

  describe "POST /api/v1/facility/join" do
    subject { post(join_api_v1_facility_path, params: params, headers: { "Authorization": token }) }

    let(:facility) { create(:facility) }
    let(:params) { { invite_code: facility.invite_code } }

    context "施設に所属していない時" do
      let(:user) { create(:user) }

      it "正常に施設に参加できる" do
        subject
        res = JSON.parse(response.body)

        expect(res["message"]).to eq("施設に参加しました。")
        expect(user.reload.facility).to eq(facility)
        expect(response).to have_http_status(:ok)
      end

      context "invite_codeがない時" do
        let(:params) { {} }

        it "bad_request エラーが返る" do
          subject
          res = JSON.parse(response.body)

          expect(res["message"]).to eq("招待コードが必要です。")
          expect(response).to have_http_status(:bad_request)
        end
      end

      context "存在しない招待コードを送った時" do
        let(:params) { { invite_code: "INVALID_CODE" } }

        it "not_found エラーが返る" do
          subject
          res = JSON.parse(response.body)

          expect(res["message"]).to eq("施設が存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "招待コードの有効期限が切れている時" do
        let(:facility) { create(:facility, invite_expires_at: 1.day.ago) }

        it "gone エラーが返る" do
          subject
          res = JSON.parse(response.body)

          expect(res["message"]).to eq("招待コードの有効期限が切れています。")
          expect(response).to have_http_status(:gone)
        end
      end
    end

    context "すでに施設に所属している時" do
      it "conflict エラーが返る" do
        subject
        res = JSON.parse(response.body)

        expect(res["message"]).to eq("すでに施設に所属しています。")
        expect(response).to have_http_status(:conflict)
      end
    end
  end

  describe "DELETE /api/v1/facility/leave" do
    subject { delete(leave_api_v1_facility_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      context "一般ユーザーの時" do
        let(:future_schedule_month) { create(:schedule_month, facility: user.facility, date: Date.current.next_month.beginning_of_month) }
        let(:future_schedule_day) { create(:schedule_day, schedule_month: future_schedule_month, date: Date.current.next_month.beginning_of_month) }
        let!(:future_work_assignment) { create(:work_assignment, user: user, schedule_day: future_schedule_day) }

        it "シフトデータを削除して施設から脱退できる" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("施設を脱退しました。")
          expect(user.reload.facility).to be_nil
          expect(WorkAssignment.exists?(future_work_assignment.id)).to be false
          expect(response).to have_http_status(:ok)
        end
      end

      context "管理者の時" do
        let(:user) { create(:user, :admin) }

        it "forbidden エラーが返る" do
          subject
          res = JSON.parse(response.body)

          expect(res["message"]).to eq("管理者は脱退できません。（管理者権限の移譲が必要です。）")
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
