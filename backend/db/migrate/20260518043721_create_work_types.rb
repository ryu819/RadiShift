class CreateWorkTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :work_types do |t|
      t.references :facility, null: false, foreign_key: true
      t.string :name, null: false
      t.boolean :is_active, null: false, default: true
      t.string :color_code    

      t.timestamps
    end

    add_index :work_types, [:facility_id, :name], unique: true
  end
end
