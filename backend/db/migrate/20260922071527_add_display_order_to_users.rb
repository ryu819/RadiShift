class AddDisplayOrderToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :display_order, :integer

    add_index :users, [:facility_id, :display_order]
  end
end
