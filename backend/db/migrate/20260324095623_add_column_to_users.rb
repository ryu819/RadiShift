class AddColumnToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :name, :string, null: false
    add_column :users, :is_admin, :boolean, default: false, null: false
    add_column :users, :rules_text, :text
  end
end
