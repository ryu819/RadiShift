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
    <div className="flex items-center gap-3 px-3 py-2">
      {SHIFT_DISPLAY_VISIBILITY_ITEMS.map((item) => {
        const checked = visibility[item.key];

        return (
          <div key={item.key} className="flex items-center gap-1 text-sm">
            <Checkbox
              id={`${item.key}Toggle`}
              checked={checked}
              onCheckedChange={(nextChecked) =>
                onChange(item.key, nextChecked === true)
              }
            />
            <label htmlFor={`${item.key}Toggle`} className="whitespace-nowrap">
              {item.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}
