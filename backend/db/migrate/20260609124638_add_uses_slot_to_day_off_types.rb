class AddUsesSlotToDayOffTypes < ActiveRecord::Migration[8.1]
  def change
    add_column :day_off_types, :uses_slot, :boolean, null: false, default: true
  end
end
