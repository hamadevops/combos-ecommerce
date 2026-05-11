import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmSegment,
  useEmContacts,
  useAssignContactsToSegment,
  useRemoveContactsFromSegment,
} from "@/hooks/useEmailMarketing";
import { Users, ArrowLeft, UserPlus, UserMinus, Loader2, Search, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AddContactsDialog } from "./components/AddContactsDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function EmSegmentDetail() {
  const { id } = useParams<{ id: string }>();
  const segmentId = Number(id);

  const { data: segment, isLoading: isLoadingSegment } = useEmSegment(segmentId);
  const [page, setPage] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: contactsData, isLoading: isLoadingContacts } = useEmContacts({
    segmentId,
    page,
    limit: 20,
  });

  const removeContacts = useRemoveContactsFromSegment(segmentId);

  const contacts = contactsData?.items || [];
  const meta = contactsData?.meta;
  const isLoading = isLoadingSegment || isLoadingContacts;

  const toggleContact = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    );
  };

  const toggleAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c: any) => c.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedContacts.length === 0) return;
    removeContacts.mutate(selectedContacts, {
      onSuccess: () => setSelectedContacts([]),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Chi tiết Segment">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chi tiết Segment">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/email-marketing/segments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{segment?.name || "Segment"}</h2>
            {segment?.description && <p className="text-muted-foreground">{segment.description}</p>}
          </div>
        </div>

        {/* Contacts in segment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contacts trong segment
              </CardTitle>
              <CardDescription>{contacts.length} contacts</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedContacts.length > 0 && (
                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" size="sm" disabled={removeContacts.isPending}>
                      {removeContacts.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4 mr-1" />
                      )}
                      Gỡ ({selectedContacts.length})
                    </Button>
                  }
                  title="Gỡ liên hệ?"
                  description={`Bạn có chắc chắn muốn gỡ ${selectedContacts.length} liên hệ khỏi segment này?`}
                  onConfirm={handleRemoveSelected}
                />
              )}
              <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1" />
                Thêm contacts
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Chưa có contact nào trong segment này
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact: any) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => toggleContact(contact.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{contact.email}</TableCell>
                        <TableCell>
                          {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={contact.isSubscribed ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {contact.isSubscribed ? "Subscribed" : "Unsubscribed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(meta.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (meta.totalPages > 7) {
                        if (
                          pageNum !== 1 &&
                          pageNum !== meta.totalPages &&
                          Math.abs(pageNum - page) > 2
                        ) {
                          if (Math.abs(pageNum - page) === 3)
                            return (
                              <span key={pageNum} className="px-2">
                                ...
                              </span>
                            );
                          return null;
                        }
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageNum === page}
                            onClick={() => setPage(pageNum)}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                        className={
                          page >= meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add contacts dialog */}
        <AddContactsDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          segmentId={segmentId}
          existingContactIds={contacts.map((c: any) => c.id)}
        />
      </div>
    </AdminLayout>
  );
}
