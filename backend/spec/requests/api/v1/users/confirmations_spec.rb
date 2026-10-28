# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Users::Confirmations", type: :request do
  describe "POST /api/v1/confirmation" do
    subject { post(user_confirmation_path, params: { user: { email: email } }) }

    let(:email) { user.email }
    let(:message) { "認証メールを送信しました。届かない場合は、1分以上あけてから再度お試しください。" }

    context "未認証で、前回の送信から1分以上たっている時" do
      let!(:user) { create(:user, confirmed_at: nil) }

      before { user.update!(confirmation_sent_at: 2.minutes.ago) }

      it "共通メッセージを返し、認証メールを1通送る" do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq(message)
      end

      it "再送すると、前のメールのリンクでは認証できなくなる" do
        old_token = user.confirmation_token
        subject
        get user_confirmation_path, params: { confirmation_token: old_token }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "同時に再送されても、先に送った方の送信日時を見て2通目は送らない" do
        same_user_in_another_request = User.find(user.id)
        user.update!(confirmation_sent_at: Time.current)
        expect { same_user_in_another_request.resend_confirmation_instructions }
          .not_to(change { ActionMailer::Base.deliveries.count })
      end
    end

    context "前回の送信から1分たっていない時" do
      let!(:user) { create(:user, confirmed_at: nil) }

      before { user.update!(confirmation_sent_at: 30.seconds.ago) }

      it "共通メッセージを返し、メールを送らない" do
        expect { subject }.not_to(change { ActionMailer::Base.deliveries.count })
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq(message)
      end
    end

    context "認証済みの時" do
      let!(:user) { create(:user) }

      it "共通メッセージを返し、メールを送らない" do
        expect { subject }.not_to(change { ActionMailer::Base.deliveries.count })
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq(message)
      end
    end

    context "未登録の時" do
      let(:email) { "not_registered@example.com" }

      it "共通メッセージを返し、メールを送らない" do
        expect { subject }.not_to(change { ActionMailer::Base.deliveries.count })
        res = JSON.parse(response.body)
        expect(response).to have_http_status(:ok)
        expect(res["message"]).to eq(message)
      end
    end
  end
end
