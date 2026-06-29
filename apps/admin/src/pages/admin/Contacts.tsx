import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Download,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useContacts, useUpdateContactStatus, useDeleteContact } from "@/hooks/useContacts";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ContactFormDialog } from "@/components/admin/ContactFormDialog";

const AdminContacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  const { data: response, isLoading } = useContacts({
    page: 1,
    limit: 50,
    search: searchTerm || undefined,
    type: filterType !== "ALL" ? filterType : undefined,
    status: filterStatus !== "ALL" ? filterStatus : undefined,
  });

  const { mutate: updateStatus } = useUpdateContactStatus();
  const { mutate: deleteContact } = useDeleteContact();

  const contacts = response?.data || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatus({ id, status }, {
      onSuccess: () => {
        toast.success("Cập nhật trạng thái thành công");
        if (selectedContact?.id === id) {
          setSelectedContact({ ...selectedContact, status });
        }
      },
      onError: () => toast.error("Có lỗi xảy ra khi cập nhật")
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa liên hệ này?")) {
      deleteContact(id, {
        onSuccess: () => {
          toast.success("Xóa liên hệ thành công");
          setIsSheetOpen(false);
        },
        onError: () => toast.error("Có lỗi xảy ra khi xóa")
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><Clock className="w-3 h-3 mr-1" /> Chưa đọc</span>;
      case 'READ':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Eye className="w-3 h-3 mr-1" /> Đã đọc</span>;
      case 'REPLIED':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Đã trả lời</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'NEWSLETTER') {
      return <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-medium">Newsletter</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">Liên hệ</span>;
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (filterType !== "ALL") params.append("type", filterType);
    if (filterStatus !== "ALL") params.append("status", filterStatus);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api/v1";
    const token = auth.getToken();
    
    fetch(`${apiBaseUrl}/contacts/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => toast.error("Có lỗi xảy ra khi xuất CSV"));
  };

  return (
    <AdminLayout title="Quản lý Liên hệ">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách liên hệ</CardTitle>
              <CardDescription>Quản lý form liên hệ và người đăng ký nhận tin</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-56">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, email..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Loại liên hệ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="CONTACT_FORM">Form liên hệ</SelectItem>
                  <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả TT</SelectItem>
                  <SelectItem value="UNREAD">Chưa đọc</SelectItem>
                  <SelectItem value="READ">Đã đọc</SelectItem>
                  <SelectItem value="REPLIED">Đã trả lời</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9" onClick={handleExportCsv}>
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
              <Button size="sm" className="h-9" onClick={() => {
                setEditingContact(null);
                setIsFormOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[250px]">Người gửi</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thời gian</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : contacts.length > 0 ? (
                  contacts.map((contact: any) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {(contact.name || contact.email || "K").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col max-w-[150px]">
                            <span className="font-medium truncate">{contact.name || "Khách ẩn danh"}</span>
                            {contact.message && (
                              <span className="text-xs text-muted-foreground truncate" title={contact.message}>
                                {contact.message}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(contact.type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contact.status)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(contact.createdAt)}
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
                                setSelectedContact(contact);
                                setIsSheetOpen(true);
                                if (contact.status === 'UNREAD') {
                                  handleUpdateStatus(contact.id, 'READ');
                                }
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>
                            {contact.email && (
                              <DropdownMenuItem
                                onClick={() => (window.location.href = `mailto:${contact.email}`)}
                              >
                                <Mail className="mr-2 h-4 w-4" /> Trả lời email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingContact(contact);
                                setIsFormOpen(true);
                              }}
                            >
                              Sửa thông tin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(contact.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Không có dữ liệu liên hệ nào.
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
          {selectedContact && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex flex-col gap-1">
                  <SheetTitle>Chi tiết liên hệ</SheetTitle>
                  <SheetDescription>
                    Gửi lúc {formatDate(selectedContact.createdAt)}
                  </SheetDescription>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-6">
                  {/* Status & Type */}
                  <div className="flex gap-2">
                    {getTypeBadge(selectedContact.type)}
                    {getStatusBadge(selectedContact.status)}
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {(selectedContact.name || selectedContact.email || "K").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{selectedContact.name || "Khách ẩn danh"}</h3>
                      <div className="flex flex-col text-sm text-muted-foreground mt-1">
                        {selectedContact.email && (
                          <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedContact.email}</div>
                        )}
                        {selectedContact.phone && (
                          <div className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5" /> {selectedContact.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  {selectedContact.message && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Nội dung lời nhắn
                      </h3>
                      <div className="p-4 bg-muted/30 rounded-lg border text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedContact.message}
                      </div>
                    </div>
                  )}

                  {/* Marketing Tracking Info */}
                  {(selectedContact.utmSource || selectedContact.utmMedium || selectedContact.utmCampaign) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Thông tin Marketing</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm p-3 border rounded-lg bg-card">
                        {selectedContact.utmSource && (
                          <>
                            <div className="text-muted-foreground">Nguồn (Source)</div>
                            <div className="font-medium text-right">{selectedContact.utmSource}</div>
                          </>
                        )}
                        {selectedContact.utmMedium && (
                          <>
                            <div className="text-muted-foreground">Phương tiện (Medium)</div>
                            <div className="font-medium text-right">{selectedContact.utmMedium}</div>
                          </>
                        )}
                        {selectedContact.utmCampaign && (
                          <>
                            <div className="text-muted-foreground">Chiến dịch (Campaign)</div>
                            <div className="font-medium text-right">{selectedContact.utmCampaign}</div>
                          </>
                        )}
                        {selectedContact.utmTerm && (
                          <>
                            <div className="text-muted-foreground">Từ khóa (Term)</div>
                            <div className="font-medium text-right">{selectedContact.utmTerm}</div>
                          </>
                        )}
                        {selectedContact.utmContent && (
                          <>
                            <div className="text-muted-foreground">Nội dung (Content)</div>
                            <div className="font-medium text-right">{selectedContact.utmContent}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4" /> Cập nhật trạng thái
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant={selectedContact.status === 'UNREAD' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedContact.id, 'UNREAD')}
                      >
                        Chưa đọc
                      </Button>
                      <Button 
                        variant={selectedContact.status === 'READ' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedContact.id, 'READ')}
                      >
                        Đã đọc
                      </Button>
                      <Button 
                        variant={selectedContact.status === 'REPLIED' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedContact.id, 'REPLIED')}
                      >
                        Đã trả lời
                      </Button>
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ContactFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        contact={editingContact} 
      />
    </AdminLayout>
  );
};

export default AdminContacts;
