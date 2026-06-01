# frozen_string_literal: true

class ChangeDayOffTypesNameIndex < ActiveRecord::Migration[8.1]
  def change
    remove_index :day_off_types, name: "index_day_off_types_on_facility_id_and_name"

    add_index :day_off_types,
              [:facility_id, :name],
              name: "index_day_off_types_on_facility_id_and_name"
  end
end