# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::ModalityAssignments", type: :request do
  let(:user) { create(:user, :with_facility) }
  let(:token) { login_and_get_token(user) }

  describe "GET /api/v1/modality_assignments" do
    subject { get(api_v1_modality_assignments_path, headers: { "Authorization": token }) }

    context "施設に所属している時" do
      let!(:modality_assignment) { create(:modality_assignment, facility: user.facility) }
      let!(:other_facility_modality_assignment) { create(:modality_assignment, facility: create(:facility)) }

      it "ログインユーザーの施設のモダリティ割当だけを返す" do
        subject
        res = JSON.parse(response.body)
        modality_assignment_ids = res["modality_assignments"].map { |modality_assignment| modality_assignment["id"] }
        expect(modality_assignment_ids).to include(modality_assignment.id)
        expect(modality_assignment_ids).not_to include(other_facility_modality_assignment.id)
        expect(res["modality_assignments"].first["schedule_day"]).to be_present
        expect(res["modality_assignments"].first["user"]).to be_present
        expect(res["modality_assignments"].first["modality_type"]).to be_present
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

  describe "POST /api/v1/modality_assignments" do
    subject { post(api_v1_modality_assignments_path, params: params, headers: { "Authorization": token }) }

    let(:schedule_month) { create(:schedule_month, facility: user.facility, year: 2026, month: 1) }
    let(:schedule_day) { create(:schedule_day, schedule_month: schedule_month) }
    let(:assigned_user) { create(:user, facility: user.facility) }
    let(:modality_type) { create(:modality_type, facility: user.facility, name: "CT") }
    let(:params) { { modality_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, modality_type_id: modality_type.id } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "モダリティ割当を作成できる" do
        expect { subject }.to change { ModalityAssignment.count }.by(1)
        res = JSON.parse(response.body)
        modality_assignment = ModalityAssignment.find_by(schedule_day: schedule_day, user: assigned_user, modality_type: modality_type)
        expect(res["message"]).to eq("モダリティ割当を作成しました。")
        expect(modality_assignment.schedule_day).to eq(schedule_day)
        expect(modality_assignment.user).to eq(assigned_user)
        expect(modality_assignment.modality_type).to eq(modality_type)
        expect(response).to have_http_status(:created)
      end

      context "schedule_day_id がない時" do
        let(:params) { { modality_assignment: { schedule_day_id: nil, user_id: assigned_user.id, modality_type_id: modality_type.id } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { ModalityAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティ割当の作成に失敗しました。")
          expect(res["errors"]["schedule_day"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "user_id がない時" do
        let(:params) { { modality_assignment: { schedule_day_id: schedule_day.id, user_id: nil, modality_type_id: modality_type.id } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { ModalityAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティ割当の作成に失敗しました。")
          expect(res["errors"]["user"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "modality_type_id がない時" do
        let(:params) { { modality_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, modality_type_id: nil } } }

        it "作成に失敗する" do
          expect { subject }.not_to change { ModalityAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティ割当の作成に失敗しました。")
          expect(res["errors"]["modality_type"]).to be_present
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の schedule_day_id を送る時" do
        let(:other_facility) { create(:facility) }
        let(:other_schedule_month) { create(:schedule_month, facility: other_facility, year: 2026, month: 1) }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: other_schedule_month) }
        let(:params) { { modality_assignment: { schedule_day_id: other_schedule_day.id, user_id: assigned_user.id, modality_type_id: modality_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { ModalityAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("対象日が存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の user_id を送る時" do
        let(:other_user) { create(:user, facility: create(:facility)) }
        let(:params) { { modality_assignment: { schedule_day_id: schedule_day.id, user_id: other_user.id, modality_type_id: modality_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { ModalityAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("ユーザーが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
      end

      context "別施設の modality_type_id を送る時" do
        let(:other_modality_type) { create(:modality_type, facility: create(:facility), name: "CT") }
        let(:params) { { modality_assignment: { schedule_day_id: schedule_day.id, user_id: assigned_user.id, modality_type_id: other_modality_type.id } } }

        it "not_found エラーが返る" do
          expect { subject }.not_to change { ModalityAssignment.count }
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティパターンが存在しません。")
          expect(response).to have_http_status(:not_found)
        end
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

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:params) { { modality_assignment: { schedule_day_id: 1, user_id: 1, modality_type_id: 1 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PUT /api/v1/modality_assignments/:id" do
    subject { put(api_v1_modality_assignment_path(modality_assignment), params: params, headers: { "Authorization": token }) }

    let(:modality_assignment) { create(:modality_assignment, facility: user.facility) }
    let(:modality_type) { create(:modality_type, facility: user.facility, name: "MRI") }
    let(:params) { { modality_assignment: { modality_type_id: modality_type.id } } }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "モダリティ割当を更新できる" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("モダリティ割当を更新しました。")
        expect(modality_assignment.reload.modality_type).to eq(modality_type)
        expect(response).to have_http_status(:ok)
      end

      context "modality_type_id がない時" do
        let(:params) { { modality_assignment: { modality_type_id: nil } } }

        it "更新に失敗する" do
          original_modality_type = modality_assignment.modality_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティ割当の更新に失敗しました。")
          expect(res["errors"]["modality_type"]).to be_present
          expect(modality_assignment.reload.modality_type).to eq(original_modality_type)
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context "別施設の modality_type_id を送る時" do
        let(:other_modality_type) { create(:modality_type, facility: create(:facility), name: "MRI") }
        let(:params) { { modality_assignment: { modality_type_id: other_modality_type.id } } }

        it "not_found エラーが返る" do
          original_modality_type = modality_assignment.modality_type
          subject
          res = JSON.parse(response.body)
          expect(res["message"]).to eq("モダリティパターンが存在しません。")
          expect(modality_assignment.reload.modality_type).to eq(original_modality_type)
          expect(response).to have_http_status(:not_found)
        end
      end

      context "permitしていない項目を送る時" do
        let(:schedule_month) { modality_assignment.schedule_day.schedule_month }
        let(:other_schedule_day) { create(:schedule_day, schedule_month: schedule_month, date: Date.new(2026, 1, 3)) }
        let(:other_user) { create(:user, facility: user.facility) }
        let(:params) { { modality_assignment: { schedule_day_id: other_schedule_day.id, user_id: other_user.id, modality_type_id: modality_type.id } } }

        it "schedule_day_id と user_id は更新されない" do
          original_schedule_day = modality_assignment.schedule_day
          original_user = modality_assignment.user
          subject
          modality_assignment.reload
          expect(modality_assignment.schedule_day).to eq(original_schedule_day)
          expect(modality_assignment.user).to eq(original_user)
          expect(modality_assignment.modality_type).to eq(modality_type)
          expect(response).to have_http_status(:ok)
        end
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

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:modality_assignment) { create(:modality_assignment) }
      let(:params) { { modality_assignment: { modality_type_id: 1 } } }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のモダリティ割当を更新しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:modality_assignment) { create(:modality_assignment, facility: create(:facility)) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/modality_assignments/:id" do
    subject { delete(api_v1_modality_assignment_path(modality_assignment), headers: { "Authorization": token }) }

    let!(:modality_assignment) { create(:modality_assignment, facility: user.facility) }

    context "管理者である時" do
      let(:user) { create(:user, :admin) }

      it "モダリティ割当を削除できる" do
        expect { subject }.to change { ModalityAssignment.count }.by(-1)
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("モダリティ割当を削除しました。")
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

    context "施設に所属していない時" do
      let(:user) { create(:user) }
      let(:modality_assignment) { create(:modality_assignment) }

      it "not_found エラーが返る" do
        subject
        res = JSON.parse(response.body)
        expect(res["message"]).to eq("施設に所属していません。")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "別施設のモダリティ割当を削除しようとした時" do
      let(:user) { create(:user, :admin) }
      let(:modality_assignment) { create(:modality_assignment, facility: create(:facility)) }

      it "not_found エラーが返る" do
        subject
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
