"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { SectionCard } from "@/components/ui/section-card";

type ChartCardProps = {
  title: string;
  description?: string;
  option: EChartsOption;
  height?: number;
};

export function ChartCard({ title, description, option, height = 280 }: ChartCardProps) {
  return (
    <SectionCard title={title} description={description}>
      <ReactECharts option={option} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge lazyUpdate />
    </SectionCard>
  );
}
