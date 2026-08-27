export const CACHE_TAGS = {
  scheduleMonths: "schedule-months",
  allScheduleMonth: "all-schedule-month",
  scheduleMonth: (scheduleMonthId: number) =>
    `schedule-month:${scheduleMonthId}`,
  members: "members",
  facility: "facility",
  facilityInvitation: "facility-invitation",
  workTypes: "work-types",
  dayOffTypes: "day-off-types",
  modalityTypes: "modality-types",
  workRequests: "work-requests",
  dayOffRequests: "day-off-requests",
  workAssignments: "work-assignments",
  dayOffSlotRules: "day-off-slot-rules",
  masterShifts: "master-shifts",
  masterShift: (year: number, month: number) => `master-shift:${year}-${month}`,
};
