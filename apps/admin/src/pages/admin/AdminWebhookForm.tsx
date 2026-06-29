import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import KeyValInput, { KeyValuePair } from "@/components/common/KeyValInput";
import { components } from "@/docs/api-types";

type CreateWebhookDto = components["schemas"]["CreateWebhookDto"];
type UpdateWebhookDto = components["schemas"]["UpdateWebhookDto"];
type Webhook = components["schemas"]["Webhook"];

// Predefined events
const EVENT_OPTIONS: Option[] = [
  { label: "Order Created", value: "order.created" },
  { label: "Order Updated", value: "order.updated" },
  { label: "Order Paid", value: "order.paid" },
  { label: "Order Cancelled", value: "order.cancelled" },
  { label: "Product Created", value: "product.created" },
  { label: "Product Updated", value: "product.updated" },
  { label: "Product Deleted", value: "product.deleted" },
  { label: "User Registered", value: "user.registered" },
  { label: "Review Created", value: "review.created" },
];

const webhookSchema = yup.object().shape({
  name: yup.string().required("Tên webhook là bắt buộc"),
  url: yup.string().url("URL không hợp lệ").required("URL là bắt buộc"),
  events: yup
    .array()
    .of(yup.string().required())
    .min(1, "Chọn ít nhất một sự kiện")
    .required("Sự kiện là bắt buộc"),
  headers: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string(),
        value: yup.string(),
      }),
    )
    .nullable(),
  isEnabled: yup.boolean().default(true),
});

interface AdminWebhookFormProps {
  initialData?: Webhook;
  onSubmit: (data: CreateWebhookDto | UpdateWebhookDto) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function AdminWebhookForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: AdminWebhookFormProps) {
  const form = useForm({
    resolver: yupResolver(webhookSchema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
      headers: [],
      isEnabled: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      // Transform object headers to array for the form
      let headersArray: { key: string; value: string }[] = [];
      if (initialData.headers) {
        headersArray = Object.entries(initialData.headers).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      }

      let parsedEvents: string[] = [];
      if (Array.isArray(initialData.events)) {
        parsedEvents = initialData.events as string[];
      } else if (typeof initialData.events === "string") {
        try {
          parsedEvents = JSON.parse(initialData.events);
        } catch (e) {
          parsedEvents = [];
        }
      }

      form.reset({
        name: initialData.name,
        url: initialData.url,
        events: parsedEvents,
        headers: headersArray,
        isEnabled: initialData.isEnabled,
      });
    } else {
      form.reset({
        name: "",
        url: "",
        events: [],
        headers: [],
        isEnabled: true,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: any) => {
    // Transform headers array back to object
    const headersObject = values.headers?.reduce((acc: any, curr: any) => {
      if (curr.key && curr.key.trim() !== "") {
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {});

    const payload = {
      ...values,
      method: initialData ? initialData.method : "POST",
      headers:
        !headersObject || Object.keys(headersObject).length === 0 ? undefined : headersObject,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">
            Tên Webhook <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ví dụ: Order Sync"
            {...form.register("name")}
            className={form.formState.errors.name ? "border-red-500" : ""}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">
            URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            placeholder="https://api.example.com/webhook"
            {...form.register("url")}
            className={form.formState.errors.url ? "border-red-500" : ""}
          />
          {form.formState.errors.url && (
            <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Sự kiện kích hoạt <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={form.control}
            name="events"
            render={({ field }) => (
              <MultiSelect
                options={EVENT_OPTIONS}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder="Chọn sự kiện..."
              />
            )}
          />
          {form.formState.errors.events && (
            <p className="text-sm text-red-500">{form.formState.errors.events.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Controller
            control={form.control}
            name="headers"
            render={({ field }) => (
              <KeyValInput
                value={(field.value || []) as KeyValuePair[]}
                onChange={field.onChange}
                label="Custom Headers (Optional)"
                placeholderKey="Header (e.g. X-API-Key)"
                placeholderValue="Value"
              />
            )}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            control={form.control}
            name="isEnabled"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} id="is-enabled" />
            )}
          />
          <Label htmlFor="is-enabled">Kích hoạt</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
}
