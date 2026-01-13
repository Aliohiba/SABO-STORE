import React, { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";

export interface ProductOption {
  id: string;
  name: string; // مثل: "الحجم" أو "اللون"
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  name: string; // مثل: "صغير" أو "أحمر"
  priceModifier?: number; // تعديل السعر (+ أو -)
  stock?: number; // الكمية لهذا الخيار
  sku?: string; // كود المنتج لهذا الخيار
}

interface ProductOptionsManagerProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}

const ProductOptionsManager: React.FC<ProductOptionsManagerProps> = ({ options, onChange }) => {
  const [hasOptions, setHasOptions] = useState(options.length > 0);

  // مزامنة hasOptions مع options
  useEffect(() => {
    setHasOptions(options.length > 0);
  }, [options.length]);

  const addOption = () => {
    const newOption: ProductOption = {
      id: Date.now().toString(),
      name: "",
      values: [],
    };
    onChange([...options, newOption]);
  };

  const removeOption = (optionId: string) => {
    onChange(options.filter((opt) => opt.id !== optionId));
  };

  const updateOption = (optionId: string, updates: Partial<ProductOption>) => {
    onChange(
      options.map((opt) => (opt.id === optionId ? { ...opt, ...updates } : opt))
    );
  };

  const addOptionValue = (optionId: string) => {
    const newValue: ProductOptionValue = {
      id: Date.now().toString(),
      name: "",
      priceModifier: 0,
      stock: 0,
      sku: "",
    };
    updateOption(optionId, {
      values: [...(options.find((o) => o.id === optionId)?.values || []), newValue],
    });
  };

  const removeOptionValue = (optionId: string, valueId: string) => {
    const option = options.find((o) => o.id === optionId);
    if (option) {
      updateOption(optionId, {
        values: option.values.filter((v) => v.id !== valueId),
      });
    }
  };

  const updateOptionValue = (
    optionId: string,
    valueId: string,
    updates: Partial<ProductOptionValue>
  ) => {
    const option = options.find((o) => o.id === optionId);
    if (option) {
      updateOption(optionId, {
        values: option.values.map((v) =>
          v.id === valueId ? { ...v, ...updates } : v
        ),
      });
    }
  };

  const handleToggleOptions = (checked: boolean) => {
    setHasOptions(checked);
    if (!checked) {
      onChange([]);
    } else {
      // إضافة خيار افتراضي عند التفعيل إذا لم يكن هناك خيارات
      if (options.length === 0) {
        const newOption: ProductOption = {
          id: Date.now().toString(),
          name: "",
          values: [],
        };
        onChange([newOption]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 space-x-reverse">
        <input
          type="checkbox"
          id="has-options"
          checked={hasOptions}
          onChange={(e) => handleToggleOptions(e.target.checked)}
          className="h-4 w-4 text-primary border-muted-foreground rounded focus:ring-primary"
        />
        <label htmlFor="has-options" className="text-sm font-medium text-foreground">
          يحتوي هذا المنتج على خيارات متعددة. مثل أحجام وألوان مختلفة.
        </label>
      </div>

      {hasOptions && (
        <div className="space-y-4 mt-4 border-t border-border pt-4">
          {options.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              اضغط على "إضافة خيار جديد" لإضافة خيارات المنتج
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                className="border border-border rounded-lg p-4 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    placeholder="اسم الخيار (مثل: الحجم، اللون)"
                    value={option.name}
                    onChange={(e) => updateOption(option.id, { name: e.target.value })}
                    className="flex-1 border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="mr-2 text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {option.values.map((value) => (
                    <div
                      key={value.id}
                      className="flex items-center gap-2 bg-background p-2 rounded border border-border"
                    >
                      <input
                        type="text"
                        placeholder="اسم القيمة (مثل: صغير، أحمر)"
                        value={value.name}
                        onChange={(e) =>
                          updateOptionValue(option.id, value.id, { name: e.target.value })
                        }
                        className="flex-1 border border-border bg-background rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="number"
                        placeholder="تعديل السعر"
                        value={value.priceModifier || 0}
                        onChange={(e) =>
                          updateOptionValue(option.id, value.id, {
                            priceModifier: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        className="w-24 border border-border bg-background rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="number"
                        placeholder="الكمية"
                        value={value.stock || 0}
                        onChange={(e) =>
                          updateOptionValue(option.id, value.id, {
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 border border-border bg-background rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="كود المنتج"
                        value={value.sku || ""}
                        onChange={(e) =>
                          updateOptionValue(option.id, value.id, { sku: e.target.value })
                        }
                        className="w-32 border border-border bg-background rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionValue(option.id, value.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(option.id)}
                    className="flex items-center text-sm text-primary hover:text-primary/80 mt-2"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة قيمة للخيار
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addOption}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة خيار جديد
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductOptionsManager;

