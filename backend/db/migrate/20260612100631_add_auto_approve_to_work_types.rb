# frozen_string_literal: true

class AddAutoApproveToWorkTypes < ActiveRecord::Migration[8.1]
  def change
    add_column :work_types, :auto_approve, :boolean, null: false, default: false
  end
end