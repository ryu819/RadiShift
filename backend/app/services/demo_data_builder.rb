# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class DemoDataBuilder
  MEMBER_COUNT = 19
  PASSWORD = "password"

  SHIFT_PATTERNS = [
    :day_overtime,
    :day,
    :night,
    :after_night,
    :day_afternoon_off,
    :day_no_overtime,
    :off,
    :day
  ].freeze

  MODALITY_TYPES = [
    ["MRI", "#6366F1"],
    ["CT", "#0EA5E9"],
    ["XA", "#EF4444"],
    ["一般", "#F59E0B"],
    ["透視", "#14B8A6"],
    ["マンモ", "#EC4899"],
    ["核医学", "#8B5CF6"],
    ["治療", "#22C55E"]
  ].freeze

  def self.call(demo_environment: nil)
    new(demo_environment: demo_environment).call
  end

  def initialize(demo_environment:)
    @demo_environment = demo_environment
  end

  def call
    @facility = create_facility
    @users = create_users
    @admin_user = users.first
    @work_types = create_work_types
    @day_off_types = create_day_off_types
    @modality_types = create_modality_types

    create_day_off_slot_rules
    create_schedule_data

    {
      facility: facility,
      admin_user: admin_user
    }
  end

  private

  attr_reader :demo_environment, :facility, :users, :admin_user,
              :work_types, :day_off_types, :modality_types

  def create_facility
    Facility.create!(
      name: facility_name,
      request_deadline_day: 15,
      demo_environment: demo_environment
    )
  end

  def create_users
    created_users = [create_admin_user]

    MEMBER_COUNT.times do |index|
      member_number = index + 1
      created_users << create_member(member_number)
    end

    created_users
  end

  def create_admin_user
    User.create!(
      name: "管理者",
      email: admin_email,
      password: PASSWORD,
      password_confirmation: PASSWORD,
      facility: facility,
      demo_environment: demo_environment,
      is_admin: true,
      display_order: 1,
      confirmed_at: Time.current
    )
  end

  def create_member(member_number)
    User.create!(
      name: "ユーザー#{member_number}",
      email: member_email(member_number),
      password: PASSWORD,
      password_confirmation: PASSWORD,
      facility: facility,
      demo_environment: demo_environment,
      display_order: member_number + 1,
      confirmed_at: Time.current
    )
  end

  def create_work_types
    {
      day: WorkType.create!(
        facility: facility,
        name: "日勤",
        color_code: "#f59e0b"
      ),
      night: WorkType.create!(
        facility: facility,
        name: "夜勤",
        color_code: "#6366f1",
        is_requestable: true
      ),
      after_night: WorkType.create!(
        facility: facility,
        name: "明け",
        color_code: "#a78bfa"
      ),
      overtime: WorkType.create!(
        facility: facility,
        name: "拘束",
        color_code: "#ff40f1"
      )
    }
  end

  def create_day_off_types
    {
      day_off: DayOffType.create!(
        facility: facility,
        name: "休み",
        color_code: "#94a3b8",
        day_off_unit: 1
      ),
      afternoon: DayOffType.create!(
        facility: facility,
        name: "午後休",
        color_code: "#94a3b8",
        day_off_unit: 0.5
      ),
      no_overtime: DayOffType.create!(
        facility: facility,
        name: "残業✕",
        color_code: "#94a3b8",
        day_off_unit: 0
      )
    }
  end

  def create_modality_types
    MODALITY_TYPES.map do |name, color_code|
      ModalityType.create!(
        facility: facility,
        name: name,
        color_code: color_code
      )
    end
  end

  def create_day_off_slot_rules
    day_off_slot_settings.each do |day_off_type, max_slots|
      8.times do |weekday|
        create_day_off_slot_rule(
          day_off_type,
          max_slots,
          weekday
        )
      end
    end
  end

  def day_off_slot_settings
    {
      day_off_types[:day_off] => 5,
      day_off_types[:afternoon] => 2,
      day_off_types[:no_overtime] => 2
    }
  end

  def create_day_off_slot_rule(day_off_type, max_slots, weekday)
    DayOffSlotRule.create!(
      facility: facility,
      day_off_type: day_off_type,
      weekday: weekday,
      max_slots: max_slots
    )
  end

  def create_schedule_data
    target_months.each_with_index do |month_start, month_index|
      create_month_data(
        month_start,
        month_index
      )
    end
  end

  def target_months
    [
      current_month,
      current_month.next_month
    ]
  end

  def current_month
    @current_month ||= Date.current.beginning_of_month
  end

  def create_month_data(month_start, month_index)
    schedule_month = create_schedule_month(
      month_start,
      month_index
    )

    schedule_days = create_schedule_days(
      schedule_month,
      month_start
    )

    create_day_off_slots(schedule_days)

    schedule_month.capture_member_order! if schedule_month.is_published?

    create_assignments(schedule_days)

    return unless month_start == current_month

    create_requests(schedule_days)
  end

  def create_schedule_month(month_start, month_index)
    ScheduleMonth.create!(
      facility: facility,
      year: month_start.year,
      month: month_start.month,
      monthly_days_off: month_index + 10,
      is_published: month_start == current_month
    )
  end

  def create_schedule_days(schedule_month, month_start)
    (month_start..month_start.end_of_month).map do |date|
      ScheduleDay.create!(
        schedule_month: schedule_month,
        date: date,
        is_holiday: HolidayJapan.check(date)
      )
    end
  end

  def create_day_off_slots(schedule_days)
    schedule_days.each do |schedule_day|
      day_off_types.each_value do |day_off_type|
        create_day_off_slot(
          schedule_day,
          day_off_type
        )
      end
    end
  end

  def create_day_off_slot(schedule_day, day_off_type)
    weekday =
      schedule_day.is_holiday ? 7 : schedule_day.date.wday

    rule = DayOffSlotRule.find_by!(
      facility: facility,
      day_off_type: day_off_type,
      weekday: weekday
    )

    DayOffSlot.create!(
      schedule_day: schedule_day,
      day_off_type: day_off_type,
      max_slots: rule.max_slots
    )
  end

  def create_assignments(schedule_days)
    users.each_with_index do |user, user_index|
      create_user_assignments(
        user,
        user_index,
        schedule_days
      )
    end
  end

  def create_user_assignments(user, user_index, schedule_days)
    schedule_days.each do |schedule_day|
      pattern = shift_pattern_for(
        schedule_day,
        user_index
      )

      create_assignment(
        user,
        user_index,
        schedule_day,
        pattern
      )
    end
  end

  def shift_pattern_for(schedule_day, user_index)
    days_from_start =
      (schedule_day.date - current_month).to_i

    pattern_index =
      (days_from_start + user_index) % SHIFT_PATTERNS.length

    SHIFT_PATTERNS[pattern_index]
  end

  def create_assignment(user, user_index, schedule_day, pattern)
    case pattern
    when :night
      create_work_assignment(
        user,
        schedule_day,
        :night
      )
    when :after_night
      create_work_assignment(
        user,
        schedule_day,
        :after_night
      )
    when :day_overtime
      create_day_overtime(
        user,
        user_index,
        schedule_day
      )
    when :day_afternoon_off
      create_day_afternoon_off(
        user,
        user_index,
        schedule_day
      )
    when :day_no_overtime
      create_day_no_overtime(
        user,
        user_index,
        schedule_day
      )
    when :off
      create_day_off_assignment(
        user,
        schedule_day,
        :day_off
      )
    when :day
      create_day(
        user,
        user_index,
        schedule_day
      )
    end
  end

  def create_day_overtime(user, user_index, schedule_day)
    create_work_assignment(
      user,
      schedule_day,
      :day
    )

    create_work_assignment(
      user,
      schedule_day,
      :overtime
    )

    create_modality_assignment(
      user,
      user_index,
      schedule_day
    )
  end

  def create_day_afternoon_off(user, user_index, schedule_day)
    create_work_assignment(
      user,
      schedule_day,
      :day
    )

    create_day_off_assignment(
      user,
      schedule_day,
      :afternoon
    )

    create_modality_assignment(
      user,
      user_index,
      schedule_day
    )
  end

  def create_day_no_overtime(user, user_index, schedule_day)
    create_work_assignment(
      user,
      schedule_day,
      :day
    )

    create_day_off_assignment(
      user,
      schedule_day,
      :no_overtime
    )

    create_modality_assignment(
      user,
      user_index,
      schedule_day
    )
  end

  def create_day(user, user_index, schedule_day)
    create_work_assignment(
      user,
      schedule_day,
      :day
    )

    create_modality_assignment(
      user,
      user_index,
      schedule_day
    )
  end

  def create_work_assignment(user, schedule_day, work_type)
    WorkAssignment.create!(
      schedule_day: schedule_day,
      user: user,
      work_type: work_types[work_type]
    )
  end

  def create_day_off_assignment(
    user,
    schedule_day,
    day_off_type
  )
    DayOffAssignment.create!(
      schedule_day: schedule_day,
      user: user,
      day_off_type: day_off_types[day_off_type]
    )
  end

  def create_modality_assignment(
    user,
    user_index,
    schedule_day
  )
    modality_index =
      (schedule_day.date.day + user_index) % modality_types.length

    ModalityAssignment.create!(
      schedule_day: schedule_day,
      user: user,
      modality_type: modality_types[modality_index]
    )
  end

  def create_requests(schedule_days)
    admin_night_days =
      admin_work_days(schedule_days, :night)

    admin_day_off_days =
      admin_day_off_days(schedule_days)

    admin_day_work_days =
      admin_work_days(schedule_days, :day)

    create_admin_work_requests(
      admin_day_work_days,
      admin_night_days
    )

    create_admin_day_off_requests(
      admin_day_work_days,
      admin_day_off_days
    )

    create_member_requests(schedule_days)
  end

  def admin_work_days(schedule_days, work_type)
    schedule_days.select do |schedule_day|
      WorkAssignment.exists?(
        schedule_day: schedule_day,
        user: admin_user,
        work_type: work_types[work_type]
      )
    end
  end

  def admin_day_off_days(schedule_days)
    schedule_days.select do |schedule_day|
      DayOffAssignment.exists?(
        schedule_day: schedule_day,
        user: admin_user,
        day_off_type: day_off_types[:day_off]
      )
    end
  end

  def create_admin_work_requests(
    day_work_days,
    night_days
  )
    create_work_request(
      admin_user,
      day_work_days[0],
      :pending
    )

    night_day = night_days[0]

    approved_request = create_work_request(
      admin_user,
      night_day,
      :approved
    )

    attach_work_request(
      night_day,
      approved_request
    )

    create_work_request(
      admin_user,
      night_day,
      :pending,
      is_return: true
    )

    create_work_request(
      admin_user,
      day_work_days[1],
      :rejected
    )
  end

  def create_admin_day_off_requests(
    day_work_days,
    day_off_days
  )
    create_day_off_request(
      admin_user,
      day_work_days[2],
      day_off_types[:day_off],
      :pending
    )

    day_off_day = day_off_days[0]

    approved_request = create_day_off_request(
      admin_user,
      day_off_day,
      day_off_types[:day_off],
      :approved
    )

    attach_day_off_request(
      day_off_day,
      approved_request
    )

    create_day_off_request(
      admin_user,
      day_off_day,
      day_off_types[:day_off],
      :pending,
      is_return: true
    )

    create_day_off_request(
      admin_user,
      day_work_days[3],
      day_off_types[:day_off],
      :rejected
    )
  end

  def create_member_requests(schedule_days)
    create_work_request(
      users[1],
      schedule_days[10],
      :pending
    )

    create_day_off_request(
      users[2],
      schedule_days[11],
      day_off_types[:day_off],
      :pending
    )

    create_work_request(
      users[3],
      schedule_days[12],
      :pending
    )

    create_day_off_request(
      users[4],
      schedule_days[17],
      day_off_types[:afternoon],
      :pending
    )
  end

  def create_work_request(
    user,
    schedule_day,
    status,
    is_return: false
  )
    WorkRequest.create!(
      facility: facility,
      user: user,
      schedule_day: schedule_day,
      work_type: work_types[:night],
      request_status: status,
      is_return: is_return
    )
  end

  def create_day_off_request(
    user,
    schedule_day,
    day_off_type,
    status,
    is_return: false
  )
    DayOffRequest.create!(
      facility: facility,
      user: user,
      schedule_day: schedule_day,
      day_off_type: day_off_type,
      request_status: status,
      is_return: is_return
    )
  end

  def attach_work_request(
    schedule_day,
    work_request
  )
    WorkAssignment.find_by!(
      schedule_day: schedule_day,
      user: admin_user,
      work_type: work_types[:night]
    ).update!(
      work_request: work_request
    )
  end

  def attach_day_off_request(
    schedule_day,
    day_off_request
  )
    DayOffAssignment.find_by!(
      schedule_day: schedule_day,
      user: admin_user,
      day_off_type: day_off_types[:day_off]
    ).update!(
      day_off_request: day_off_request
    )
  end

  def facility_name
    return "デモ病院" unless demo_environment

    "デモ病院 #{demo_environment.id}"
  end

  def admin_email
    return "admin@example.com" unless demo_environment

    "demo-admin-#{demo_environment.id}@example.invalid"
  end

  def member_email(member_number)
    return "demo#{member_number}@example.com" unless demo_environment

    "demo-#{demo_environment.id}-#{member_number}@example.invalid"
  end
end
# rubocop:enable Metrics/ClassLength
