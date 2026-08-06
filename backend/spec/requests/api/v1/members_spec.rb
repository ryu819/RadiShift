# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Members", type: :request do
  let(:user) { create(:user, :admin) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/members" do
    subject { get(api_v1_members_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:member) { create(:user, facility: user.facility) }
      let!(:other_facility_member) { create(:user) }
      let!(:deleted_member) { create(:user, facility: user.facility, is_deleted: true) }

      it "同じ施設に所属する削除済みではないユーザー一覧を取得できる" do
        subject
        res = JSON.parse(response.body)
        user_ids = res.map { |member| member["id"] }
        expect(user_ids).to eq([user.id, member.id])
        expect(user_ids).not_to include(other_facility_member.id)
        expect(user_ids).not_to include(deleted_member.id)
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

  describe "PATCH /api/v1/members/:id" do
    subject { patch(api_v1_member_path(member), params: params, headers: { "Authorization": token }) }

    let(:params) { { user: { rules_text: "変更後の個別ルール" } } }

    context "管理者である時" do
      let!(:member) { create(:user, facility: user.facility, rules_text: "変更前の個別ルール") }

      it "正常にユーザー情報を更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("ユーザー情報を更新しました。")
        expect(member.reload.rules_text).to eq("変更後の個別ルール")
        expect(response).to have_http_status(:ok)
      end

      context "permitしていない項目を送る時" do
        let(:params) { { user: { rules_text: "変更後の個別ルール", is_admin: true, facility_id: nil } } }

        it "rules_text 以外は更新されない" do
          original_facility = member.facility
          subject
          member.reload
          expect(member.rules_text).to eq("変更後の個別ルール")
          expect(member.is_admin).to be false
          expect(member.facility).to eq(original_facility)
          expect(response).to have_http_status(:ok)
        end
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }
      let!(:member) { create(:user, facility: user.facility, rules_text: "変更前の個別ルール") }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:member) { create(:user, rules_text: "変更前の個別ルール") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のユーザーを指定した時" do
      let!(:member) { create(:user, rules_text: "変更前の個別ルール") }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/members/:id" do
    subject { delete(api_v1_member_path(member), headers: { "Authorization": token }) }

    context "管理者である時" do
      context "対象ユーザーが管理者でない時" do
        let!(:member) { create(:user, facility: user.facility, is_admin: false, rules_text: "個別ルール") }

        it "ユーザーを物理削除せず、施設から脱退させる" do
          expect { subject }.not_to change { User.count }
          res = JSON.parse(response.body)
          member.reload
          expect(res["message"]).to eq("ユーザーを脱退させました。")
          expect(member.facility).to be_nil
          expect(member.rules_text).to be_nil
          expect(response).to have_http_status(:ok)
        end
      end

      context "対象ユーザーが管理者である時" do
        let!(:member) { create(:user, :admin, facility: user.facility, rules_text: "管理者メモ") }

        it "脱退させられない" do
          subject
          res = JSON.parse(response.body)
          member.reload
          expect(res["message"]).to eq("管理者は脱退させられません。先に管理者権限を解除してください。")
          expect(member.facility).to eq(user.facility)
          expect(member.rules_text).to eq("管理者メモ")
          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }
      let!(:member) { create(:user, facility: user.facility, rules_text: "個別ルール") }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:member) { create(:user, rules_text: "個別ルール") }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のユーザーを指定した時" do
      let!(:member) { create(:user, rules_text: "個別ルール") }

      it "not_found エラーが返る" do
        original_facility = member.facility
        subject
        expect(member.reload.facility).to eq(original_facility)
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/v1/members/:id/add_admin" do
    subject { patch(add_admin_api_v1_member_path(member), headers: { "Authorization": token }) }

    context "管理者である時" do
      context "対象ユーザーが管理者でない時" do
        let!(:member) { create(:user, facility: user.facility, is_admin: false) }

        it "正常に管理者権限を付与できる" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("管理者権限を付与しました。")
          expect(member.reload.is_admin).to be true
          expect(response).to have_http_status(:ok)
        end
      end

      context "対象ユーザーがすでに管理者である時" do
        let!(:member) { create(:user, :admin, facility: user.facility) }

        it "管理者権限を付与できない" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("対象ユーザーはすでに管理者です。")
          expect(member.reload.is_admin).to be true
          expect(response).to have_http_status(:unprocessable_content)
        end
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }
      let!(:member) { create(:user, facility: user.facility, is_admin: false) }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:member) { create(:user, is_admin: false) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のユーザーを指定した時" do
      let!(:member) { create(:user, is_admin: false) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/v1/members/:id/remove_admin" do
    subject { patch(remove_admin_api_v1_member_path(member), headers: { "Authorization": token }) }

    context "管理者である時" do
      context "対象ユーザーが他の管理者である時" do
        let!(:member) { create(:user, :admin, facility: user.facility) }

        it "正常に管理者権限を解除できる" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("管理者権限を解除しました。")
          expect(member.reload.is_admin).to be false
          expect(response).to have_http_status(:ok)
        end
      end

      context "対象ユーザーが管理者でない時" do
        let!(:member) { create(:user, facility: user.facility, is_admin: false) }

        it "管理者権限を解除できない" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("対象ユーザーは管理者ではありません。")
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "対象ユーザーが自分自身である時" do
        let(:member) { user }

        it "自分自身の管理者権限は解除できない" do
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("自分自身の管理者権限は解除できません。")
          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    context "管理者でない時" do
      let(:user) { create(:user, :with_facility) }
      let!(:member) { create(:user, :admin, facility: user.facility) }

      it "forbidden エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("管理者権限がありません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let!(:member) { create(:user, :admin) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のユーザーを指定した時" do
      let!(:member) { create(:user, :admin) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
