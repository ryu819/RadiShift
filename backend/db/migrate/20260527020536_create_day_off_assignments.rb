# frozen_string_literal: true

class CreateDayOffAssignments < ActiveRecord::Migration[8.1]
  def change
    create_table :day_off_assignments do |t|
      t.references :schedule_day, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :day_off_type, null: false, foreign_key: true

      t.timestamps
    end

    add_index :day_off_assignments, [:user_id, :schedule_day_id]
    add_index :day_off_assignments, [:schedule_day_id, :day_off_type_id, :user_id], unique: true
  end
end