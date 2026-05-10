import { useState, useEffect } from "react";
import { Save, Globe, Mail, Share2, ShoppingBag, Undo, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mockSettings } from "@/data/mockSettings";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/common/ImageUpload";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SliderSettingsInput } from "@/components/admin/SliderSettingsInput";
import { settingsService } from "@/services/settings.service";
import { uploadService } from "@/services/upload.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SettingsForm = ({ settingsData }: { settingsData: any[] }) => {
  // Dynamically generate schema based on actual data
  const generateSchema = (data: any[]) => {
    const shape: Record<string, any> = {};
    data.forEach((setting) => {
      const label = setting.label || setting.key;
      if (setting.key.includes("logo") || setting.key.includes("background")) {
        // Images can be optional or required depending on logic, keeping required for now if critical
        // But typically update doesn't require re-uploading if string (url) exists.
        // Yup schema for mixed:
        shape[setting.key] = yup.mixed().required(`${label} là bắt buộc`);
      } else if (setting.type === "number") {
        shape[setting.key] = yup
          .number()
          .typeError(`${label} phải là số`)
          .required(`${label} là bắt buộc`);
      } else if (setting.type === "json") {
        shape[setting.key] = yup.array().of(yup.mixed()).default([]);
      } else {
        // String fields: Allow empty strings (optional)
        shape[setting.key] = yup.string().nullable().default("");
      }
    });
    return yup.object().shape(shape);
  };

  const defaultValues = settingsData.reduce(
    (acc, setting) => {
      if (setting.type === "json") {
        try {
          acc[setting.key] =
            typeof setting.value === "string"
              ? JSON.parse(setting.value || "[]")
              : setting.value || [];
        } catch (e) {
          acc[setting.key] = [];
        }
      } else {
        if (setting.type === "number") {
          acc[setting.key] = Number(setting.value);
        } else {
          // Ensure null becomes empty string for inputs
          acc[setting.key] =
            setting.value === null || setting.value === undefined ? "" : setting.value;
        }
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const schema = generateSchema(settingsData);
  const [activeTab, setActiveTab] = useState("general");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: any }) => {
      return settingsService.update(id, { value });
    },
    onError: (error: any) => {
      console.error("Failed to update setting", error);
      toast.error(`Lỗi: ${error.message || "Không thể cập nhật cấu hình"}`);
    },
  });

  const onSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);

    toast.promise(
      Promise.all(
        settingsData.map(async (setting) => {
          let newValue = data[setting.key];

          // Handle Single File Upload (e.g. Logo, Background)
          if (newValue instanceof File) {
            try {
              console.log(`Uploading image for ${setting.key}...`);
              const url = await uploadService.uploadImage(newValue);
              console.log(`Upload success for ${setting.key}:`, url);
              newValue = url;
            } catch (error) {
              console.error(`Failed to upload image for ${setting.key}`, error);
              throw new Error(`Lỗi upload ảnh cho ${setting.label}`);
            }
          }

          // Handle JSON Fields (e.g. Slider)
          if (setting.type === "json") {
            // Check if it's the slider array
            if (Array.isArray(newValue)) {
              const updatedValue = await Promise.all(
                newValue.map(async (item: any) => {
                  // Helper to upload image in slider item if changed
                  if (item.image instanceof File) {
                    try {
                      const url = await uploadService.uploadImage(item.image);
                      return { ...item, image: url };
                    } catch (error) {
                      console.error(`Failed to upload slider image`, error);
                      throw new Error(`Lỗi upload ảnh slider`);
                    }
                  }
                  return item;
                }),
              );
              newValue = JSON.stringify(updatedValue);
            } else {
              newValue = JSON.stringify(newValue);
            }
          } else {
            newValue = String(newValue);
          }

          // Only update if value matches expected type/format or just send string
          // Compare with original value to avoid unnecessary requests
          const originalValue = setting.value;
          const valueHasChanged = String(newValue) !== String(originalValue);

          if (!valueHasChanged) {
            return;
          }

          console.log(`Updating setting ${setting.key}:`, { from: originalValue, to: newValue });

          return updateSettingMutation.mutateAsync({
            id: setting.id,
            value: newValue,
          });
        }),
      ),
      {
        loading: "Đang lưu cấu hình...",
        success: "Đã lưu cấu hình thành công!",
        error: (err) => `Lỗi: ${err.message || "Có lỗi xảy ra khi lưu cấu hình"}`,
      },
    );
  };

  const renderInputs = (groupName: string) => {
    return settingsData
      .filter((s) => s.group === groupName)
      .map((setting) => {
        const mockSetting = mockSettings.find((m) => m.key === setting.key);
        const label = setting.label || mockSetting?.label || setting.key;

        return (
          <div key={setting.id || setting.key} className="space-y-2">
            <Label htmlFor={setting.key}>{label}</Label>
            <Controller
              name={setting.key}
              control={control}
              render={({ field }) => {
                if (setting.key.includes("logo") || setting.key.includes("background")) {
                  return (
                    <div className="max-w-md">
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        multiple={false}
                        maxFiles={1}
                      />
                    </div>
                  );
                }

                if (setting.key === "home_slider") {
                  return (
                    <div className="max-w-full">
                      <SliderSettingsInput value={field.value} onChange={field.onChange} />
                    </div>
                  );
                }

                if (
                  setting.key === "site_description" ||
                  setting.key === "store_description" ||
                  setting.key === "map_iframe" ||
                  setting.key === "contact_address"
                ) {
                  return (
                    <Textarea
                      {...field}
                      id={setting.key}
                      rows={setting.key === "map_iframe" ? 4 : 2}
                      className="font-mono text-sm"
                      placeholder={setting.label}
                    />
                  );
                }

                return (
                  <Input
                    {...field}
                    id={setting.key}
                    type={setting.type === "number" ? "number" : "text"}
                    step={setting.key === "store_rating" ? "0.1" : "1"}
                    className={errors[setting.key] ? "border-red-500" : ""}
                  />
                );
              }}
            />
            {errors[setting.key] && (
              <p className="text-xs text-red-500">{(errors[setting.key] as any)?.message}</p>
            )}
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        );
      });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (e) => console.error("Form errors:", e))}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Cấu hình chung</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin website và các thiết lập khác.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>
            <Undo className="mr-2 h-4 w-4" /> Hủy bỏ
          </Button>
          <Button type="submit" disabled={updateSettingMutation.isPending}>
            {updateSettingMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" /> Cửa hàng
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <ShoppingBag className="h-4 w-4" /> Giao diện
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="h-4 w-4" /> Liên hệ
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" /> Mạng xã hội
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Cửa hàng</CardTitle>
                <CardDescription>Các thông tin cơ bản hiển thị trên trang chủ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{renderInputs("general")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Giao diện Trang chủ</CardTitle>
                <CardDescription>Tùy chỉnh banner, slider và hình ảnh.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{renderInputs("appearance")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
                <CardDescription>Thông tin hiển thị ở footer và trang liên hệ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{renderInputs("contact")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Mạng xã hội</CardTitle>
                <CardDescription>Liên kết đến các trang mạng xã hội của cửa hàng.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{renderInputs("social")}</CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </form>
  );
};

const AdminSettings = () => {
  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.getAll,
  });

  if (isLoading) {
    return (
      <AdminLayout title="Cài đặt hệ thống">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const dataToProcess: any[] = Array.isArray(settingsData)
    ? settingsData
    : (settingsData as any)?.data || [];

  return (
    <AdminLayout title="Cài đặt hệ thống">
      <SettingsForm settingsData={dataToProcess} />
    </AdminLayout>
  );
};

export default AdminSettings;
