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
}

export function ZodiacSelect({ value, onChange, placeholder = "选择属相" }: ZodiacSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {ZODIAC_ANIMALS.map((animal) => (
          <SelectItem key={animal} value={animal}>
            {animal}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
