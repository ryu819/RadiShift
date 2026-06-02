# frozen_string_literal: true

class ChangeModalityTypesNameIndex < ActiveRecord::Migration[8.1]
  def change
    remove_index :modality_types, name: "index_modality_types_on_facility_id_and_name"

    add_index :modality_types,
              [:facility_id, :name],
              name: "index_modality_types_on_facility_id_and_name"
  end
end