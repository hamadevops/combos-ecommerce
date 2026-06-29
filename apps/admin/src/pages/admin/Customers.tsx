import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Ban,
  CheckCircle,
  Eye,
  User as UserIcon,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useCustomers } from "@/hooks/useCustomers";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Use useCustomers hook
  const { data: response, isLoading } = useCustomers({
    page: 1, // TODO: Add pagination state if API supports it
    limit: 50,
    search: searchTerm || undefined,
  });

  // API response structure: likely { data: [...] } or just [...] depending on request helper
  // Based on types, CustomersFindAllResponses has data?: Array<CustomerResponseDto>
  // Let's safe check both
  const customers = response?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <AdminLayout title="Quản lý khách hàng">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách khách hàng</CardTitle>
              <CardDescription>Danh sách người mua hàng và lịch sử mua sắm</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, email, sđt..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[300px]">Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">Tổng chi tiêu</TableHead>
                  <TableHead className="text-right">Đơn cuối</TableHead>
                  <TableHead className="text-right">Ngày tham gia</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : customers.length > 0 ? (
                  customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {(customer.fullName || "K").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.fullName}</span>
                            <span
                              className="text-xs text-muted-foreground hidden md:inline-block md:w-48 truncate"
                              title={customer.address}
                            >
                              {[customer.address, customer.ward, customer.district, customer.city]
                                .filter(Boolean)
                                .join(", ") || "Chưa có địa chỉ"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{customer.totalOrders || 0}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(customer.totalSpent || 0)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(customer.lastOrderAt)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsSheetOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => (window.location.href = `mailto:${customer.email}`)}
                            >
                              <Mail className="mr-2 h-4 w-4" /> Gửi email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Không tìm thấy khách hàng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          className="w-full sm:w-[540px] flex flex-col h-full bg-background"
          side="right"
        >
          {selectedCustomer && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex flex-col gap-1">
                  <SheetTitle>Khách hàng #{selectedCustomer.id}</SheetTitle>
                  <SheetDescription>
                    Tham gia {formatDate(selectedCustomer.createdAt)}
                  </SheetDescription>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {(selectedCustomer.fullName || "K").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{selectedCustomer.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <UserIcon className="h-4 w-4" /> Thông tin liên hệ
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm p-3 border rounded-lg">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="col-span-2 font-medium break-all">
                          {selectedCustomer.email || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Điện thoại</span>
                        <span className="col-span-2 font-medium">
                          {selectedCustomer.phone || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Địa chỉ</span>
                        <span className="col-span-2 font-medium">
                          {[
                            selectedCustomer.address,
                            selectedCustomer.ward,
                            selectedCustomer.district,
                            selectedCustomer.city,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Tổng đơn hàng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">
                          {selectedCustomer.totalOrders || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Tổng chi tiêu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(selectedCustomer.totalSpent || 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Placeholder for Order History */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" /> Lịch sử mua hàng
                    </h3>
                    <div className="text-sm text-muted-foreground text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                      Chức năng xem lịch sử đơn hàng chi tiết đang phát triển
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminCustomers;
