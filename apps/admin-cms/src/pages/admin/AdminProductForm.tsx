import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductGeneralTab } from "@/components/admin/products/ProductGeneralTab";
import { ProductSeoTab } from "@/components/admin/products/ProductSeoTab";
import { ProductVariantsTab } from "@/components/admin/products/ProductVariantsTab";
import { ProductReviewsTab } from "@/components/admin/products/ProductReviewsTab";
import { ProductSpecificationsTab } from "@/components/admin/products/ProductSpecificationsTab";
import { ProductVideoTab } from "@/components/admin/products/ProductVideoTab";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useCreateProduct,
  useUpdateProduct,
  useProduct,
  useUpdateProductImages,
  useUpdateProductVariants,
  useUpdateProductSeo,
  useDeleteProductImage,
} from "@/hooks/useProducts";
import { productApi } from "@/api/product";
import { useCategories } from "@/hooks/useCategories";
import { CreateProductDto, ProductSpecification } from "@/types/product";
import { Loader2, Save } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().required("Tên sản phẩm là bắt buộc"),
  slug: yup.string().optional(),
  category_ids: yup.array().of(yup.number().required()).default([]),
  sku: yup.string().optional(),
  shortDescription: yup.string().optional(),
  description: yup.string().optional(),
  price: yup.number().typeError("Giá bán phải là số").required("Giá bán là bắt buộc"),
  salePrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  costPrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  stock: yup.number().typeError("Tồn kho phải là số").default(0),
  images: yup.array().of(yup.mixed<string | File>()).default([]),
  isNew: yup.boolean().default(false),
  isFeatured: yup.boolean().default(false),
  isRecommended: yup.boolean().default(false),
  isActive: yup.boolean().default(false),
  product_type: yup.string().default("purchase"),
  affiliate_link: yup
    .string()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .when("product_type", {
      is: "affiliate",
      then: (schema) => schema.required("Đường dẫn affiliate là bắt buộc khi chọn loại sản phẩm Affiliate").url("Đường dẫn affiliate phải là một URL hợp lệ"),
      otherwise: (schema) => schema.optional(),
    }),
  // SEO
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
  seoKeywords: yup.string().optional(),
  canonicalUrl: yup.string().optional(),
  ogImage: yup.mixed<string | File>().optional(),
  // Variants
  variants: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.number().optional().nullable(),
        name: yup.string().optional().nullable(),
        sku: yup.string().optional().nullable(),
        price: yup.number().optional().nullable(),
        salePrice: yup.number().nullable().optional(),
        costPrice: yup.number().nullable().optional(),
        stock: yup.number().optional().nullable(),
        isActive: yup.boolean().optional(),
        attributes: yup.array().optional().nullable(),
        optionValues: yup.array().of(yup.string()).optional(),
      }),
    )
    .default([]),
  tierVariations: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.number().optional().nullable(),
        name: yup.string().required(),
        options: yup
          .array()
          .of(
            yup.object().shape({
              id: yup.number().optional().nullable(),
              value: yup.string().required(),
            }),
          )
          .required(),
      }),
    )
    .optional(),
  // Specifications (key-value pairs with order)
  specifications: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string().required(),
        value: yup.string().required(),
        order: yup.number().required(),
      }),
    )
    .default([]),
  displayOrder: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .default(0),
});

type ProductFormData = yup.InferType<typeof schema>;

import { useQueryClient } from "@tanstack/react-query";

const AdminProductForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const productId = id ? Number(id) : 0;
  const [activeTab, setActiveTab] = useState("general");

  // Hooks
  const { data: productResponse, isLoading: isLoadingProduct } = useProduct(productId);
  const { data: categoriesResponse } = useCategories();

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(productId);
  const updateImagesMutation = useUpdateProductImages(productId);
  const updateVariantsMutation = useUpdateProductVariants(productId);
  const updateSeoMutation = useUpdateProductSeo(productId);
  const deleteImageMutation = useDeleteProductImage(productId);

  // Store mapping of URL to Image ID to track deletions
  const imageIdMap = useRef<Map<string, number>>(new Map());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingProduct = productResponse as any;
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : categoriesResponse?.items || [];

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: "",
      slug: "",
      category_ids: [],
      shortDescription: "",
      description: "",
      price: 0,
      salePrice: 0,
      costPrice: 0,
      stock: 0,
      sku: "",
      images: [],
      isNew: false,
      isFeatured: false,
      isRecommended: false,
      isActive: false,
      product_type: "purchase",
      affiliate_link: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      canonicalUrl: "",
      ogImage: "",
      variants: [],
      tierVariations: [],
      specifications: [],
      displayOrder: 0,
    },
  });

  // Populate form data when editing
  useEffect(() => {
    if (isEditing && existingProduct) {
      // Map images and store IDs
      const imageUrls =
        existingProduct.images?.map((img) => {
          const url = getImageUrl(img.url);
          imageIdMap.current.set(url, img.id);
          return url;
        }) || [];

      reset({
        name: existingProduct.name,
        slug: existingProduct.slug,
        category_ids: existingProduct.categories?.map((c) => c.id) || [],
        sku: existingProduct.sku || "",
        shortDescription: existingProduct.shortDescription || "",
        description: existingProduct.description || "",
        price: Number(existingProduct.price),
        salePrice: existingProduct.salePrice ? Number(existingProduct.salePrice) : null,
        costPrice: existingProduct.costPrice ? Number(existingProduct.costPrice) : null,
        stock: existingProduct.stock,
        images: existingProduct.images?.map((img) => getImageUrl(img.url)) || [],
        variants:
          existingProduct.variants?.map((v) => ({
            ...v,
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : null,
            costPrice: v.costPrice ? Number(v.costPrice) : null,
            stock: Number(v.stock),
            isActive: Boolean(v.isActive),
            attributes: v.attributes || [],
          })) || [],
        isNew: false,
        isFeatured: Boolean(existingProduct.isFeatured),
        isRecommended: Boolean(existingProduct.isRecommended),
        isActive: Boolean(existingProduct.isActive),
        product_type: existingProduct.productType || existingProduct.product_type || "purchase",
        affiliate_link: existingProduct.affiliateLink || existingProduct.affiliate_link || "",
        seoTitle: existingProduct.seoTitle || "",
        seoDescription: existingProduct.seoDescription || "",
        seoKeywords: existingProduct.seoKeywords || "",
        canonicalUrl: existingProduct.canonicalUrl || "",
        ogImage: existingProduct.ogImage ? getImageUrl(existingProduct.ogImage) : "",
        specifications: (() => {
          try {
            if (typeof existingProduct.specifications === 'string') {
              return JSON.parse(existingProduct.specifications);
            }
            return existingProduct.specifications || [];
          } catch (e) {
            console.error("Failed to parse specifications", e);
            return [];
          }
        })(),
        displayOrder: existingProduct.displayOrder ?? 0,
        tierVariations: existingProduct.tierVariations || [],
      });
    }
  }, [isEditing, existingProduct, reset]);

  const handleGeneralSubmit = (data: ProductFormData) => {
    const payload: CreateProductDto = {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      short_description: data.shortDescription,
      price: data.price,
      sale_price: data.salePrice ?? undefined,
      cost_price: data.costPrice ?? undefined,
      stock: data.stock,
      is_featured: data.isFeatured,
      is_recommended: data.isRecommended,
      isActive: data.isActive ? 1 : 0,
      category_ids: data.category_ids,
      files: null,
      specifications: data.specifications as ProductSpecification[],
      display_order: data.displayOrder ?? undefined,
      product_type: data.product_type,
      affiliate_link: data.affiliate_link || null,
    };

    if (isEditing) {
      updateProductMutation.mutate(payload);
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: (response) => {
          const newId = response.data.id;
          navigate(`/products/edit/${newId}`);
          setActiveTab("media"); // Move to next step
        },
      });
    }
  };

  const handleImagesSubmit = async () => {
    const currentImages = getValues("images") || [];
    const files = currentImages.filter((i): i is File => i instanceof File);

    // Handle Deletions
    const currentUrls = currentImages.filter((i): i is string => typeof i === "string");
    const originalUrls = Array.from(imageIdMap.current.keys());

    const deletedUrls = originalUrls.filter((url) => !currentUrls.includes(url));

    let hasChanges = false;

    try {
      // 1. Process Deletions
      if (deletedUrls.length > 0) {
        hasChanges = true;
        for (const url of deletedUrls) {
          const id = imageIdMap.current.get(url);
          if (id) {
            try {
              await deleteImageMutation.mutateAsync(id);
            } catch (e) {
              console.error("Failed to delete image", id, e);
            }
          }
        }
      }

      // 2. Process Uploads
      let updatedProduct = null;
      if (files.length > 0) {
        hasChanges = true;
        const response = await updateImagesMutation.mutateAsync(files);
        updatedProduct = response.data;
      }

      // 3. Process Reordering
      const keptIds = currentUrls
        .map((url) => imageIdMap.current.get(url))
        .filter((id): id is number => !!id);

      let newImageIds: number[] = [];
      if (updatedProduct) {
        const allOriginalIds = Array.from(imageIdMap.current.values());
        const newImages = updatedProduct.images.filter(
          (img) => !allOriginalIds.includes(img.id),
        );
        newImages.sort((a, b) => a.id - b.id);
        newImageIds = newImages.map((img) => img.id);
      }

      const finalOrderIds: number[] = [];
      let newImgIndex = 0;

      for (const item of currentImages) {
        if (typeof item === "string") {
          const id = imageIdMap.current.get(item);
          if (id) finalOrderIds.push(id);
        } else if (item instanceof File) {
          if (newImgIndex < newImageIds.length) {
            finalOrderIds.push(newImageIds[newImgIndex]);
            newImgIndex++;
          }
        }
      }

      if (finalOrderIds.length > 0) {
        // await apiClient.put(`/products/${productId}/images/order`, { image_ids: finalOrderIds });
        await productApi.reorderImages(productId, finalOrderIds);
        hasChanges = true;
      }

      if (hasChanges) {
        toast.success("Đã cập nhật hình ảnh thành công");
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
      } else {
        if (currentImages.length > 0 && finalOrderIds.length > 0) {
          // Check if reorder needed even if no file changes (just drag drop)
          // Since we didn't track "isDirty" for order specifically easily without ref,
          // we optimistically reorder above. If no changes and no reorder call needed?
          // We called reorder above if finalOrderIds > 0.
          // So we should toast success if reorder happened.
          // But reorder call doesn't return "changed" boolean.
          // Assuming if we reached here, we did something.
          // If purely reorder (no delete, no upload), hasChanges is false.
          // We should set hasChanges = true if reorder API called.
          toast.success("Đã cập nhật thứ tự hình ảnh");
          queryClient.invalidateQueries({ queryKey: ["product", productId] });
        } else {
          toast.info("Không có thay đổi nào để lưu");
        }
      }
    } catch (error) {
      console.error("Error saving images", error);
    }
  };

  const handleVariantsSubmit = async () => {
    const variants = getValues("variants");
    const tierVariations = getValues("tierVariations");

    if (tierVariations && tierVariations.length > 0) {
      try {
        await productApi.setTierVariations(productId, {
          tierVariations: tierVariations.map((t) => ({
            id: t.id ?? undefined,
            name: t.name || "",
            options: t.options?.map((o) => ({
              id: o.id ?? undefined,
              value: o.value || "",
            })) || [],
          })),
          autoGenerateVariants: false,
        });
      } catch (error) {
        console.error("Failed to save tier variations", error);
      }
    }

    // 2. Save variant details in place
    const variantsPayload =
      variants?.map((v) => ({
        id: v.id,
        sku: v.sku ?? null,
        price: Number(v.price),
        sale_price: v.salePrice ? Number(v.salePrice) : undefined,
        cost_price: v.costPrice ? Number(v.costPrice) : undefined,
        stock: Number(v.stock),
        isActive: v.isActive ? 1 : 0,
        optionValues: v.optionValues || [],
      })) || [];

    updateVariantsMutation.mutate(variantsPayload);
  };

  const handleSeoSubmit = () => {
    const data = getValues();
    const seoPayload = {
      title: data.seoTitle,
      description: data.seoDescription,
      keywords: data.seoKeywords, // Form has 'seoKeywords'
      canonicalUrl: data.canonicalUrl,
      ogImage: data.ogImage,
    };
    updateSeoMutation.mutate(seoPayload);
  };

  if (isEditing && isLoadingProduct) {
    return (
      <AdminLayout title="Đang tải...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold sr-only">
            {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <div className="space-x-2 ml-auto">
            <Button variant="outline" type="button" onClick={() => navigate("/products")}>
              Trở về
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 lg:w-[1050px] mb-4">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="specifications" disabled={!isEditing}>
              Thông số
            </TabsTrigger>
            <TabsTrigger value="media" disabled={!isEditing}>
              Hình ảnh
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!isEditing}>
              Video
            </TabsTrigger>
            <TabsTrigger value="reviews" disabled={!isEditing}>
              Đánh giá
            </TabsTrigger>
            <TabsTrigger value="variants" disabled={!isEditing}>
              Biến thể
            </TabsTrigger>
            <TabsTrigger value="seo" disabled={!isEditing}>
              SEO
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {activeTab === "general" && "Thông tin cơ bản"}
                {activeTab === "media" && "Quản lý hình ảnh"}
                {activeTab === "video" && "Quản lý video sản phẩm"}
                {activeTab === "reviews" && "Quản lý đánh giá"}
                {activeTab === "variants" && "Quản lý biến thể"}
                {activeTab === "specifications" && "Thông số kỹ thuật"}
                {activeTab === "seo" && "Tối ưu hóa tìm kiếm (SEO)"}
              </CardTitle>
              {/* Save Buttons based on Tab */}
              {activeTab === "general" && (
                <Button
                  onClick={handleSubmit(handleGeneralSubmit, (e) => {
                    console.error("Form Errors:", e);
                    const errorFields = Object.keys(e).join(", ");
                    const firstErrorMsg = Object.values(e)[0]?.message as string;
                    toast.error(firstErrorMsg ? `Lỗi: ${firstErrorMsg}` : `Vui lòng kiểm tra các trường: ${errorFields}`);
                  })}
                  disabled={
                    isSubmitting ||
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                  }
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Cập nhật thông tin" : "Tạo sản phẩm"}
                </Button>
              )}
              {activeTab === "media" && isEditing && (
                <Button onClick={handleImagesSubmit} disabled={updateImagesMutation.isPending}>
                  {updateImagesMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Lưu hình ảnh
                </Button>
              )}

              {activeTab === "variants" && isEditing && (
                <Button onClick={handleVariantsSubmit} disabled={updateVariantsMutation.isPending}>
                  {updateVariantsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Lưu biến thể
                </Button>
              )}

              {activeTab === "seo" && isEditing && (
                <Button onClick={handleSeoSubmit} disabled={updateSeoMutation.isPending}>
                  {updateSeoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Lưu SEO
                </Button>
              )}
            </CardHeader>
            <CardContent className="mt-4">
              <TabsContent value="general" className="mt-0">
                <ProductGeneralTab
                  control={control}
                  categories={categories}
                  setValue={setValue}
                  getValues={getValues}
                  isEditing={isEditing}
                />
              </TabsContent>

              <TabsContent value="media" className="mt-0 space-y-4">
                <div>
                  <Label className="mb-2 block">Thư viện ảnh sản phẩm</Label>
                  <Controller
                    name="images"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value as (string | File)[]}
                        onChange={(val) => field.onChange(val)}
                        multiple={true}
                        maxFiles={10}
                      />
                    )}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Kéo thả ảnh vào đây hoặc click để chọn. Nhấn Lưu hình ảnh để tải lên các ảnh
                    mới.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="video" className="mt-0">
                <ProductVideoTab productId={productId} videos={existingProduct?.videos} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <ProductReviewsTab productId={productId} control={control} />
              </TabsContent>

              <TabsContent value="specifications" className="mt-0">
                <ProductSpecificationsTab
                  control={control}
                  setValue={setValue}
                  getValues={getValues}
                />
              </TabsContent>

              <TabsContent value="variants" className="mt-0">
                <ProductVariantsTab
                  productId={productId}
                  control={control}
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  existingProduct={existingProduct}
                />
              </TabsContent>

              <TabsContent value="seo" className="mt-0">
                <ProductSeoTab control={control} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
