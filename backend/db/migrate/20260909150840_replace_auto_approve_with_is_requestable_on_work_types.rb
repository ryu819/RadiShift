class ReplaceAutoApproveWithIsRequestableOnWorkTypes < ActiveRecord::Migration[8.1]
  def change
    add_column :work_types,
               :is_requestable,
               :boolean,
               default: false,
               null: false

    remove_column :work_types,
                  :auto_approve,
                  :boolean,
                  default: false,
                  null: false
  end
end