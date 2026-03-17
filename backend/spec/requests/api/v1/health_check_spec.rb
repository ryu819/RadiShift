# frozen_string_literal: true

RSpec.describe "Api::V1::HealthCheck", type: :request do
  describe "GET api/v1/health_check" do
    it "正常にレスポンスが返る" do
      get api_v1_health_check_path
      res = JSON.parse(response.body)
      expect(response).to have_http_status(:success)
      expect(res["message"]).to eq "Success Health Check!"
    end
  end
end
