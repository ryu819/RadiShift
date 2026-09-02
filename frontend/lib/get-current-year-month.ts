import "server-only";

import { cacheLife } from "next/cache";

import { APP_TIME_ZONE } from "@/constants/time-zone";
import { dayjs } from "@/lib/dayjs";

type CurrentYearMonth = {
  year: number;
  month: number;
};

export async function getCurrentYearMonth(): Promise<CurrentYearMonth> {
  "use cache";

  cacheLife("seconds");

  const today = dayjs().tz(APP_TIME_ZONE);

  return {
    year: today.year(),
    month: today.month() + 1,
  };
}
