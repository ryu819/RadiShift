class AddStatusToScheduleMonths < ActiveRecord::Migration[8.1]
  def change
    add_column :schedule_months, :status, :integer, null: false, default: 0, limit: 1
  end
end