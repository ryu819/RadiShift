# frozen_string_literal: true

class CreateDayOffSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :day_off_slots do |t|
      t.references :schedule_day, null: false, foreign_key: true
      t.references :day_off_type, null: false, foreign_key: true
      t.integer :max_slots, null: false, default: 0

      t.timestamps
    end

    add_index :day_off_slots, [:schedule_day_id, :day_off_type_id], unique: true
  end
end