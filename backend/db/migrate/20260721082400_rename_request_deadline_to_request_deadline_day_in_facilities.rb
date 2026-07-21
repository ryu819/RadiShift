# db/migrate/xxxxxxxxxxxxxx_rename_request_deadline_to_request_deadline_day_in_facilities.rb

class RenameRequestDeadlineToRequestDeadlineDayInFacilities < ActiveRecord::Migration[8.1]
  def change
    rename_column :facilities, :request_deadline, :request_deadline_day

    change_column_default :facilities, :request_deadline_day, 15
    change_column_null :facilities, :request_deadline_day, false, 15
  end
end