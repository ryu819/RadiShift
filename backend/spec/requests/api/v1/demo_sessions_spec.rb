# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::DemoSessions", type: :request do
  describe "POST /api/v1/demo_session" do
    before do
      Api::V1::DemoSessionsController::RATE_LIMIT_STORE.clear

      allow(DemoDataBuilder).to receive(:call) do |demo_environment:|
        facility = create(
          :facility,
          demo_environment: demo_environment
        )

        admin_user = create(
          :user,
          :admin,
          facility: facility,
          demo_environment: demo_environment
        )

        {
          facility: facility,
          admin_user: admin_user
        }
      end
    end

    after do
      Api::V1::DemoSessionsController::RATE_LIMIT_STORE.clear
    end

    it "デモ環境を作成してログインできる" do
      expect { post api_v1_demo_session_path }.to change { DemoEnvironment.count }.by(1)
      body = JSON.parse(response.body)
      expect(response).to have_http_status(:created)
      expect(response.headers["Authorization"]).to be_present
      expect(body["message"]).to eq("デモを開始しました。")
    end

    it "デモ開始ごとに新しいデモ環境を作る" do
      expect do
        2.times do
          post api_v1_demo_session_path
        end
      end.to change { DemoEnvironment.count }.by(2)
    end

    context "デモデータ作成に失敗した時" do
      before do
        allow(DemoDataBuilder).to receive(:call)
                                    .and_raise(ActiveRecord::RecordInvalid)
      end

      it "デモ環境を残さない" do
        expect { post api_v1_demo_session_path }.not_to change { DemoEnvironment.count }
      end
    end

    context "IPが変わっても上限を超えた時" do
      it "31回目を拒否してデモを作らない" do
        30.times do
          post api_v1_demo_session_path,
               env: { "REMOTE_ADDR" => "203.0.113.1" }
        end

        expect(response).to have_http_status(:created)

        expect do
          post api_v1_demo_session_path,
               env: { "REMOTE_ADDR" => "203.0.113.2" }
        end.not_to change { DemoEnvironment.count }

        expect(response).to have_http_status(:too_many_requests)
      end
    end
  end
end
