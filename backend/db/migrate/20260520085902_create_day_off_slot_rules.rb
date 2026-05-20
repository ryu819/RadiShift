# frozen_string_literal: true

class CreateDayOffSlotRules < ActiveRecord::Migration[8.1]
  def change
    create_table :day_off_slot_rules do |t|
      t.references :facility, null: false, foreign_key: true
      t.references :day_off_type, null: false, foreign_key: true
      t.integer :weekday, null: false, limit: 1
      t.integer :max_slots, null: false, default: 0

      t.timestamps
    end

    add_index :day_off_slot_rules,
              [:facility_id, :day_off_type_id, :weekday],
              unique: true
  end
end