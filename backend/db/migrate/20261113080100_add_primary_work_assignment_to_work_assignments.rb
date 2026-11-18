# frozen_string_literal: true

class AddPrimaryWorkAssignmentToWorkAssignments < ActiveRecord::Migration[8.0]
  def change
    add_reference :work_assignments, :primary_work_assignment, index: { unique: true },
                  foreign_key: { to_table: :work_assignments, on_delete: :nullify }
  end
end
