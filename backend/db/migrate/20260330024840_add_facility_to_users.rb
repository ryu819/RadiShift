class AddFacilityToUsers < ActiveRecord::Migration[8.1]
  def change
    add_reference :users, :facility, null: false, foreign_key: true
  end
end
