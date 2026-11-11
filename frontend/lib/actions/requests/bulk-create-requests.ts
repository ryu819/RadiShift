"use server";

import camelcaseKeys from "camelcase-keys";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import snakecaseKeys from "snakecase-keys";

import { CACHE_TAGS } from "@/constants/cache-tags";
import { getJwt } from "@/lib/auth/jwt";
import { isClientError, isServerError } from "@/lib/http-status";
import { setFlashToast } from "@/lib/set-flash-toast";

export type ActionState = {
  success: boolean;
  createdCount: number;
  failures: { scheduleDayId: number; reason: string }[];
};

type BulkCreateRequestResponse = {
  message: string;
  errors?: { scheduleDayId?: string[] };
};

const DEFAULT_ERROR_MESSAGE = "通信エラーのため申請できませんでした。";

export async function bulkCreateRequestsForm(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jwt = await getJwt();
  if (!jwt) redirect("/");

  const requestKind = formData.get("requestKind");
  const shiftTypeId = Number(formData.get("shiftTypeId"));
  const scheduleMonthId = Number(formData.get("scheduleMonthId"));
  const scheduleDayIds = formData.getAll("scheduleDayId").map(Number);

  if (scheduleDayIds.length === 0 || scheduleDayIds.length > 31) {
    return { success: false, createdCount: 0, failures: [] };
  }

  const isWork = requestKind === "work";
  const endpoint = isWork ? "work_requests" : "day_off_requests";
  let createdCount = 0;
  const failures: { scheduleDayId: number; reason: string }[] = [];

  await Promise.all(
    scheduleDayIds.map(async (scheduleDayId) => {
      const requestBody = isWork
        ? {
            workRequest: {
              scheduleDayId,
              workTypeId: shiftTypeId,
              isReturn: false,
            },
          }
        : {
            dayOffRequest: {
              scheduleDayId,
              dayOffTypeId: shiftTypeId,
              isReturn: false,
            },
          };

      try {
        const res = await fetch(`${process.env.RAILS_API_URL}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: jwt,
          },
          body: JSON.stringify(snakecaseKeys(requestBody)),
        });

        if (isServerError(res.status)) {
          failures.push({ scheduleDayId, reason: DEFAULT_ERROR_MESSAGE });
        } else {
          const data: BulkCreateRequestResponse = camelcaseKeys(
            await res.json(),
            { deep: true },
          );

          if (isClientError(res.status)) {
            failures.push({
              scheduleDayId,
              reason: data.errors?.scheduleDayId?.join("、") || data.message,
            });
          } else {
            createdCount++;
          }
        }
      } catch {
        failures.push({ scheduleDayId, reason: DEFAULT_ERROR_MESSAGE });
      }
    }),
  );

  failures.sort(
    (a, b) =>
      scheduleDayIds.indexOf(a.scheduleDayId) -
      scheduleDayIds.indexOf(b.scheduleDayId),
  );

  if (createdCount > 0) {
    updateTag(CACHE_TAGS.pendingRequests);
    updateTag(isWork ? CACHE_TAGS.workRequests : CACHE_TAGS.dayOffRequests);
    updateTag(CACHE_TAGS.scheduleMonth(scheduleMonthId));
  }

  if (failures.length === 0) {
    await setFlashToast({
      type: "success",
      message: `${createdCount}日分の申請をしました。`,
    });
  }

  return { success: failures.length === 0, createdCount, failures };
}
