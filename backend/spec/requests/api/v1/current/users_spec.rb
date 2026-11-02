# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Current::Users", type: :request do
  let!(:user) { create(:user) }
  let!(:token) { login_and_get_token(user) }

  describe "GET /api/v1/current/user" do
    subject { get(api_v1_current_user_path, headers: { "Authorization": token }) }

    context "JWTが正常に送られた時" do
      it "正常にレコードを取得できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["id"]).to eq(user.id)
        expect(response).to have_http_status(:ok)
      end
    end

    context "JWTが空のままリクエストが送信された時" do
      let(:token) { nil }

      it "unauthorized エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["error"]).to eq("ログインもしくはアカウント登録してください。")
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "削除済みユーザーの時" do
      before { user.update!(is_deleted: true) }

      it "unauthorized エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("削除済みのアカウントです。")
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "ユーザーアイコンが登録されている時" do
      let(:user) { create(:user, :with_avatar) }

      it "画像本体のURLを返す" do
        subject

        res = JSON.parse(response.body)

        expect(res["avatar_image_url"]).to include(
          "/rails/active_storage/blobs/redirect/"
        )
        expect(response).to have_http_status(:ok)
      end
    end

    context "Googleアカウントが連携されている時" do
      let(:user) { create(:user, google_sub: "123456789", google_email: "google@gmail.com") }

      it "Google連携情報を返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["google_email"]).to eq("google@gmail.com")
        expect(res["password_set"]).to be true
      end
    end

    context "デモ環境が期限切れになった時" do
      let(:demo_environment) { create(:demo_environment, created_at: 23.hours.ago) }
      let(:facility) { create(:facility, demo_environment: demo_environment) }
      let(:user) { create(:user, facility: facility, demo_environment: demo_environment) }

      it "期限内に発行されたJWTでも24時間経過後は認証できない" do
        token = login_and_get_token(user)
        demo_environment.update!(created_at: 25.hours.ago)
        get(api_v1_current_user_path, headers: { "Authorization": token })
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PUT /api/v1/current/user" do
    subject { put(api_v1_current_user_path, params: params, headers: { "Authorization": token }) }

    context "nameを変更する時" do
      let(:params) { { user: { name: "テスト変更" } } }
      it "正常にレコードを更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(user.reload.name).to eq("テスト変更")
        expect(res["message"]).to eq("アカウントを更新しました。")
        expect(response).to have_http_status(:ok)
      end
    end

    context "emailを変更する時" do
      let(:params) { { user: { email: "new@example.com" } } }
      it "unconfirmed_emailに入る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("確認メールを送信しました。メールをご確認ください。")
        expect(response).to have_http_status(:ok)
        expect(user.reload.unconfirmed_email).to eq("new@example.com")
      end
    end

    context "登録済みのemailを送った時" do
      let(:params) { { user: { email: user.email } } }

      it "unconfirmed_emailは変わらない" do
        subject
        expect(response).to have_http_status(:ok)
        expect(user.reload.unconfirmed_email).to be_nil
      end
    end

    context "バリデーションエラーのとき" do
      let(:params) { { user: { name: "" } } }
      it "更新に失敗する" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("アカウントの更新に失敗しました。")
        expect(response).to have_http_status(:unprocessable_content)
        expect(res["errors"]).to be_present
      end
    end

    context "permitしていない項目を送る時" do
      let(:params) { { user: { is_admin: true } } }
      it "is_admin は更新されない" do
        subject
        expect(response).to have_http_status(:ok)
        expect(user.reload.is_admin).to be(false)
      end
    end
  end

  describe "DELETE /api/v1/current/user" do
    subject { delete(api_v1_current_user_path, headers: { "Authorization": token }) }

    context "施設に所属している自分のアカウントを削除する時" do
      let(:user) { create(:user, :with_facility, :with_avatar, rules_text: "個別ルール", google_sub: "123456789", google_email: "google@gmail.com") }
      let(:facility) { user.facility }
      let(:future_date) { Date.current.next_month.beginning_of_month }
      let(:future_schedule_month) { create(:schedule_month, facility: user.facility, date: future_date) }
      let(:future_schedule_day) { create(:schedule_day, schedule_month: future_schedule_month, date: future_date) }
      let!(:future_work_assignment) { create(:work_assignment, user: user, schedule_day: future_schedule_day) }
      let(:past_date) { Date.current.prev_month.beginning_of_month }
      let(:past_schedule_day) do
        create(:schedule_day, schedule_month: create(:schedule_month, facility: facility, date: past_date), date: past_date)
      end
      let!(:past_work_assignment) { create(:work_assignment, facility: facility, user: user, schedule_day: past_schedule_day) }
      let!(:approved_work_request) do
        create(:work_request, facility: facility, user: user, schedule_day: past_schedule_day, request_status: :approved)
      end

      it "ユーザーを物理削除せず削除済み状態にする" do
        original_name = user.name
        original_encrypted_password = user.encrypted_password

        expect { subject }.not_to change { User.count }
        user.reload
        expect(user.name).to eq(original_name)
        expect(user.email).to eq("deleted_user_#{user.id}@example.invalid")
        expect(user.encrypted_password).not_to eq(original_encrypted_password)
        expect(user.is_deleted).to be true
      end

      it "施設情報とavatarを削除する" do
        subject
        user.reload
        expect(user.facility).to be_nil
        expect(user.rules_text).to be_nil
        expect(user.display_order).to be_nil
        expect(user.avatar_image).not_to be_attached
        expect(response).to have_http_status(:ok)
      end

      it "未来のAssignmentを削除してからアカウントを削除する" do
        subject
        expect(WorkAssignment.exists?(future_work_assignment.id)).to be false
      end

      it "過去のAssignmentと承認済みの申請は残す" do
        subject
        expect(WorkAssignment.exists?(past_work_assignment.id)).to be true
        expect(WorkRequest.exists?(approved_work_request.id)).to be true
      end

      it "Google連携情報を削除する" do
        subject
        user.reload
        expect(user.google_sub).to be_nil
        expect(user.google_email).to be_nil
      end

      it "削除前に発行されたJWTでは認証できない" do
        subject
        get(api_v1_current_user_path, headers: { "Authorization": token })
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("削除済みのアカウントです。")
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "施設に所属していない自分のアカウントを削除する時" do
      it "削除済み状態にする" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("アカウントを削除しました。")
        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.is_deleted).to be(true)
        expect(user.facility).to be_nil
      end
    end

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "削除できない" do
        expect { subject }.not_to change { User.count }
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者は削除できません。（管理者権限の移譲が必要です。）")
        expect(user.reload.is_deleted).to be false
        expect(response).to have_http_status(:forbidden)
      end

      it "削除に失敗してもJWTは引き続き使用できる" do
        subject
        expect(response).to have_http_status(:forbidden)
        get(api_v1_current_user_path, headers: { "Authorization": token })
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
