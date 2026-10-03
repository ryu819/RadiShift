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

  after_night_work = WorkType.create!(
    facility: facility,
    name: "明け",
    color_code: "#a78bfa"
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
    name: "午後休",
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

  modality_types = [
    ModalityType.create!(
      facility: facility,
      name: "MRI",
      color_code: "#6366F1"
    ),
    ModalityType.create!(
      facility: facility,
      name: "CT",
      color_code: "#0EA5E9"
    ),
    ModalityType.create!(
      facility: facility,
      name: "XA",
      color_code: "#EF4444"
    ),
    ModalityType.create!(
      facility: facility,
      name: "一般",
      color_code: "#F59E0B"
    ),
    ModalityType.create!(
      facility: facility,
      name: "透視",
      color_code: "#14B8A6"
    ),
    ModalityType.create!(
      facility: facility,
      name: "マンモ",
      color_code: "#EC4899"
    ),
    ModalityType.create!(
      facility: facility,
      name: "核医学",
      color_code: "#8B5CF6"
    ),
    ModalityType.create!(
      facility: facility,
      name: "治療",
      color_code: "#22C55E"
    )
  ]

  # シフトパターン
  #
  # 夜勤の次は必ず明け
  #
  # 日勤 + 拘束
  # 日勤 + モダリティ
  # 夜勤
  # 明け
  # 日勤 + 午後休み
  # 日勤 + 残業✕
  # 休み
  # 日勤 + モダリティ

  shift_patterns = [
    :day_overtime,
    :day,
    :night,
    :after_night,
    :day_afternoon_off,
    :day_no_overtime,
    :off,
    :day
  ]

  current_month = Date.current.beginning_of_month

  target_months = [
    current_month.prev_month,
    current_month,
    current_month.next_month
  ]

  first_date = target_months.first

  target_months.each_with_index do |month_start, month_index|
    schedule_month = ScheduleMonth.create!(
      facility: facility,
      year: month_start.year,
      month: month_start.month,
      monthly_days_off: month_index + 9,
      is_published: month_index < 2
    )

    schedule_days = (month_start..month_start.end_of_month).map do |date|
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

    schedule_month.capture_member_order! if schedule_month.is_published?

    users.each_with_index do |user, user_index|
      schedule_days.each do |schedule_day|
        days_from_start =
          (schedule_day.date - first_date).to_i

        pattern_index =
          (days_from_start + user_index) % shift_patterns.length

        pattern = shift_patterns[pattern_index]

        case pattern
        when :night

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: night_work
          )

        when :after_night

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: after_night_work
          )

        when :day_overtime

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: day_work
          )

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: overtime_work
          )

          modality_index =
            (schedule_day.date.day + user_index) % modality_types.length

          ModalityAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            modality_type: modality_types[modality_index]
          )

        when :day_afternoon_off

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: day_work
          )

          DayOffAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            day_off_type: afternoon_day_off
          )

          modality_index =
            (schedule_day.date.day + user_index) % modality_types.length

          ModalityAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            modality_type: modality_types[modality_index]
          )

        when :day_no_overtime

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: day_work
          )

          DayOffAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            day_off_type: no_overtime
          )

          modality_index =
            (schedule_day.date.day + user_index) % modality_types.length

          ModalityAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            modality_type: modality_types[modality_index]
          )

        when :off

          DayOffAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            day_off_type: day_off
          )

        when :day

          WorkAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            work_type: day_work
          )

          modality_index =
            (schedule_day.date.day + user_index) % modality_types.length

          ModalityAssignment.create!(
            schedule_day: schedule_day,
            user: user,
            modality_type: modality_types[modality_index]
          )
        end
      end
    end

    # 申請データは今月だけ作る

    next unless month_start == current_month

    admin_night_days = schedule_days.select do |schedule_day|
      WorkAssignment.exists?(
        schedule_day: schedule_day,
        user: admin_user,
        work_type: night_work
      )
    end

    admin_day_off_days = schedule_days.select do |schedule_day|
      DayOffAssignment.exists?(
        schedule_day: schedule_day,
        user: admin_user,
        day_off_type: day_off
      )
    end

    admin_day_work_days = schedule_days.select do |schedule_day|
      WorkAssignment.exists?(
        schedule_day: schedule_day,
        user: admin_user,
        work_type: day_work
      )
    end

    WorkRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: admin_day_work_days[0],
      work_type: night_work,
      request_status: :pending,
      is_return: false
    )

    night_day = admin_night_days[0]

    approved_work_request = WorkRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: night_day,
      work_type: night_work,
      request_status: :approved,
      is_return: false
    )

    WorkAssignment.find_by!(
      schedule_day: night_day,
      user: admin_user,
      work_type: night_work
    ).update!(
      work_request: approved_work_request
    )

    WorkRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: night_day,
      work_type: night_work,
      request_status: :pending,
      is_return: true
    )

    WorkRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: admin_day_work_days[1],
      work_type: night_work,
      request_status: :rejected,
      is_return: false
    )

    DayOffRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: admin_day_work_days[2],
      day_off_type: day_off,
      request_status: :pending,
      is_return: false
    )

    day_off_day = admin_day_off_days[0]

    approved_day_off_request = DayOffRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: day_off_day,
      day_off_type: day_off,
      request_status: :approved,
      is_return: false
    )

    DayOffAssignment.find_by!(
      schedule_day: day_off_day,
      user: admin_user,
      day_off_type: day_off
    ).update!(
      day_off_request: approved_day_off_request
    )

    DayOffRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: day_off_day,
      day_off_type: day_off,
      request_status: :pending,
      is_return: true
    )

    DayOffRequest.create!(
      facility: facility,
      user: admin_user,
      schedule_day: admin_day_work_days[3],
      day_off_type: day_off,
      request_status: :rejected,
      is_return: false
    )

    WorkRequest.create!(
      facility: facility,
      user: users[1],
      schedule_day: schedule_days[10],
      work_type: night_work,
      request_status: :pending,
      is_return: false
    )

    DayOffRequest.create!(
      facility: facility,
      user: users[2],
      schedule_day: schedule_days[11],
      day_off_type: day_off,
      request_status: :pending,
      is_return: false
    )

    WorkRequest.create!(
      facility: facility,
      user: users[3],
      schedule_day: schedule_days[12],
      work_type: night_work,
      request_status: :pending,
      is_return: false
    )

    DayOffRequest.create!(
      facility: facility,
      user: users[4],
      schedule_day: schedule_days[17],
      day_off_type: afternoon_day_off,
      request_status: :pending,
      is_return: false
    )
  end
end
