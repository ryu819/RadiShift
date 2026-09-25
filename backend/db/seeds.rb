# frozen_string_literal: true

ActiveRecord::Base.transaction do
  facility = Facility.create!(
    name: "デモ病院",
    request_deadline_day: 15
  )

  users = []

  admin_user = User.create!(
    name: "管理者",
    email: "admin@example.com",
    password: "password",
    password_confirmation: "password",
    facility: facility,
    is_admin: true,
    display_order: 1,
    confirmed_at: Time.current
  )

  users << admin_user

  29.times do |i|
    user = User.create!(
      name: "ユーザー#{i + 1}",
      email: "demo#{i + 1}@example.com",
      password: "password",
      password_confirmation: "password",
      facility: facility,
      display_order: i + 2,
      confirmed_at: Time.current
    )

    users << user
  end

  day_work = WorkType.create!(
    facility: facility,
    name: "日勤",
    color_code: "#f59e0b"
  )

  night_work = WorkType.create!(
    facility: facility,
    name: "夜勤",
    color_code: "#6366f1",
    is_requestable: true
  )

  overtime_work = WorkType.create!(
    facility: facility,
    name: "拘束",
    color_code: "#ff40f1"
  )

  day_off = DayOffType.create!(
    facility: facility,
    name: "休み",
    color_code: "#94a3b8",
    day_off_unit: 1
  )

  afternoon_day_off = DayOffType.create!(
    facility: facility,
    name: "午後休み",
    color_code: "#94a3b8",
    day_off_unit: 0.5
  )

  no_overtime = DayOffType.create!(
    facility: facility,
    name: "残業✕",
    color_code: "#94a3b8",
    day_off_unit: 0
  )

  day_off_types = [
    day_off,
    afternoon_day_off,
    no_overtime
  ]

  day_off_slot_settings = [
    { day_off_type: day_off, max_slots: 5 },
    { day_off_type: afternoon_day_off, max_slots: 2 },
    { day_off_type: no_overtime, max_slots: 2 }
  ]

  day_off_slot_settings.each do |setting|
    8.times do |weekday|
      DayOffSlotRule.create!(
        facility: facility,
        day_off_type: setting[:day_off_type],
        weekday: weekday,
        max_slots: setting[:max_slots]
      )
    end
  end

  ModalityType.create!(
    facility: facility,
    name: "MRI",
    color_code: "#6366F1"
  )

  ModalityType.create!(
    facility: facility,
    name: "CT",
    color_code: "#0EA5E9"
  )

  ModalityType.create!(
    facility: facility,
    name: "アンギオ",
    color_code: "#EF4444"
  )

  ModalityType.create!(
    facility: facility,
    name: "一般撮影",
    color_code: "#F59E0B"
  )

  ModalityType.create!(
    facility: facility,
    name: "透視",
    color_code: "#14B8A6"
  )

  ModalityType.create!(
    facility: facility,
    name: "マンモグラフィ",
    color_code: "#EC4899"
  )

  ModalityType.create!(
    facility: facility,
    name: "核医学",
    color_code: "#8B5CF6"
  )

  ModalityType.create!(
    facility: facility,
    name: "放射線治療",
    color_code: "#22C55E"
  )

  3.times do |i|
    schedule_month = ScheduleMonth.create!(
      facility: facility,
      year: 2026,
      month: i + 9,
      monthly_days_off: i + 9
    )

    start_date = Date.new(
      schedule_month.year,
      schedule_month.month,
      1
    )

    end_date = start_date.end_of_month

    schedule_days = (start_date..end_date).map do |date|
      ScheduleDay.create!(
        schedule_month: schedule_month,
        date: date,
        is_holiday: HolidayJapan.check(date)
      )
    end

    schedule_days.each do |schedule_day|
      day_off_types.each do |day_off_type|
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
    end

    # 管理者の勤務割当
    WorkAssignment.create!(
      schedule_day: schedule_days[0],
      user: admin_user,
      work_type: day_work
    )

    WorkAssignment.create!(
      schedule_day: schedule_days[0],
      user: admin_user,
      work_type: overtime_work
    )

    # -------------------------
    # 勤務希望
    # -------------------------

    # 承認待ち
    WorkRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[1],
      work_type: day_work,
      request_status: :pending,
      is_return: false
    )

    # 承認済み
    WorkRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[2],
      work_type: night_work,
      request_status: :approved,
      is_return: false
    )

    # 承認済みなので勤務割当も作る
    WorkAssignment.create!(
      schedule_day: schedule_days[2],
      user: users[0],
      work_type: night_work
    )

    # 返上リクエスト
    WorkRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[2],
      work_type: night_work,
      request_status: :pending,
      is_return: true
    )

    # 否認済み
    WorkRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[3],
      work_type: overtime_work,
      request_status: :rejected,
      is_return: false
    )

    # -------------------------
    # 休み希望
    # -------------------------

    # 承認待ち
    DayOffRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[5],
      day_off_type: day_off,
      request_status: :pending,
      is_return: false
    )

    # 承認済み
    DayOffRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[6],
      day_off_type: day_off,
      request_status: :approved,
      is_return: false
    )

    # 承認済みなので休み割当も作る
    DayOffAssignment.create!(
      schedule_day: schedule_days[6],
      user: users[0],
      day_off_type: day_off
    )

    # 返上リクエスト
    DayOffRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[6],
      day_off_type: day_off,
      request_status: :pending,
      is_return: true
    )

    # 否認済み
    DayOffRequest.create!(
      facility: facility,
      user: users[0],
      schedule_day: schedule_days[7],
      day_off_type: day_off,
      request_status: :rejected,
      is_return: false
    )
  end
end
