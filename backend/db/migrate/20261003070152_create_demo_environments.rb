# frozen_string_literal: true

class CreateDemoEnvironments < ActiveRecord::Migration[8.1]
  def change
    create_table :demo_environments do |t|
      t.timestamps
    end

    add_reference :users,
                  :demo_environment,
                  foreign_key: true

    add_reference :facilities,
                  :demo_environment,
                  foreign_key: true
  end
end