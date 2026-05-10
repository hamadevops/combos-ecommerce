import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Search, Image, GripVertical, ArrowUpDown, Save, X as XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useProducts, useDeleteProduct, useUpdateProductOrder } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { productApi } from "@/api/product";
import { Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandInput,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductFilters, ProductActiveBadges } from "@/components/admin/products/ProductFilters";
import { ProductsFindAllData } from "@vibe/shared";
import { Slider } from "@/components/ui/slider";

// DnD Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Helper if formatPrice is not in utils (it was imported from mockProducts before)
const formatPriceHelper = (price: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

// Sortable Row Component
const SortableProductRow = ({
  product,
  index,
  onOrderCommit,
}: {
  product: any;
  index: number;
  onOrderCommit: (id: number, newOrder: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  const [localVal, setLocalVal] = useState(product._displayOrder?.toString() || "0");

  useEffect(() => {
    setLocalVal(product._displayOrder?.toString() || "0");
  }, [product._displayOrder]);

  const handleCommit = () => {
    const val = parseInt(localVal) || 0;
    if (val !== product._displayOrder) {
      onOrderCommit(product.id, val);
    }
  };

  return (
    <TableRow id={`sortable-row-${product.id}`} ref={setNodeRef} style={style} className="border-b transition-colors hover:bg-muted/50 transition-all duration-500">
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="w-20">
        <Input
          type="number"
          min={0}
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCommit();
              e.currentTarget.blur();
            }
          }}
          className="w-16 h-8 text-center text-sm"
        />
      </TableCell>
      <TableCell>
        <div className="h-10 w-10 overflow-hidden rounded-lg bg-secondary">
          {product.images && product.images.length > 0 ? (
            <img
              src={getImageUrl(
                typeof product.images[0] === "string"
                  ? product.images[0]
                  : product.images[0].url,
              )}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <p className="font-medium text-sm">{product.name}</p>
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatPriceHelper(product.salePrice || product.price)}
      </TableCell>
    </TableRow>
  );
};

const AdminProducts = () => {
  const [filterParams, setFilterParams] = useState<ProductsFindAllData["query"]>({});
  const [page, setPage] = useState(1);
  const limit = 10;
  const [openCategoryFilter, setOpenCategoryFilter] = useState(false); // Legacy Popover State, can be removed if unused.

  // Sorting mode state
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [sortingPage, setSortingPage] = useState(1);
  const [hasMoreSorting, setHasMoreSorting] = useState(false);
  const [isFetchingSorting, setIsFetchingSorting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use Hooks — normal paginated view
  const {
    data: productsData,
    isLoading,
    isError,
  } = useProducts({
    page,
    limit,
    search: filterParams.search,
    categoryIds: filterParams.category_ids,
    minPrice: filterParams.min_price,
    maxPrice: filterParams.max_price,
    minStock: filterParams.minStock,
    maxStock: filterParams.maxStock,
    isActive: filterParams.isActive,
    sku: filterParams.sku,
    isFeatured: filterParams.isFeatured,
    isRecommended: filterParams.isRecommended,
    sort: filterParams.sort,
  });

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.items || [];

  const deleteProductMutation = useDeleteProduct();
  const updateOrderMutation = useUpdateProductOrder();

  const handleDelete = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  const products = productsData?.items || [];
  const meta = productsData?.meta;

  const getTotalStock = (product: any) => {
    return product.stock;
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchSortingProducts = async (pageToFetch: number, reset = false) => {
    try {
      setIsFetchingSorting(true);
      const sortingLimit = 20;
      const res = await productApi.getList({
        page: pageToFetch,
        limit: sortingLimit,
        sort: "display_order_asc",
      });
      const newItems = res.data.map((p: any, idx: number) => ({
        ...p,
        _displayOrder: p.displayOrder ?? ((pageToFetch - 1) * sortingLimit + idx),
      }));

      if (reset) {
        setLocalProducts(newItems);
      } else {
        setLocalProducts((prev) => [...prev, ...newItems]);
      }
      setHasMoreSorting(res.meta.total > pageToFetch * sortingLimit);
      setSortingPage(pageToFetch);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setIsFetchingSorting(false);
    }
  };

  // Enter sorting mode — load first page of products into local state
  const enterSortingMode = useCallback(() => {
    setIsSortingMode(true);
    fetchSortingProducts(1, true);
  }, []);

  const handleLoadMoreSorting = () => {
    if (hasMoreSorting && !isFetchingSorting) {
      fetchSortingProducts(sortingPage + 1, false);
    }
  };

  const loadMoreRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingSorting) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreSorting) {
          fetchSortingProducts(sortingPage + 1, false);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingSorting, hasMoreSorting, sortingPage]
  );

  // Exit sorting mode
  const exitSortingMode = () => {
    setIsSortingMode(false);
    setLocalProducts([]);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalProducts((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      // Update display_order to match new positions
      return reordered.map((item, idx) => ({ ...item, _displayOrder: idx }));
    });
  };

  // Handle manual order commit
  const handleOrderCommit = (id: number, newOrder: number) => {
    setLocalProducts((items) => {
      const updated = items.map((item) => (item.id === id ? { ...item, _displayOrder: newOrder } : item));
      return [...updated].sort((a, b) => (a._displayOrder ?? 0) - (b._displayOrder ?? 0));
    });

    setTimeout(() => {
      const el = document.getElementById(`sortable-row-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-blue-100/50", "dark:bg-blue-900/30");
        setTimeout(() => {
          el.classList.remove("bg-blue-100/50", "dark:bg-blue-900/30");
        }, 1500);
      }
    }, 100);
  };

  // Save order
  const handleSaveOrder = () => {
    const payload = localProducts.map((p) => ({
      id: p.id,
      display_order: p._displayOrder,
    }));
    updateOrderMutation.mutate(payload, {
      onSuccess: () => {
        setIsSortingMode(false);
        setLocalProducts([]);
      },
    });
  };

  return (
    <AdminLayout title="Quản lý sản phẩm">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Danh sách sản phẩm ({(meta as any)?.totalItems || (meta as any)?.total || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            {isSortingMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={exitSortingMode}
                  disabled={updateOrderMutation.isPending}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveOrder}
                  disabled={updateOrderMutation.isPending}
                >
                  {updateOrderMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Lưu thứ tự
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={enterSortingMode} disabled={isFetchingSorting}>
                  {isFetchingSorting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                  )}
                  Sắp xếp
                </Button>
                <Button asChild>
                  <Link to="/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters - hidden in sorting mode */}
          {!isSortingMode && (
            <div className="mb-6 flex flex-col gap-3">
              <ProductFilters
                value={filterParams}
                onFilterChange={(newFilters) => {
                  setFilterParams(newFilters);
                  setPage(1); // Reset page on filter change
                }}
              />
              <ProductActiveBadges
                filters={filterParams}
                onFilterChange={(newFilters) => {
                  setFilterParams(newFilters);
                  setPage(1);
                }}
              />
            </div>
          )}

          {/* Sorting mode banner */}
          {isSortingMode && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 px-4 py-3">
              <ArrowUpDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Chế độ sắp xếp
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Kéo thả để thay đổi thứ tự hiển thị sản phẩm, hoặc nhập số thứ tự trực tiếp. Đang hiển thị tất cả {localProducts.length} sản phẩm.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isSortingMode ? (
              /* Sorting Mode Table */
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-20">Thứ tự</TableHead>
                      <TableHead className="w-16">Hình</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={localProducts.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {localProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {isFetchingSorting ? (
                              <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : "Không có sản phẩm nào để sắp xếp."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        localProducts.map((product, index) => (
                          <SortableProductRow
                            key={product.id}
                            product={product}
                            index={index}
                            onOrderCommit={handleOrderCommit}
                          />
                        ))
                      )}

                      {hasMoreSorting && (
                        <TableRow ref={loadMoreRef}>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Đang tải thêm...</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
            ) : (
              /* Normal Mode Table */
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Hình</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-center">Thứ tự hiển thị</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Không tìm thấy sản phẩm nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product: any, index: number) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-secondary">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={getImageUrl(
                                  typeof product.images[0] === "string"
                                    ? product.images[0]
                                    : product.images[0].url,
                                )}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Image className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell width={600}>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.shortDescription}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.categories?.map((c: any) => c.name).join(", ") || "---"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium">{formatPriceHelper(product.salePrice || product.price)}</p>
                            {product.salePrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatPriceHelper(product.price)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{product.displayOrder ?? "---"}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {!!product.isFeatured && (
                              <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
                                Nổi bật
                              </Badge>
                            )}
                            {!!product.isRecommended && (
                              <Badge className="text-xs bg-purple-500 hover:bg-purple-600 text-white border-transparent">
                                Đề xuất
                              </Badge>
                            )}
                            {!product.isActive ? (
                              <Badge variant="destructive" className="text-xs">
                                Ẩn
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs border-green-500 text-green-500"
                              >
                                Hiển thị
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                          {product.createdAt
                            ? format(new Date(product.createdAt), "dd/MM/yyyy hh:mm a")
                            : "---"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/products/edit/${product.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <ConfirmDialog
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              }
                              title="Xóa sản phẩm?"
                              description={`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`}
                              onConfirm={() => handleDelete(product.id)}
                            />
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination Controls - hidden in sorting mode */}
            {!isSortingMode && meta && meta.totalPages > 1 && (
              <div className="flex justify-end p-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <span className="flex items-center text-sm">
                  Trang {page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProducts;
