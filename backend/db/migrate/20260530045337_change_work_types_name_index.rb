# frozen_string_literal: true

class ChangeWorkTypesNameIndex < ActiveRecord::Migration[8.1]
  def change
    remove_index :work_types, name: "index_work_types_on_facility_id_and_name"

    add_index :work_types,
              [:facility_id, :name],
              name: "index_work_types_on_facility_id_and_name"
  end
end