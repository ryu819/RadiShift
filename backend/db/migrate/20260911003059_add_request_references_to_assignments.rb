# frozen_string_literal: true

class AddRequestReferencesToAssignments < ActiveRecord::Migration[8.1]
  def change
    add_reference :work_assignments,
                  :work_request,
                  null: true

    add_reference :day_off_assignments,
                  :day_off_request,
                  null: true

    add_foreign_key :work_assignments,
                    :work_requests,
                    on_delete: :nullify

    add_foreign_key :day_off_assignments,
                    :day_off_requests,
                    on_delete: :nullify
  end
end