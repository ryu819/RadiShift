# frozen_string_literal: true

class CreateModalityAssignments < ActiveRecord::Migration[8.1]
  def change
    create_table :modality_assignments do |t|
      t.references :schedule_day, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :modality_type, null: false, foreign_key: true

      t.timestamps
    end

    add_index :modality_assignments, [:user_id, :schedule_day_id]
    add_index :modality_assignments, [:schedule_day_id, :modality_type_id, :user_id], unique: true
  end
end