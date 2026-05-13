"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ZODIAC_ANIMALS = [
  "鼠", "牛", "虎", "兔", "龙", "蛇",
  "马", "羊", "猴", "鸡", "狗", "猪",
];

interface ZodiacSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export function ZodiacSelect({ value, onChange, placeholder = "选择属相", allowClear }: ZodiacSelectProps) {
  return (
    <Select value={value || ""} onValueChange={(v) => onChange(v === "__clear__" || v === null ? "" : v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && value && (
          <SelectItem value="__clear__" className="text-muted-foreground">
            清除选择
          </SelectItem>
        )}
        {ZODIAC_ANIMALS.map((animal) => (
          <SelectItem key={animal} value={animal}>
            {animal}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
