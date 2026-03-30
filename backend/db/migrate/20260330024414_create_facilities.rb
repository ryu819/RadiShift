class CreateFacilities < ActiveRecord::Migration[8.1]
  def change
    create_table :facilities do |t|
      t.string :name, null: false
      t.integer :request_deadline, null: false, default: 7
      t.text :rules_text
      t.string :invite_code
      t.datetime :invite_expires_at
      t.timestamps
    end

    add_index :facilities, :name, unique: true
    add_index :facilities, :invite_code, unique: true
  end
end
