"use client";

import React from "react";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import AboutUs from "@/components/muabantaikhoan/features/info/AboutUs";

export default function AboutUsPage() {
  return (
    <PageLayout headerProps={{ title: "Giới thiệu", showBack: true, showSearch: false }}>
      <div className="px-4 py-2 bg-background">
        <AboutUs />
      </div>
    </PageLayout>
  );
}
