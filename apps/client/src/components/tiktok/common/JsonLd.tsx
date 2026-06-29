import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_TIMESTAMP_URL;

interface JsonLdProps {
  product?: Product;
  breadcrumbs?: Array<{ name: string; item: string }>;
  organization?: {
    name: string;
    description?: string;
    logo?: string;
    url?: string;
    email?: string;
    phone?: string;
    address?: string;
    socials?: string[];
  };
}

export default function JsonLd({ product, breadcrumbs, organization }: JsonLdProps) {
  const schemas: Record<string, any>[] = [];

  if (product) {
    const productUrl = `${BASE_URL}/${product.slug}`;
    const productImages = product.images?.map((img) => getImageUrl(img.url)).filter(Boolean) || [];
    const brandName = organization?.name || "Điện máy chính hãng Việt Nam";

    const productSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.seoDescription || product.shortDescription || product.description,
      image: productImages,
      sku: product.slug,
      brand: {
        "@type": "Brand",
        name: brandName,
      },
      url: productUrl,
      category: product.categories?.map((c) => c.name).join(", ") || undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "VND",
        price: product.salePrice || product.price,
        itemCondition: "https://schema.org/NewCondition",
        availability:
          product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: productUrl,
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "VN",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: "VND",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "VN",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 1,
              unitCode: "d",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 5,
              unitCode: "d",
            },
          },
        },
        ...(product.salePrice && product.price > product.salePrice
          ? {
            priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          }
          : {}),
      },
    };

    // Add aggregate rating if available
    if (product.rating && product.reviewCount) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      };
    }

    schemas.push(productSchema);
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item.startsWith("http") ? item.item : `${BASE_URL}${item.item}`,
      })),
    });
  }

  if (organization) {
    const orgSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: organization.name,
      url: organization.url || BASE_URL,
    };
    if (organization.description) orgSchema.description = organization.description;
    if (organization.logo) orgSchema.logo = getImageUrl(organization.logo);
    if (organization.email) orgSchema.email = organization.email;
    if (organization.phone) orgSchema.telephone = organization.phone;
    if (organization.address) {
      orgSchema.address = {
        "@type": "PostalAddress",
        streetAddress: organization.address,
      };
    }
    if (organization.socials?.length) {
      orgSchema.sameAs = organization.socials;
    }
    schemas.push(orgSchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
