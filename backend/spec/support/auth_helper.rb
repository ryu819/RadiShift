# frozen_string_literal: true

module AuthHelper
  def login_and_get_token(user)
    post user_session_path, params: {
      user: { email: user.email, password: user.password }
    }

    puts response.headers.inspect
    response.headers["Authorization"]
  end
end
