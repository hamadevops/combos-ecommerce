"use client";

import React from "react";
import PageLayout from "@/components/tiktok/layout/PageLayout";
import Contact from "@/components/muabantaikhoan/features/info/Contact";

export default function ContactPage() {
  return (
    <PageLayout headerProps={{ title: "Liên hệ", showBack: true, showSearch: false }}>
      <div className="px-4 py-2 bg-background">
        <Contact />
      </div>
    </PageLayout>
  );
}
