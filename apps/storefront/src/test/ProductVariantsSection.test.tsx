// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProductVariantsSection from "../components/tiktok/products/ProductDetail/ProductVariantsSection";
import { Product, ProductVariant } from "@/types/product";

// Mock cn utility if needed, but it should work directly since it's just classnames.
const mockProduct: Product = {
  id: 117,
  name: "Máy khoan pin Hukan XC5-21V",
  slug: "may-khoan-pin-hukan-xc5-21v",
  price: 850000,
  isActive: 1,
  isFeatured: 1,
  isRecommended: 1,
  stock: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  images: [],
  videos: [],
  categories: [],
  variants: [
    {
      id: 7,
      name: "Xanh - 40",
      price: 850000,
      stock: 0, // Out of stock
      isActive: 1,
      optionValues: ["Xanh", "40"],
    },
    {
      id: 10,
      name: "Trắng - 39",
      price: 850000,
      stock: 0, // Out of stock
      isActive: 1,
      optionValues: ["Trắng", "39"],
    },
    {
      id: 9,
      name: "Trắng - 40",
      price: 850000,
      stock: 0, // Out of stock
      isActive: 1,
      optionValues: ["Trắng", "40"],
    },
    {
      id: 8,
      name: "Xanh - 39",
      price: 850000,
      stock: 0, // Out of stock
      isActive: 1,
      optionValues: ["Xanh", "39"],
    },
  ] as ProductVariant[],
  tierVariations: [
    {
      id: 2,
      name: "Màu sắc",
      tierIndex: 0,
      position: 0,
      options: [
        { id: 5, value: "Xanh", isActive: 1 },
        { id: 6, value: "Trắng", isActive: 1 },
      ],
    },
    {
      id: 3,
      name: "Size",
      tierIndex: 1,
      position: 1,
      options: [
        { id: 7, value: "40", isActive: 1 },
        { id: 8, value: "39", isActive: 1 },
      ],
    },
  ] as any[],
};

describe("ProductVariantsSection", () => {
  it("should render all variant options and keep them selectable even when out of stock", () => {
    const handleChange = vi.fn();
    render(
      <ProductVariantsSection
        product={mockProduct}
        selectedVariant={null}
        onChange={handleChange}
      />
    );

    // Get variant buttons
    const xanhBtn = screen.getByRole("button", { name: "Xanh" });
    const trangBtn = screen.getByRole("button", { name: "Trắng" });
    const size40Btn = screen.getByRole("button", { name: "40" });
    const size39Btn = screen.getByRole("button", { name: "39" });

    // Verify all options are visible and NOT disabled (even with stock: 0)
    expect(xanhBtn).toBeDefined();
    expect(xanhBtn.hasAttribute("disabled")).toBe(false);
    expect(trangBtn.hasAttribute("disabled")).toBe(false);
    expect(size40Btn.hasAttribute("disabled")).toBe(false);
    expect(size39Btn.hasAttribute("disabled")).toBe(false);

    // Verify out-of-stock styling is applied (dashed border / low opacity style classes)
    expect(xanhBtn.className).toContain("border-dashed");
    expect(size40Btn.className).toContain("border-dashed");

    // Click "Xanh" and "40"
    fireEvent.click(xanhBtn);
    fireEvent.click(size40Btn);

    // It should select the matching variant ("Xanh - 40", which is ID 7)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, name: "Xanh - 40" })
    );
  });

  it("should disable options that form invalid/inactive combinations", () => {
    const handleChange = vi.fn();
    // Create a product with an invalid combination (e.g. Xanh - 39 is inactive or missing)
    const productWithInvalid: Product = {
      ...mockProduct,
      variants: [
        {
          id: 7,
          name: "Xanh - 40",
          price: 850000,
          stock: 10,
          isActive: 1,
          optionValues: ["Xanh", "40"],
        },
        {
          id: 9,
          name: "Trắng - 40",
          price: 850000,
          stock: 10,
          isActive: 1,
          optionValues: ["Trắng", "40"],
        },
        // "Xanh - 39" is missing or inactive
      ] as ProductVariant[],
    };

    render(
      <ProductVariantsSection
        product={productWithInvalid}
        selectedVariant={null}
        onChange={handleChange}
      />
    );

    const xanhBtn = screen.getByRole("button", { name: "Xanh" });
    const size39Btn = screen.getByRole("button", { name: "39" });

    // Select "Xanh" first
    fireEvent.click(xanhBtn);

    // Since "Xanh - 39" does not exist in the variants, the "39" option should now be disabled for selection
    expect(size39Btn.hasAttribute("disabled")).toBe(true);
  });
});
