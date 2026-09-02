# frozen_string_literal: true

class AddNotNullConstraintToShiftTypeColorCodes < ActiveRecord::Migration[8.1]
  def change
    change_column_null :work_types, :color_code, false
    change_column_null :day_off_types, :color_code, false
    change_column_null :modality_types, :color_code, false
  end
end