import React, { useEffect } from "react";
import { Button } from "@/components/tiktok/ui/button";
import { Input } from "@/components/tiktok/ui/input";
import { Plus, Trash2 } from "lucide-react";

export interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValInputProps {
  value: KeyValuePair[];
  onChange: (value: KeyValuePair[]) => void;
  label?: string;
  placeholderKey?: string;
  placeholderValue?: string;
}

const KeyValInput: React.FC<KeyValInputProps> = ({
  value,
  onChange,
  label = "Headers",
  placeholderKey = "Key (e.g. Authorization)",
  placeholderValue = "Value (e.g. Bearer token)",
}) => {
  // Use value directly from props, default to empty array if null/undefined
  const entries = value || [];

  const handleAdd = () => {
    onChange([...entries, { key: "", value: "" }]);
  };

  const handleChange = (index: number, field: "key" | "value", val: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: val };
    onChange(newEntries);
  };

  const handleRemove = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="h-8">
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>

      {entries.length === 0 && (
        <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded text-center">
          No headers configured.
        </div>
      )}

      <div className="space-y-2">
        {entries.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder={placeholderKey}
              value={item.key}
              onChange={(e) => handleChange(index, "key", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={placeholderValue}
              value={item.value}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive/90"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyValInput;
