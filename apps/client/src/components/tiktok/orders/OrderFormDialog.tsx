import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/tiktok/ui/dialog";
import { Button } from "@/components/tiktok/ui/button";
import { Input } from "@/components/tiktok/ui/input";
import { Label } from "@/components/tiktok/ui/label";
import { Textarea } from "@/components/tiktok/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productPrice: number;
  productImage: string;
}

interface OrderFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

const OrderFormDialog = ({
  open,
  onOpenChange,
  productName,
  productPrice,
  productImage,
}: OrderFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({ title: "Vui lòng nhập họ tên", variant: "destructive" });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Vui lòng nhập số điện thoại", variant: "destructive" });
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      toast({ title: "Số điện thoại không hợp lệ", variant: "destructive" });
      return false;
    }
    if (!formData.address.trim()) {
      toast({ title: "Vui lòng nhập địa chỉ", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Prepare data for Google Sheet
    const orderData = {
      timestamp: new Date().toISOString(),
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      note: formData.note,
      productName: productName,
      productPrice: productPrice,
    };

    try {
      // Google Apps Script Web App URL - User needs to replace this with their own
      const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

      if (!GOOGLE_SCRIPT_URL) {
        // If no Google Script URL, just simulate success for demo
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: "Đặt hàng thành công!",
          description: "Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        });

        setFormData({
          fullName: "",
          phone: "",
          email: "",
          address: "",
          note: "",
        });
        onOpenChange(false);
      } else {
        // Send to Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", // Required for Google Apps Script
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        toast({
          title: "Đặt hàng thành công!",
          description: "Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        });

        setFormData({
          fullName: "",
          phone: "",
          email: "",
          address: "",
          note: "",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Thông tin đặt hàng</DialogTitle>
        </DialogHeader>

        {/* Product Info */}
        <div className="flex gap-3 p-3 bg-secondary rounded-lg">
          <img
            loading="lazy"
            decoding="async"
            src={productImage}
            alt={productName}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">{productName}</p>
            <p className="text-primary font-bold mt-1">{formatPrice(productPrice)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập email (không bắt buộc)"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Địa chỉ nhận hàng <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Nhập địa chỉ chi tiết"
              value={formData.address}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              value={formData.note}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận đặt hàng"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Bằng việc đặt hàng, bạn đồng ý với điều khoản dịch vụ của chúng tôi
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default OrderFormDialog;
