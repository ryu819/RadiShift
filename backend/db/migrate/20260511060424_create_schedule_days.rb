class CreateScheduleDays < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_days do |t|
      t.references :schedule_month, null: false, foreign_key: true
      t.date :date, null: false

      t.timestamps
    end

    add_index :schedule_days, [:schedule_month_id, :date], unique: true
  end
end