"use client";

import { useState } from "react";

import {
  DEFAULT_SHIFT_DISPLAY_VISIBILITY,
  type ShiftDisplayVisibility,
  type ShiftDisplayVisibilityKey,
} from "@/constants/shift-display";

export function useShiftDisplayVisibility() {
  const [visibility, setVisibility] = useState<ShiftDisplayVisibility>(
    DEFAULT_SHIFT_DISPLAY_VISIBILITY,
  );

  const updateVisibility = (
    key: ShiftDisplayVisibilityKey,
    checked: boolean,
  ) => {
    const nextVisibility = {
      ...visibility,
      [key]: checked,
    };

    setVisibility(nextVisibility);
  };

  return {
    visibility,
    updateVisibility,
  };
}
