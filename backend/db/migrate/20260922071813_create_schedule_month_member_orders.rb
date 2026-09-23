class CreateScheduleMonthMemberOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_month_member_orders do |t|
      t.references :schedule_month, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :display_order, null: false

      t.timestamps
    end

    add_index :schedule_month_member_orders,
              [:schedule_month_id, :user_id],
              unique: true

    add_index :schedule_month_member_orders,
              [:schedule_month_id, :display_order]
  end
end
