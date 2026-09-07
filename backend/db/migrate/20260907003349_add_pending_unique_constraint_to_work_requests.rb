class AddPendingUniqueConstraintToWorkRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :work_requests,
               :is_pending_unique,
               :virtual,
               type: :boolean,
               as: "CASE WHEN request_status = 0 THEN TRUE ELSE NULL END",
               stored: false

    add_index :work_requests,
              [
                :user_id,
                :schedule_day_id,
                :work_type_id,
                :is_pending_unique
              ],
              unique: true
  end
end