# frozen_string_literal: true

class AddNextDayWorkTypeToWorkTypes < ActiveRecord::Migration[8.0]
  def change
    add_reference :work_types, :next_day_work_type, foreign_key: { to_table: :work_types, on_delete: :nullify }
  end
end
