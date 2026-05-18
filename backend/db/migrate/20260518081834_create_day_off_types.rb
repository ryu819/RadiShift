class CreateDayOffTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :day_off_types do |t|
      t.references :facility, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :day_off_unit, precision: 2, scale: 1, null: false
      t.boolean :is_active, null: false, default: true
      t.string :color_code    

      t.timestamps
    end

    add_index :day_off_types, [:facility_id, :name], unique: true
  end
end
