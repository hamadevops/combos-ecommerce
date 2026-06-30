"use client";

import React from "react";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import Policy from "@/components/muabantaikhoan/features/info/Policy";

export default function PolicyPage() {
  return (
    <PageLayout headerProps={{ title: "Chính sách mua hàng", showBack: true, showSearch: false }}>
      <div className="px-4 py-2 bg-background">
        <Policy />
      </div>
    </PageLayout>
  );
}
