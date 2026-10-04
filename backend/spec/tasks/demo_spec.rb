# frozen_string_literal: true

require "rails_helper"
require "rake"

Rails.application.load_tasks unless Rake::Task.task_defined?("demo:cleanup_expired")

RSpec.describe "demo:cleanup_expired" do
  let(:task) { Rake::Task["demo:cleanup_expired"] }

  before { task.reenable }

  it "期限切れのデモ環境と関連データを削除する" do
    records = create_expired_demo_records

    task.invoke

    records.each do |record|
      expect(record.class.exists?(record.id)).to be false
    end
  end

  it "期限内のデモ環境は削除しない" do
    records = create_basic_demo_records(23.hours.ago)

    task.invoke

    records.each do |record|
      expect(record.class.exists?(record.id)).to be true
    end
  end

  it "通常の施設とユーザーは削除しない" do
    facility = create(:facility)
    user = create(:user, facility: facility)

    task.invoke

    expect(Facility.exists?(facility.id)).to be true
    expect(User.exists?(user.id)).to be true
  end

  it "施設を削除済みでもデモユーザーを削除する" do
    demo_environment, facility, user = create_basic_demo_records(25.hours.ago)
    facility.destroy!

    expect(user.reload.facility).to be_nil
    expect(user.demo_environment).to eq(demo_environment)

    task.invoke

    expect(User.exists?(user.id)).to be false
    expect(DemoEnvironment.exists?(demo_environment.id)).to be false
  end

  def create_basic_demo_records(created_at)
    demo_environment = create(:demo_environment, created_at: created_at)
    facility = create(:facility, demo_environment: demo_environment)
    user = create(:user, facility: facility, demo_environment: demo_environment)

    [demo_environment, facility, user]
  end

  def create_expired_demo_records
    demo_environment, facility, user = create_basic_demo_records(25.hours.ago)

    schedule_month = create(:schedule_month, facility: facility, date: Date.current)
    schedule_day = create(:schedule_day, schedule_month: schedule_month, date: Date.current)

    work_type = create(:work_type, facility: facility)
    day_off_type = create(:day_off_type, facility: facility)
    modality_type = create(:modality_type, facility: facility)

    slot_records = create_slot_records(facility, schedule_day, day_off_type)

    assignment_records = create_assignment_records(
      user,
      schedule_day,
      work_type,
      day_off_type,
      modality_type
    )

    request_records = create_request_records(
      facility,
      user,
      schedule_day,
      work_type,
      day_off_type
    )

    member_order = create(
      :schedule_month_member_order,
      schedule_month: schedule_month,
      user: user,
      display_order: 1
    )

    [
      demo_environment,
      facility,
      user,
      schedule_month,
      schedule_day,
      work_type,
      day_off_type,
      modality_type,
      *slot_records,
      *assignment_records,
      *request_records,
      member_order
    ]
  end

  def create_slot_records(facility, schedule_day, day_off_type)
    slot_rule = create(
      :day_off_slot_rule,
      facility: facility,
      day_off_type: day_off_type
    )

    slot = create(
      :day_off_slot,
      schedule_day: schedule_day,
      day_off_type: day_off_type
    )

    [slot_rule, slot]
  end

  def create_assignment_records(user, schedule_day, work_type, day_off_type, modality_type)
    work_assignment = create(
      :work_assignment,
      user: user,
      schedule_day: schedule_day,
      work_type: work_type
    )

    day_off_assignment = create(
      :day_off_assignment,
      user: user,
      schedule_day: schedule_day,
      day_off_type: day_off_type
    )

    modality_assignment = create(
      :modality_assignment,
      user: user,
      schedule_day: schedule_day,
      modality_type: modality_type
    )

    [
      work_assignment,
      day_off_assignment,
      modality_assignment
    ]
  end

  def create_request_records(facility, user, schedule_day, work_type, day_off_type)
    work_request = create(
      :work_request,
      facility: facility,
      user: user,
      schedule_day: schedule_day,
      work_type: work_type
    )

    day_off_request = create(
      :day_off_request,
      facility: facility,
      user: user,
      schedule_day: schedule_day,
      day_off_type: day_off_type
    )

    [work_request, day_off_request]
  end
end
