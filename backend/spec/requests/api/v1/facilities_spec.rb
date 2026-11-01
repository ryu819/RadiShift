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

      it "施設を作成したユーザーのdisplay_orderが1になる" do
        subject
        expect(user.reload.display_order).to eq(1)
      end

      context "所属確認後に別の施設へ参加した時" do
        let!(:joined_facility) { create(:facility) }

        before do
          new_facility = Facility.new(params[:facility])

          allow(Facility).to receive(:new) do
            user.update!(
              facility: joined_facility,
              is_admin: false,
              display_order: 1
            )

            new_facility
          end
        end

        it "施設を作成せず、参加先の所属と権限を維持する" do
          expect do
            subject
          end.not_to change { Facility.count }

          res = JSON.parse(response.body)
          expect(response).to have_http_status(:conflict)
          expect(res["message"]).to eq("すでに施設に所属しています。")
          expect(user.reload.facility).to eq(joined_facility)
          expect(user.is_admin).to be(false)
          expect(user.display_order).to eq(1)
        end
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

    context "デモユーザーの時" do
      let(:demo_environment) { create(:demo_environment) }
      let(:user) { create(:user, demo_environment: demo_environment) }

      it "同じデモ環境の施設を作成する" do
        subject
        facility = user.reload.facility
        expect(facility.demo_environment).to eq(demo_environment)
        expect(response).to have_http_status(:created)
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

    context "デモ施設の管理者の時" do
      let(:demo_environment) { create(:demo_environment) }

      let(:facility) { create(:facility, demo_environment: demo_environment) }

      let(:admin_user) { create(:user, facility: facility, demo_environment: demo_environment, is_admin: true, display_order: 1) }

      let(:token) { login_and_get_token(admin_user) }

      it "施設を削除してもデモ環境との紐付けは残す" do
        subject
        admin_user.reload
        expect(admin_user.facility).to be_nil
        expect(admin_user.demo_environment).to eq(demo_environment)
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

      context "所属確認後に別の施設を作成した時" do
        let!(:created_facility) { create(:facility) }
        let!(:existing_member) { create(:user, facility: facility, display_order: 1) }
        let!(:schedule_month) { create(:schedule_month, facility: facility, date: Date.current.next_month.beginning_of_month) }

        before do
          create(
            :schedule_month_member_order,
            schedule_month: schedule_month,
            user: existing_member,
            display_order: 1
          )

          allow(Facility).to receive(:find_by)
                               .with(invite_code: facility.invite_code) do
            user.update!(
              facility: created_facility,
              is_admin: true,
              display_order: 1
            )

            facility
          end
        end

        it "参加と並び順の追加を行わず、作成施設の管理者を維持する" do
          expect do
            subject
          end.not_to change { schedule_month.schedule_month_member_orders.count }

          res = JSON.parse(response.body)
          expect(response).to have_http_status(:conflict)
          expect(res["message"]).to eq("すでに施設に所属しています。")
          expect(user.reload.facility).to eq(created_facility)
          expect(user.is_admin).to be(true)
          expect(user.display_order).to eq(1)
        end
      end

      context "施設未所属で管理者権限が残っている時" do
        let(:user) { create(:user, is_admin: true) }

        it "一般メンバーとして参加する" do
          subject
          expect(response).to have_http_status(:ok)
          expect(user.reload.facility).to eq(facility)
          expect(user.is_admin).to be(false)
        end
      end

      it "新規参加者を現在の末尾へ追加する" do
        create(:user, facility: facility, display_order: 1)
        create(:user, facility: facility, display_order: 2)

        subject

        expect(user.reload.display_order).to eq(3)
      end

      it "当月以降の固定済み月へ参加者を末尾追加する" do
        existing_member = create(:user, facility: facility, display_order: 1)
        future_month = create(:schedule_month, facility: facility, date: Date.current.next_month.beginning_of_month)
        past_month = create(:schedule_month, facility: facility, date: Date.current.prev_month.beginning_of_month)

        [past_month, future_month].each do |schedule_month|
          create(:schedule_month_member_order, schedule_month: schedule_month, user: existing_member, display_order: 1)
        end

        subject
        expect(future_month.schedule_month_member_orders.find_by(user: user).display_order).to eq(2)
        expect(past_month.schedule_month_member_orders.find_by(user: user)).to be_nil
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

    context "同じデモ環境の施設に参加する時" do
      let(:demo_environment) { create(:demo_environment) }
      let(:user) { create(:user, demo_environment: demo_environment) }
      let(:facility) { create(:facility, demo_environment: demo_environment) }

      it "参加できる" do
        subject
        expect(user.reload.facility).to eq(facility)
        expect(response).to have_http_status(:ok)
      end
    end

    context "別のデモ環境の施設に参加する時" do
      let(:user_demo_environment) { create(:demo_environment) }

      let(:facility_demo_environment) { create(:demo_environment) }

      let(:user) { create(:user, demo_environment: user_demo_environment) }

      let(:facility) { create(:facility, demo_environment: facility_demo_environment) }

      it "参加できない" do
        subject
        res = JSON.parse(response.body)
        expect(user.reload.facility).to be_nil
        expect(res["message"]).to eq("この施設には参加できません。")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "デモユーザーが通常施設に参加する時" do
      let(:demo_environment) { create(:demo_environment) }
      let(:user) { create(:user, demo_environment: demo_environment) }
      let(:facility) { create(:facility) }

      it "参加できない" do
        subject
        expect(user.reload.facility).to be_nil
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "通常ユーザーがデモ施設に参加する時" do
      let(:user) { create(:user) }
      let(:facility) { create(:facility, demo_environment: create(:demo_environment)) }

      it "参加できない" do
        subject
        expect(user.reload.facility).to be_nil
        expect(response).to have_http_status(:forbidden)
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

        it "脱退時にdisplay_orderを解除する" do
          subject
          expect(user.reload.display_order).to be_nil
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
