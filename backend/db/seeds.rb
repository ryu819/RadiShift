# frozen_string_literal: true

ActiveRecord::Base.transaction do
  facility = Facility.create!(
    name: "デモ病院",
    request_deadline: 7,
    rules_text: "デモ用の施設です。"
  )

  admin_user = User.create!(
    name: "管理者",
    email: "admin@example.com",
    password: "password",
    password_confirmation: "password",
    facility: facility,
    is_admin: true,
    confirmed_at: Time.current
  )

  29.times do |i|
    User.create!(
      name: "ユーザー#{i + 1}",
      email: "demo#{i + 1}@example.com",
      password: "password",
      password_confirmation: "password",
      facility: facility,
      confirmed_at: Time.current
    )
  end

  day_work = WorkType.create!(
    facility: facility,
    name: "日勤",
    color_code: "#f59e0b"
  )

  WorkType.create!(
    facility: facility,
    name: "夜勤",
    color_code: "#6366f1"
  )

  WorkType.create!(
    facility: facility,
    name: "残業",
    color_code: "#ff40f1"
  )

  DayOffType.create!(
    facility: facility,
    name: "休み",
    color_code: "#94a3b8",
    day_off_unit: 1
  )

  3.times do |i|
    schedule_month = ScheduleMonth.create!(
      facility: facility,
      year: 2026,
      month: i + 7,
      monthly_days_off: i + 8
    )

    start_date = Date.new(schedule_month.year, schedule_month.month, 1)
    end_date = start_date.end_of_month

    (start_date..end_date).each do |date|
      ScheduleDay.create!(
        schedule_month: schedule_month,
        date: date,
        is_holiday: HolidayJapan.check(date)
      )
    end

    first_schedule_day = ScheduleDay.find_by!(
      schedule_month: schedule_month,
      date: start_date
    )

    WorkAssignment.create!(
      schedule_day: first_schedule_day,
      user: admin_user,
      work_type: day_work
    )
  end
end
