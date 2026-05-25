# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_25_110429) do
  create_table "active_storage_attachments", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "day_off_requests", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "day_off_type_id", null: false
    t.bigint "facility_id", null: false
    t.boolean "is_return", default: false, null: false
    t.integer "request_status", limit: 1, default: 0, null: false
    t.bigint "schedule_day_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["day_off_type_id"], name: "index_day_off_requests_on_day_off_type_id"
    t.index ["facility_id", "request_status", "created_at"], name: "idx_on_facility_id_request_status_created_at_00041c869e"
    t.index ["facility_id"], name: "index_day_off_requests_on_facility_id"
    t.index ["schedule_day_id"], name: "index_day_off_requests_on_schedule_day_id"
    t.index ["user_id", "created_at"], name: "index_day_off_requests_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_day_off_requests_on_user_id"
  end

  create_table "day_off_slot_rules", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "day_off_type_id", null: false
    t.bigint "facility_id", null: false
    t.integer "max_slots", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "weekday", limit: 1, null: false
    t.index ["day_off_type_id"], name: "index_day_off_slot_rules_on_day_off_type_id"
    t.index ["facility_id", "day_off_type_id", "weekday"], name: "idx_on_facility_id_day_off_type_id_weekday_02d9efe75c", unique: true
    t.index ["facility_id"], name: "index_day_off_slot_rules_on_facility_id"
  end

  create_table "day_off_slots", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "day_off_type_id", null: false
    t.integer "max_slots", default: 0, null: false
    t.bigint "schedule_day_id", null: false
    t.datetime "updated_at", null: false
    t.index ["day_off_type_id"], name: "index_day_off_slots_on_day_off_type_id"
    t.index ["schedule_day_id", "day_off_type_id"], name: "index_day_off_slots_on_schedule_day_id_and_day_off_type_id", unique: true
    t.index ["schedule_day_id"], name: "index_day_off_slots_on_schedule_day_id"
  end

  create_table "day_off_types", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "color_code"
    t.datetime "created_at", null: false
    t.decimal "day_off_unit", precision: 2, scale: 1, null: false
    t.bigint "facility_id", null: false
    t.boolean "is_active", default: true, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["facility_id", "name"], name: "index_day_off_types_on_facility_id_and_name", unique: true
    t.index ["facility_id"], name: "index_day_off_types_on_facility_id"
  end

  create_table "facilities", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "invite_code"
    t.datetime "invite_expires_at"
    t.string "name", null: false
    t.integer "request_deadline", default: 7, null: false
    t.text "rules_text"
    t.datetime "updated_at", null: false
    t.index ["invite_code"], name: "index_facilities_on_invite_code", unique: true
    t.index ["name"], name: "index_facilities_on_name", unique: true
  end

  create_table "jwt_denylists", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "exp", null: false
    t.string "jti", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti", unique: true
  end

  create_table "modality_types", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "color_code"
    t.datetime "created_at", null: false
    t.bigint "facility_id", null: false
    t.boolean "is_active", default: true, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["facility_id", "name"], name: "index_modality_types_on_facility_id_and_name", unique: true
    t.index ["facility_id"], name: "index_modality_types_on_facility_id"
  end

  create_table "schedule_days", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.boolean "is_holiday", default: false, null: false
    t.bigint "schedule_month_id", null: false
    t.datetime "updated_at", null: false
    t.index ["schedule_month_id", "date"], name: "index_schedule_days_on_schedule_month_id_and_date", unique: true
    t.index ["schedule_month_id"], name: "index_schedule_days_on_schedule_month_id"
  end

  create_table "schedule_months", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "facility_id", null: false
    t.integer "month", limit: 1, null: false
    t.decimal "monthly_days_off", precision: 3, scale: 1, null: false
    t.datetime "updated_at", null: false
    t.integer "year", null: false
    t.index ["facility_id", "year", "month"], name: "index_schedule_months_on_facility_id_and_year_and_month", unique: true
    t.index ["facility_id"], name: "index_schedule_months_on_facility_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.bigint "facility_id"
    t.boolean "is_admin", default: false, null: false
    t.string "name", null: false
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.text "rules_text"
    t.string "unconfirmed_email"
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["facility_id"], name: "index_users_on_facility_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "work_requests", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "facility_id", null: false
    t.boolean "is_return", default: false, null: false
    t.integer "request_status", limit: 1, default: 0, null: false
    t.bigint "schedule_day_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.bigint "work_type_id", null: false
    t.index ["facility_id", "request_status", "created_at"], name: "idx_on_facility_id_request_status_created_at_0f093d73c4"
    t.index ["facility_id"], name: "index_work_requests_on_facility_id"
    t.index ["schedule_day_id"], name: "index_work_requests_on_schedule_day_id"
    t.index ["user_id", "created_at"], name: "index_work_requests_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_work_requests_on_user_id"
    t.index ["work_type_id"], name: "index_work_requests_on_work_type_id"
  end

  create_table "work_types", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "color_code"
    t.datetime "created_at", null: false
    t.bigint "facility_id", null: false
    t.boolean "is_active", default: true, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["facility_id", "name"], name: "index_work_types_on_facility_id_and_name", unique: true
    t.index ["facility_id"], name: "index_work_types_on_facility_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "day_off_requests", "day_off_types"
  add_foreign_key "day_off_requests", "facilities"
  add_foreign_key "day_off_requests", "schedule_days"
  add_foreign_key "day_off_requests", "users"
  add_foreign_key "day_off_slot_rules", "day_off_types"
  add_foreign_key "day_off_slot_rules", "facilities"
  add_foreign_key "day_off_slots", "day_off_types"
  add_foreign_key "day_off_slots", "schedule_days"
  add_foreign_key "day_off_types", "facilities"
  add_foreign_key "modality_types", "facilities"
  add_foreign_key "schedule_days", "schedule_months"
  add_foreign_key "schedule_months", "facilities"
  add_foreign_key "users", "facilities"
  add_foreign_key "work_requests", "facilities"
  add_foreign_key "work_requests", "schedule_days"
  add_foreign_key "work_requests", "users"
  add_foreign_key "work_requests", "work_types"
  add_foreign_key "work_types", "facilities"
end
