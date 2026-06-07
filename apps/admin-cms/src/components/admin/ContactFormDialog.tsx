import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateContact, useUpdateContact } from "@/hooks/useContacts";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Email không hợp lệ" }),
  phone: z.string().optional(),
  type: z.string().min(1, { message: "Loại là bắt buộc" }),
  status: z.string().min(1, { message: "Trạng thái là bắt buộc" }),
  message: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
}

export const ContactFormDialog = ({ open, onOpenChange, contact }: ContactFormDialogProps) => {
  const isEdit = !!contact;
  const { mutate: createContact, isPending: isCreating } = useCreateContact();
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "CONTACT_FORM",
      status: "UNREAD",
      message: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (contact) {
        form.reset({
          name: contact.name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          type: contact.type || "CONTACT_FORM",
          status: contact.status || "UNREAD",
          message: contact.message || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          phone: "",
          type: "CONTACT_FORM",
          status: "UNREAD",
          message: "",
        });
      }
    }
  }, [open, contact, form]);

  const onSubmit = (data: ContactFormValues) => {
    if (isEdit) {
      updateContact(
        { id: contact.id, data },
        {
          onSuccess: () => {
            toast.success("Cập nhật liên hệ thành công");
            onOpenChange(false);
          },
          onError: () => {
            toast.error("Có lỗi xảy ra khi cập nhật liên hệ");
          },
        }
      );
    } else {
      createContact(data, {
        onSuccess: () => {
          toast.success("Thêm liên hệ thành công");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Có lỗi xảy ra khi thêm liên hệ");
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật liên hệ" : "Thêm liên hệ mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết của người liên hệ hoặc đăng ký nhận tin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên người gửi</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại liên hệ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONTACT_FORM">Liên hệ (Form)</SelectItem>
                        <SelectItem value="NEWSLETTER">Nhận tin (Newsletter)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UNREAD">Chưa đọc</SelectItem>
                        <SelectItem value="READ">Đã đọc</SelectItem>
                        <SelectItem value="REPLIED">Đã trả lời</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung lời nhắn</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nội dung khách hàng muốn gửi..." 
                      className="resize-none" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Thêm liên hệ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
