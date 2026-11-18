# frozen_string_literal: true

class WorkType < ApplicationRecord
  belongs_to :facility
  belongs_to :next_day_work_type, class_name: "WorkType", optional: true
  has_many :work_requests, dependent: :destroy
  has_many :work_assignments, dependent: :destroy
  scope :active, -> { where(is_active: true) }
  validates :name, presence: true
  validates :color_code, presence: true
  validate :valid_next_day_work_type, if: :will_save_change_to_next_day_work_type_id?

  def deactivate!
    transaction do
      facility.work_types.where(next_day_work_type_id: id).find_each do |work_type|
        work_type.update!(next_day_work_type_id: nil)
      end
      update!(is_active: false, next_day_work_type_id: nil)
    end
  end

  private

  def valid_next_day_work_type
    return if next_day_work_type_id.nil?

    if next_day_work_type_id == id
      errors.add(:next_day_work_type_id, "には自分自身を選択できません。")
    elsif !facility.work_types.active.exists?(id: next_day_work_type_id)
      errors.add(:next_day_work_type_id, "は同じ施設の有効な勤務を選択してください。")
    elsif reverse_of_next_day_work_type?
      errors.add(:next_day_work_type_id, "は翌日に自分を設定している勤務のため選択できません。")
    end
  end

  def reverse_of_next_day_work_type?
    persisted? && facility.work_types.exists?(id: next_day_work_type_id, next_day_work_type_id: id)
  end
end
