import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  isCategoryList?: boolean;
  children?: MenuItem[];
}

interface MenuSettingsInputProps {
  value: MenuItem[];
  onChange: (value: MenuItem[]) => void;
}

export const MenuSettingsInput = ({ value, onChange }: MenuSettingsInputProps) => {
  const items = Array.isArray(value) ? value : [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleUpdate = (newItems: MenuItem[]) => {
    onChange(newItems);
  };

  // Top level actions
  const handleAddTopItem = () => {
    const newItem: MenuItem = {
      title: "Menu mới",
      url: "/",
      children: [],
    };
    handleUpdate([...items, newItem]);
    setExpandedIndex(items.length); // Expand the newly created item
  };

  const handleRemoveTopItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    handleUpdate(newItems);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleMoveTopItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, movedItem);
    handleUpdate(newItems);

    if (expandedIndex === index) {
      setExpandedIndex(targetIndex);
    } else if (expandedIndex === targetIndex) {
      setExpandedIndex(index);
    }
  };

  const handleTopFieldChange = (index: number, field: keyof MenuItem, val: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: val,
    };
    handleUpdate(newItems);
  };

  // Submenu actions
  const handleAddSubItem = (parentIndex: number) => {
    const parent = items[parentIndex];
    const subChildren = Array.isArray(parent.children) ? parent.children : [];
    const newSubItem: MenuItem = {
      title: "Menu con mới",
      url: "/",
      children: [],
    };
    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: [...subChildren, newSubItem],
    };
    handleUpdate(newItems);
  };

  const handleRemoveSubItem = (parentIndex: number, subIndex: number) => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    subChildren.splice(subIndex, 1);

    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  const handleMoveSubItem = (parentIndex: number, subIndex: number, direction: "up" | "down") => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    if (direction === "up" && subIndex === 0) return;
    if (direction === "down" && subIndex === subChildren.length - 1) return;

    const targetIndex = direction === "up" ? subIndex - 1 : subIndex + 1;
    const [movedItem] = subChildren.splice(subIndex, 1);
    subChildren.splice(targetIndex, 0, movedItem);

    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  const handleSubFieldChange = (parentIndex: number, subIndex: number, field: keyof MenuItem, val: any) => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    subChildren[subIndex] = {
      ...subChildren[subIndex],
      [field]: val,
    };

    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  // Grandchild (Sub-submenu) actions
  const handleAddGrandchild = (parentIndex: number, subIndex: number) => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    const subItem = subChildren[subIndex];
    const grandchildren = Array.isArray(subItem.children) ? subItem.children : [];
    
    const newGrandchild: MenuItem = {
      title: "Menu con cấp 3",
      url: "/",
    };
    
    subChildren[subIndex] = {
      ...subItem,
      children: [...grandchildren, newGrandchild],
    };
    
    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  const handleRemoveGrandchild = (parentIndex: number, subIndex: number, grandIndex: number) => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    const subItem = subChildren[subIndex];
    const grandchildren = [...(subItem.children || [])];
    grandchildren.splice(grandIndex, 1);
    
    subChildren[subIndex] = {
      ...subItem,
      children: grandchildren,
    };
    
    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  const handleMoveGrandchild = (parentIndex: number, subIndex: number, grandIndex: number, direction: "up" | "down") => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    const subItem = subChildren[subIndex];
    const grandchildren = [...(subItem.children || [])];
    
    if (direction === "up" && grandIndex === 0) return;
    if (direction === "down" && grandIndex === grandchildren.length - 1) return;
    
    const targetIndex = direction === "up" ? grandIndex - 1 : grandIndex + 1;
    const [movedItem] = grandchildren.splice(grandIndex, 1);
    grandchildren.splice(targetIndex, 0, movedItem);
    
    subChildren[subIndex] = {
      ...subItem,
      children: grandchildren,
    };
    
    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  const handleGrandFieldChange = (parentIndex: number, subIndex: number, grandIndex: number, field: keyof MenuItem, val: any) => {
    const parent = items[parentIndex];
    const subChildren = [...(parent.children || [])];
    const subItem = subChildren[subIndex];
    const grandchildren = [...(subItem.children || [])];
    
    grandchildren[grandIndex] = {
      ...grandchildren[grandIndex],
      [field]: val,
    };
    
    subChildren[subIndex] = {
      ...subItem,
      children: grandchildren,
    };
    
    const newItems = [...items];
    newItems[parentIndex] = {
      ...parent,
      children: subChildren,
    };
    handleUpdate(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-semibold text-gray-700">Cấu trúc Menu</Label>
        <Button
          type="button"
          onClick={handleAddTopItem}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Thêm mục mới
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed rounded-xl p-8 text-center text-gray-400">
          Chưa có mục menu nào. Nhấp vào "Thêm mục mới" để bắt đầu.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const subItems = Array.isArray(item.children) ? item.children : [];

            return (
              <div
                key={index}
                className={cn(
                  "border rounded-xl bg-white transition-all shadow-sm",
                  isExpanded ? "border-purple-200 ring-2 ring-purple-100" : "hover:border-gray-200"
                )}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between p-3.5 cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800 text-sm">{item.title}</span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{item.url}</span>
                    {item.isCategoryList && (
                      <span className="text-[10px] bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded border border-green-100 uppercase tracking-wider">
                        Danh mục tự động
                      </span>
                    )}
                    {subItems.length > 0 && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded border border-purple-100">
                        {subItems.length} menu con
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Sort controls */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      disabled={index === 0}
                      onClick={() => handleMoveTopItem(index, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveTopItem(index, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveTopItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50/50 rounded-b-xl space-y-4">
                    {/* Link fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-600">Tên hiển thị</Label>
                        <Input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTopFieldChange(index, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-600">Đường dẫn / URL</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input
                            type="text"
                            className="pl-9"
                            placeholder="Ví dụ: /danh-muc hoặc /tin-tuc"
                            value={item.url}
                            onChange={(e) => handleTopFieldChange(index, "url", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category List Toggle */}
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-100">
                      <Checkbox
                        id={`cat-list-${index}`}
                        checked={!!item.isCategoryList}
                        onCheckedChange={(checked) => handleTopFieldChange(index, "isCategoryList", !!checked)}
                      />
                      <label
                        htmlFor={`cat-list-${index}`}
                        className="text-xs font-medium text-gray-700 cursor-pointer select-none"
                      >
                        Chuyển thành danh mục tự động (tự động load tất cả danh mục sản phẩm từ API làm menu con)
                      </label>
                    </div>

                    {/* Submenu Area */}
                    {!item.isCategoryList && (
                      <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Menu cấp con (Submenus)
                          </span>
                          <Button
                            type="button"
                            onClick={() => handleAddSubItem(index)}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Thêm menu con
                          </Button>
                        </div>

                        {subItems.length === 0 ? (
                          <div className="text-center py-4 text-xs text-gray-400">
                            Chưa có menu con.
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {subItems.map((sub, subIdx) => {
                              const grandchildren = Array.isArray(sub.children) ? sub.children : [];
                              return (
                                <div
                                  key={subIdx}
                                  className="flex flex-col bg-gray-50/60 p-3.5 rounded-lg border border-gray-100 gap-3"
                                >
                                  {/* Submenu Header Row */}
                                  <div className="flex items-center gap-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase w-14 shrink-0">
                                          Tên hiển thị
                                        </Label>
                                        <Input
                                          type="text"
                                          value={sub.title}
                                          className="h-8 text-xs bg-white"
                                          onChange={(e) => handleSubFieldChange(index, subIdx, "title", e.target.value)}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase w-14 shrink-0">
                                          Đường dẫn
                                        </Label>
                                        <Input
                                          type="text"
                                          value={sub.url}
                                          className="h-8 text-xs font-mono bg-white"
                                          placeholder="/..."
                                          onChange={(e) => handleSubFieldChange(index, subIdx, "url", e.target.value)}
                                        />
                                      </div>
                                    </div>

                                    {/* Sorting & Delete */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-gray-400 hover:text-gray-600"
                                        disabled={subIdx === 0}
                                        onClick={() => handleMoveSubItem(index, subIdx, "up")}
                                      >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-gray-400 hover:text-gray-600"
                                        disabled={subIdx === subItems.length - 1}
                                        onClick={() => handleMoveSubItem(index, subIdx, "down")}
                                      >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemoveSubItem(index, subIdx)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Submenu Category Option */}
                                  <div className="flex items-center space-x-2 pl-1 bg-white/50 p-2 rounded border border-gray-100/50">
                                    <Checkbox
                                      id={`sub-cat-list-${index}-${subIdx}`}
                                      checked={!!sub.isCategoryList}
                                      onCheckedChange={(checked) => handleSubFieldChange(index, subIdx, "isCategoryList", !!checked)}
                                    />
                                    <label
                                      htmlFor={`sub-cat-list-${index}-${subIdx}`}
                                      className="text-[11px] font-medium text-gray-600 cursor-pointer select-none"
                                    >
                                      Chuyển thành danh mục tự động (tự động load tất cả danh mục sản phẩm từ API làm menu con cấp 3)
                                    </label>
                                  </div>

                                  {/* Grandchildren List */}
                                  {!sub.isCategoryList && (
                                    <div className="pl-4 border-l border-dashed border-purple-200 mt-1 space-y-2.5">
                                      <div className="flex justify-between items-center pb-1">
                                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                          Menu con cấp 3 (Sub-submenus)
                                        </span>
                                        <Button
                                          type="button"
                                          onClick={() => handleAddGrandchild(index, subIdx)}
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-[10px] border-purple-200 text-purple-600 hover:bg-purple-50 flex items-center gap-1 px-2.5 py-0"
                                        >
                                          <Plus className="h-2.5 w-2.5" /> Thêm menu con cấp 3
                                        </Button>
                                      </div>

                                      {grandchildren.length === 0 ? (
                                        <div className="text-[10px] text-gray-400 italic py-1 pl-2">
                                          Chưa có menu con cấp 3.
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {grandchildren.map((grand, grandIdx) => (
                                            <div
                                              key={grandIdx}
                                              className="flex items-center gap-2 bg-white p-2 rounded border border-gray-150 shadow-sm"
                                            >
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-[9px] font-semibold text-gray-400 uppercase w-10 shrink-0">Tên</span>
                                                  <Input
                                                    type="text"
                                                    value={grand.title}
                                                    placeholder="Tên hiển thị cấp 3"
                                                    className="h-7 text-xs flex-grow"
                                                    onChange={(e) => handleGrandFieldChange(index, subIdx, grandIdx, "title", e.target.value)}
                                                  />
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-[9px] font-semibold text-gray-400 uppercase w-10 shrink-0">Link</span>
                                                  <Input
                                                    type="text"
                                                    value={grand.url}
                                                    placeholder="Đường dẫn cấp 3"
                                                    className="h-7 text-xs font-mono flex-grow"
                                                    onChange={(e) => handleGrandFieldChange(index, subIdx, grandIdx, "url", e.target.value)}
                                                  />
                                                </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex items-center shrink-0">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-gray-400"
                                                  disabled={grandIdx === 0}
                                                  onClick={() => handleMoveGrandchild(index, subIdx, grandIdx, "up")}
                                                >
                                                  <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-gray-400"
                                                  disabled={grandIdx === grandchildren.length - 1}
                                                  onClick={() => handleMoveGrandchild(index, subIdx, grandIdx, "down")}
                                                >
                                                  <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                                                  onClick={() => handleRemoveGrandchild(index, subIdx, grandIdx)}
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
