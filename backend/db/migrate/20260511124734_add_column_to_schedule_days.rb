class AddColumnToScheduleDays < ActiveRecord::Migration[8.1]
  def change
    add_column :schedule_days, :is_holiday, :boolean, null: false, default: false
  end
end
