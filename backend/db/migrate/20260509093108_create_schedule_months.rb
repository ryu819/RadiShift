class CreateScheduleMonths < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_months do |t|
      t.references :facility, null: false, foreign_key: true
      t.integer :year, null: false
      t.integer :month, null: false, limit: 1
      t.decimal :monthly_days_off, precision: 3, scale: 1, null: false

      t.timestamps
    end

    add_index :schedule_months, [:facility_id, :year, :month], unique: true
  end
end
