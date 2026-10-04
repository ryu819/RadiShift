# frozen_string_literal: true

require "rails_helper"

RSpec.describe DemoDataBuilder do
  describe ".call" do
    it "デモに必要なデータを作る" do
      demo_environment = create(:demo_environment)

      result = DemoDataBuilder.call(demo_environment: demo_environment)

      expect_users(result, demo_environment)
      expect_schedule_months(result)
      expect_types(result)
      expect_assignments(result)
      expect_requests(result)
    end
  end

  def expect_users(result, demo_environment)
    facility = result[:facility]
    admin_user = result[:admin_user]
    member = facility.users.where(is_admin: false).first

    expect(facility.demo_environment).to eq(demo_environment)
    expect(facility.users.count).to eq(20)
    expect(facility.users.where(is_admin: true).count).to eq(1)
    expect(admin_user.demo_environment).to eq(demo_environment)

    expect(admin_user.valid_password?("password")).to be false
    expect(member.valid_password?("password")).to be false
  end

  def expect_schedule_months(result)
    facility = result[:facility]
    months = facility.schedule_months.order(:year, :month)

    expect(months.count).to eq(2)
    expect(months.first.is_published?).to be true
    expect(months.last.is_published?).to be false

    expect(months.first.schedule_month_member_orders.count).to eq(20)
    expect(months.last.schedule_month_member_orders.count).to eq(0)
  end

  def expect_types(result)
    facility = result[:facility]

    expect(facility.work_types.count).to eq(4)
    expect(facility.day_off_types.count).to eq(3)
    expect(facility.modality_types.count).to eq(8)
    expect(facility.day_off_slot_rules.count).to eq(24)
  end

  def expect_assignments(result)
    facility = result[:facility]
    months = facility.schedule_months.order(:year, :month)

    current_day_ids = months.first.schedule_days.select(:id)
    next_day_ids = months.last.schedule_days.select(:id)

    expect(WorkAssignment.where(schedule_day_id: current_day_ids)).not_to be_empty
    expect(DayOffAssignment.where(schedule_day_id: current_day_ids)).not_to be_empty
    expect(ModalityAssignment.where(schedule_day_id: current_day_ids)).not_to be_empty
    expect(WorkAssignment.where(schedule_day_id: next_day_ids)).not_to be_empty
  end

  def expect_requests(result)
    facility = result[:facility]
    months = facility.schedule_months.order(:year, :month)

    current_day_ids = months.first.schedule_days.select(:id)
    next_day_ids = months.last.schedule_days.select(:id)

    expect(WorkRequest.where(schedule_day_id: current_day_ids)).not_to be_empty
    expect(DayOffRequest.where(schedule_day_id: current_day_ids)).not_to be_empty
    expect(WorkRequest.where(schedule_day_id: next_day_ids)).to be_empty
    expect(DayOffRequest.where(schedule_day_id: next_day_ids)).to be_empty
  end
end
