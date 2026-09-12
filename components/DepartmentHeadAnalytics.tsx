"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsListScrollArea, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Star, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/api";
import { useIsDesktop } from "@/hooks/use-media-query";
import { MeetingRoomStatistics } from "@/components/meeting-rooms/MeetingRoomStatistics";
import { useStatsStore } from "@/stores/statsStore";
import { token } from "@/lib/tokens";

interface SLAStats {
  byDate: Array<{
    date: string;
    avgHours: string;
    totalCompleted: number;
  }>;
  byCategory: Array<{
    categoryId: number;
    avgHours: string;
    totalCompleted: number;
  }>;
  byOffice?: Array<{
    officeId: number;
    avgHours: string;
    totalCompleted: number;
  }>;
}

interface RatingStats {
  byOffice?: Array<{
    officeId: number;
    avgRating: string;
    totalRatings: number;
    lowRatings: number;
  }>;
  byCategory?: Array<{
    categoryId: number;
    avgRating: string;
    totalRatings: number;
    lowRatings: number;
  }>;
  byExecutor?: Array<{
    executorId: number;
    avgRating: string;
    totalRatings: number;
    lowRatings: number;
  }>;
  byDate?: Array<{
    date: string;
    avgRating: string;
    totalRatings: number;
    lowRatings: number;
  }>;
}

interface DetailedStats {
  byCategory?: Array<{
    categoryId: number;
    totalRequests: number;
    completedRequests: number;
    newRequests: number;
    inWorkRequests: number;
  }>;
  byDirection?: Array<{
    directionId: number;
    totalRequests: number;
    completedRequests: number;
    newRequests: number;
    inWorkRequests: number;
  }>;
  byExecutor?: Array<{
    executorId: number;
    totalAssigned: number;
    completedRequests: number;
    inWorkRequests: number;
  }>;
}

const COLORS = [token.brand, token.brand600, token.marine500, token.surface3, token.surface2];

