"use client";

import { useCallback, useRef } from "react";
import { CategoryManagementScreen } from "@/components/categories/category-management-screen";
import { AdminWorkerManagementMobileLayout } from "../admin-worker-management-mobile-layout";

export function AdminWorkerCategoriesMobile() {
  const refreshRef = useRef<(() => Promise<void>) | null>(null);

  const handleRegisterRefresh = useCallback((refetch: () => Promise<void>) => {
    refreshRef.current = refetch;
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshRef.current?.();
  }, []);

  return (
    <AdminWorkerManagementMobileLayout
      title="Категории и подкатегории"
      onRefresh={handleRefresh}
    >
      <CategoryManagementScreen
        variant="admin-worker"
        onRegisterRefresh={handleRegisterRefresh}
      />
    </AdminWorkerManagementMobileLayout>
  );
}
