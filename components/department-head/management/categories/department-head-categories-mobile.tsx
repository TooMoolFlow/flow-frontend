"use client";

import { useCallback, useRef } from "react";
import { CategoryManagementScreen } from "@/components/categories/category-management-screen";
import { DepartmentHeadManagementMobileLayout } from "../department-head-management-mobile-layout";

export function DepartmentHeadCategoriesMobile() {
  const refreshRef = useRef<(() => Promise<void>) | null>(null);

  const handleRegisterRefresh = useCallback((refetch: () => Promise<void>) => {
    refreshRef.current = refetch;
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshRef.current?.();
  }, []);

  return (
    <DepartmentHeadManagementMobileLayout
      title="Категории и подкатегории"
      onRefresh={handleRefresh}
    >
      <CategoryManagementScreen
        variant="department-head"
        onRegisterRefresh={handleRegisterRefresh}
      />
    </DepartmentHeadManagementMobileLayout>
  );
}
