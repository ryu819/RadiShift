# frozen_string_literal: true

require "rails_helper"

RSpec.describe DemoDataBuilder do
  describe ".call" do
    it "デモに必要なデータを枠数の範囲内で作る" do
      demo_environment = create(:demo_environment)

      result = DemoDataBuilder.call(demo_environment: demo_environment)

      expect_users(result, demo_environment)
      expect_schedule_months(result)
      expect_types(result)
      expect_assignments(result)
      expect_day_off_slots(result)
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
    expect_schedule_dates(months)

    expect(months.first.is_published?).to be true
    expect(months.last.is_published?).to be false
    expect(months.first.schedule_month_member_orders.count).to eq(20)
    expect(months.last.schedule_month_member_orders.count).to eq(0)
  end

  def expect_schedule_dates(months)
    today = Date.current
    next_month = today.next_month

    expected_months = [
      [today.year, today.month],
      [next_month.year, next_month.month]
    ]

    expect(months.pluck(:year, :month)).to eq(expected_months)

    months.each do |month|
      month_start = Date.new(month.year, month.month, 1)

      expect(month.schedule_days.order(:date).pluck(:date)).to eq(
        (month_start..month_start.end_of_month).to_a
      )
    end
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

  def expect_day_off_slots(result)
    facility = result[:facility]
    expected_slots = { "休み" => 5, "午後休" => 3, "残業✕" => 3 }
    day_off_types = facility.day_off_types.index_by(&:name)
    schedule_days = ScheduleDay.where(schedule_month: facility.schedule_months)
    slots_by_key = DayOffSlot.where(schedule_day: schedule_days).index_by do |slot|
      [slot.schedule_day_id, slot.day_off_type_id]
    end
    assigned_counts = DayOffAssignment.where(schedule_day: schedule_days)
                        .group(:schedule_day_id, :day_off_type_id).count

    aggregate_failures("休み枠と確定済み割当") do
      expected_slots.each do |name, max_slots|
        day_off_type = day_off_types.fetch(name)
        rules = facility.day_off_slot_rules.where(day_off_type: day_off_type).order(:weekday)

        expect(rules.pluck(:weekday, :max_slots)).to eq(
          (0..7).map { |weekday| [weekday, max_slots] }
        ), name

        schedule_days.each do |schedule_day|
          key = [schedule_day.id, day_off_type.id]
          assigned_count = assigned_counts.fetch(key, 0)
          message = "#{schedule_day.date} #{name}: expected_max_slots=#{max_slots}, assigned_count=#{assigned_count}"

          expect(slots_by_key[key]&.max_slots).to eq(max_slots), message
          expect(assigned_count).to(be <= max_slots, message)
        end
      end
    end
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
