# frozen_string_literal: true

ActiveRecord::Base.transaction do
  DemoDataBuilder.call
end