export default function DepartmentHeadAnalytics() {
  const [slaStats, setSlaStats] = useState<SLAStats | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sla");
  const [period, setPeriod] = useState("month");
  const [categories, setCategories] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [executors, setExecutors] = useState<any[]>([]);
  const { depHeadStats } = useStatsStore();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endpoints = [
        api.get("/analytics/stats/department-head/sla").catch(() => ({ data: null })),
        api.get("/analytics/stats/department-head/ratings").catch(() => ({ data: null })),
        api.get("/analytics/stats/department-head/detailed").catch(() => ({ data: null })),
        api.get("/service-categories").catch(() => ({ data: [] })),
        api.get("/offices").catch(() => ({ data: [] })),
        api.get("/executors/all").catch(() => ({ data: [] })),
      ];

      const [slaRes, ratingRes, detailedRes, categoriesRes, officesRes, executorsRes] =
        await Promise.all(endpoints);

      if (slaRes.data) setSlaStats(slaRes.data);
      if (ratingRes.data) setRatingStats(ratingRes.data);
      if (detailedRes.data) setDetailedStats(detailedRes.data);
      setCategories(categoriesRes.data || []);
      setOffices(officesRes.data || []);
      setExecutors(executorsRes.data || []);
    } catch (error) {
      console.error("Ошибка при загрузке аналитики:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCompleted =
    (slaStats?.byDate?.reduce((sum, item) => sum + item.totalCompleted, 0)) ??
    depHeadStats?.statusCounts?.completed ??
    0;
  const categoriesCount =
    (slaStats?.byCategory?.length ?? 0) ||
    (categories.length > 0 ? categories.length : 0) ||
    (depHeadStats?.requestTypeSummary
      ? [depHeadStats.requestTypeSummary.normal, depHeadStats.requestTypeSummary.urgent, depHeadStats.requestTypeSummary.planned].filter((n) => (n ?? 0) > 0).length
      : 0) ||
    0;

  const getCategoryName = (categoryId: number) => {
    if (!categories.length) return `Категория ${categoryId}`;
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `Категория ${categoryId}`;
  };

  const getOfficeName = (officeId: number) => {
    if (!offices.length) return `Офис ${officeId}`;
    const office = offices.find((off) => off.id === officeId);
    return office ? office.name : `Офис ${officeId}`;
  };

  const getExecutorName = (executorId: number) => {
    if (!executors.length) return `Исполнитель ${executorId}`;
    const executor = executors.find((exec) => exec.id === executorId);
    return executor
      ? executor.user?.full_name || `Исполнитель ${executorId}`
      : `Исполнитель ${executorId}`;
  };

  const slaChartData = slaStats?.byDate || [];
  const isDataReady = categories.length > 0 && offices.length > 0 && executors.length > 0;

  const StatCard = ({
    title,
    value,
    icon,
    iconBg,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
  }) => (
    <div
      className="rounded-2xl p-4 border border-hairline-strong"
      style={{ background: "rgba(255,255,255,0.12)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`}
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <div className="text-white">{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/80 truncate">{title}</p>
          <p className="text-xl font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="text-white/80">Загрузка аналитики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger
            className="w-[140px] border-white/30 text-white"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <SelectValue placeholder="Период" />
          </SelectTrigger>
          <SelectContent className="bg-surface-2 border-hairline">
            <SelectItem value="week" className="text-white">
              Неделя
            </SelectItem>
            <SelectItem value="month" className="text-white">
              Месяц
            </SelectItem>
            <SelectItem value="year" className="text-white">
              Год
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full mb-3 min-w-0">
          <TabsListScrollArea>
            <TabsList
              className="flex flex-nowrap flex-shrink-0 gap-1 p-1 rounded-xl min-w-0 [&>button]:flex-shrink-0 [&>button]:whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <TabsTrigger
                value="sla"
                className="rounded-lg text-sm data-[state=active]:bg-white/25 data-[state=active]:text-white data-[state=inactive]:text-white/70"
              >
                SLA
              </TabsTrigger>
              <TabsTrigger
                value="ratings"
                className="rounded-lg text-sm data-[state=active]:bg-white/25 data-[state=active]:text-white data-[state=inactive]:text-white/70"
              >
                Оценки
              </TabsTrigger>
              <TabsTrigger
                value="detailed"
                className="rounded-lg text-sm data-[state=active]:bg-white/25 data-[state=active]:text-white data-[state=inactive]:text-white/70"
              >
                Детальная статистика
              </TabsTrigger>
            </TabsList>
          </TabsListScrollArea>
        </div>

        <TabsContent value="sla" className="space-y-6 mt-4">
          <div className={`grid gap-4 ${isDesktop ? "grid-cols-2" : "grid-cols-1"}`}>
            <StatCard
              title="Всего завершено"
              value={totalCompleted}
              icon={<BarChart3 className="w-4 h-4 text-marine-500" />}
              iconBg="bg-marine-500/30"
            />
            <StatCard
              title="Категорий"
              value={categoriesCount}
              icon={<AlertTriangle className="w-4 h-4 text-brand" />}
              iconBg="bg-brand/30"
            />
          </div>

          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <div className="mb-3">
              <div className="text-base font-semibold text-white">Динамика SLA по времени</div>
              <div className="text-sm text-white/70">Среднее время выполнения заявок по дням</div>
            </div>
            <div className={isDesktop ? "h-64" : "h-48"}>
              {slaChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slaChartData}>
                    <defs>
                      <linearGradient id="slaGradientDep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={token.brand} stopOpacity={1} />
                        <stop offset="100%" stopColor={token.brand600} stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="date" stroke={token.contentTertiary} tick={{ fill: token.hairline }} />
                    <YAxis stroke={token.contentTertiary} tick={{ fill: token.hairline }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: token.surface2,
                        border: `1px solid ${token.hairline}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgHours"
                      stroke="url(#slaGradientDep)"
                      strokeWidth={2}
                      dot={{ r: 4, stroke: token.brand, strokeWidth: 1.5, fill: token.surface1 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-white/60 text-sm">
                  Нет данных для графика
                </div>
              )}
            </div>
          </div>

          {(slaStats?.byCategory?.length ?? 0) > 0 && (
            <div
              className="rounded-2xl p-4 sm:p-6"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="mb-3">
                <div className="text-base font-semibold text-white">SLA по категориям</div>
                <div className="text-sm text-white/70">Среднее время выполнения по категориям заявок</div>
              </div>
              <div className={isDesktop ? "h-64" : "h-48"}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      slaStats?.byCategory?.map((item) => ({
                        ...item,
                        categoryName: getCategoryName(item.categoryId),
                      })) || []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="categoryName" stroke={token.contentTertiary} tick={{ fill: token.hairline }} />
                    <YAxis stroke={token.contentTertiary} tick={{ fill: token.hairline }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: token.surface2,
                        border: `1px solid ${token.hairline}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="avgHours" fill={token.brand} name="Средние часы" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6 mt-4">
          <div className={`grid gap-4 ${isDesktop ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
            <StatCard
              title="Средняя оценка"
              value={
                ratingStats?.byDate?.length
                  ? ratingStats.byDate[ratingStats.byDate.length - 1]?.avgRating || "0"
                  : "0"
              }
              icon={<Star className="w-4 h-4 text-brand-600" />}
              iconBg="bg-brand-600/30"
            />
            <StatCard
              title="Всего оценок"
              value={
                (ratingStats?.byDate ?? []).reduce((sum, item) => sum + item.totalRatings, 0) || 0
              }
              icon={<BarChart3 className="w-4 h-4 text-marine-500" />}
              iconBg="bg-marine-500/30"
            />
            <StatCard
              title="Низкие оценки (1-2)"
              value={
                (ratingStats?.byDate ?? []).reduce((sum, item) => sum + item.lowRatings, 0) || 0
              }
              icon={<AlertTriangle className="w-4 h-4 text-brand" />}
              iconBg="bg-brand/30"
            />
            <StatCard
              title="Офисов"
              value={ratingStats?.byOffice?.length || 0}
              icon={<BarChart3 className="w-4 h-4 text-marine-500" />}
              iconBg="bg-marine-500/30"
            />
          </div>

          {(ratingStats?.byDate?.length ?? 0) > 0 && (
            <div
              className="rounded-2xl p-4 sm:p-6"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="mb-3">
                <div className="text-base font-semibold text-white">Динамика оценок</div>
                <div className="text-sm text-white/70">Средние оценки по времени</div>
              </div>
              <div className={isDesktop ? "h-64" : "h-48"}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingStats?.byDate || []}>
                    <defs>
                      <linearGradient id="ratingGradientDep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={token.brand} stopOpacity={1} />
                        <stop offset="100%" stopColor={token.brand600} stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="date" stroke={token.contentTertiary} tick={{ fill: token.hairline }} />
                    <YAxis stroke={token.contentTertiary} tick={{ fill: token.hairline }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: token.surface2,
                        border: `1px solid ${token.hairline}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgRating"
                      stroke="url(#ratingGradientDep)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {(ratingStats?.byCategory ?? []).map((item) => (
            <div
              key={item.categoryId}
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <span className="font-medium text-white">
                {isDataReady ? getCategoryName(item.categoryId) : `Категория ${item.categoryId}`}
              </span>
              <Badge
                variant="outline"
                className="text-white border-white/30"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {item.avgRating}
              </Badge>
              <div className="text-sm text-white/70">
                Всего: {item.totalRatings}, низких: {item.lowRatings}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6 mt-4">
          <div className={`grid gap-4 ${isDesktop ? "grid-cols-3" : "grid-cols-1"}`}>
            <StatCard
              title="Категорий"
              value={detailedStats?.byCategory?.length || 0}
              icon={<BarChart3 className="w-4 h-4 text-marine-500" />}
              iconBg="bg-marine-500/30"
            />
            <StatCard
              title="Направлений"
              value={detailedStats?.byDirection?.length || 0}
              icon={<BarChart3 className="w-4 h-4 text-brand" />}
              iconBg="bg-brand/30"
            />
            <StatCard
              title="Исполнителей"
              value={detailedStats?.byExecutor?.length || 0}
              icon={<BarChart3 className="w-4 h-4 text-brand-600" />}
              iconBg="bg-brand-600/30"
            />
          </div>

          {(detailedStats?.byCategory?.length ?? 0) > 0 && (
            <div
              className="rounded-2xl p-4 sm:p-6"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="mb-3">
                <div className="text-base font-semibold text-white">Статистика по категориям</div>
                <div className="text-sm text-white/70">Распределение заявок</div>
              </div>
              <div className={isDesktop ? "h-64" : "h-48"}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        detailedStats?.byCategory?.map((item) => ({
                          ...item,
                          categoryName: isDataReady
                            ? getCategoryName(item.categoryId)
                            : `Категория ${item.categoryId}`,
                        })) || []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoryName, totalRequests }) =>
                        `${categoryName}: ${totalRequests}`
                      }
                      outerRadius={isDesktop ? 80 : 60}
                      fill={token.chart4}
                      dataKey="totalRequests"
                    >
                      {(detailedStats?.byCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: token.surface2,
                        border: `1px solid ${token.hairline}`,
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {(detailedStats?.byCategory ?? []).map((item) => (
            <div
              key={item.categoryId}
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">
                  {isDataReady ? getCategoryName(item.categoryId) : `Категория ${item.categoryId}`}
                </span>
                <Badge
                  variant="outline"
                  className="text-white border-white/30"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  {item.totalRequests}
                </Badge>
              </div>
              <div className="text-sm text-white/70 space-y-1">
                <div>Завершено: {item.completedRequests}</div>
                <div>Новые: {item.newRequests}</div>
                <div>В работе: {item.inWorkRequests}</div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <MeetingRoomStatistics variant="dark" />
      </div>
    </div>
  );
}
