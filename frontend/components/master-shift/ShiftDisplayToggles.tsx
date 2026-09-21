"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  SHIFT_DISPLAY_VISIBILITY_ITEMS,
  type ShiftDisplayVisibility,
  type ShiftDisplayVisibilityKey,
} from "@/constants/shift-display";

type Props = {
  visibility: ShiftDisplayVisibility;
  onChange: (key: ShiftDisplayVisibilityKey, checked: boolean) => void;
};

export function ShiftDisplayToggles({ visibility, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-3 py-2">
      {SHIFT_DISPLAY_VISIBILITY_ITEMS.map((item) => {
        const checked = visibility[item.key];

        return (
          <label key={item.key} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={checked}
              onCheckedChange={(nextChecked) =>
                onChange(item.key, nextChecked === true)
              }
            />

            <span>{item.label}</span>
          </label>
        );
      })}
    </div>
  );
}
