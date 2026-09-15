class ChangeStatusToIsPublishedInScheduleMonths < ActiveRecord::Migration[8.1]
  def change
    rename_column :schedule_months, :status, :is_published

    change_column :schedule_months,
                :is_published,
                :boolean,
                default: false,
                null: false
  end
end
