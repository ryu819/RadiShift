class ChangeFacilityIdNullOnUsers < ActiveRecord::Migration[8.1]
  def change
    change_column_null :users, :facility_id, true
  end
end
