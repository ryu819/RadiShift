# frozen_string_literal: true

class CreateWorkAssignments < ActiveRecord::Migration[8.1]
  def change
    create_table :work_assignments do |t|
      t.references :schedule_day, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :work_type, null: false, foreign_key: true

      t.timestamps
    end

    add_index :work_assignments, [:user_id, :schedule_day_id]
    add_index :work_assignments, [:schedule_day_id, :work_type_id, :user_id], unique: true
  end
end