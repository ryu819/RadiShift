# frozen_string_literal: true

class CreateDayOffRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :day_off_requests do |t|
      t.references :user, null: false, foreign_key: true
      t.references :facility, null: false, foreign_key: true
      t.references :schedule_day, null: false, foreign_key: true
      t.references :day_off_type, null: false, foreign_key: true
      t.integer :request_status, null: false, default: 0, limit: 1
      t.boolean :is_return, null: false, default: false

      t.timestamps
    end

    add_index :day_off_requests, [:user_id, :created_at]
    add_index :day_off_requests, [:facility_id, :request_status, :created_at]
  end
end