class AddPendingUniqueConstraintToDayOffRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :day_off_requests,
               :is_pending_unique,
               :virtual,
               type: :boolean,
               as: "CASE WHEN request_status = 0 THEN TRUE ELSE NULL END",
               stored: false

    add_index :day_off_requests,
              [
                :user_id,
                :schedule_day_id,
                :day_off_type_id,
                :is_pending_unique
              ],
              unique: true
  end
end