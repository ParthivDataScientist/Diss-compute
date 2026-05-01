"use client";

import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { SectionCard } from "@/components/ui/section-card";

type ChartCardProps = {
  title: string;
  description?: string;
  option: EChartsOption;
  height?: number;
};

const darkColorMap: Record<string, string> = {
  "#0f172a": "#f8fafc",
  "#334155": "#cbd5e1",
  "#475569": "#cbd5e1",
  "#64748b": "#94a3b8",
  "#cbd5e1": "#475569",
  "#e2e8f0": "#334155",
  "#f1f5f9": "#253247",
  "#ffffff": "#0f172a"
};

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains("dark"));

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

function mapChartColors(value: unknown): unknown {
  if (typeof value === "string") {
    return darkColorMap[value.toLowerCase()] ?? value;
  }

  if (Array.isArray(value)) {
    return value.map(mapChartColors);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, mapChartColors(entry)])
    );
  }

  return value;
}

function getThemeAwareOption(option: EChartsOption, isDark: boolean): EChartsOption {
  if (!isDark) return option;

  const mappedOption = mapChartColors(option) as EChartsOption;

  return {
    ...mappedOption,
    backgroundColor: "transparent",
    textStyle: {
      ...mappedOption.textStyle,
      color: "#e5e7eb"
    },
    tooltip: {
      ...mappedOption.tooltip,
      backgroundColor: "#0f172a",
      borderColor: "#253247",
      textStyle: {
        color: "#e5e7eb"
      }
    }
  };
}

export function ChartCard({ title, description, option, height = 280 }: ChartCardProps) {
  const isDark = useIsDarkTheme();
  const themeAwareOption = useMemo(() => getThemeAwareOption(option, isDark), [isDark, option]);

  return (
    <SectionCard title={title} description={description}>
      <ReactECharts option={themeAwareOption} style={{ height, width: "100%" }} opts={{ renderer: "svg" }} notMerge lazyUpdate />
    </SectionCard>
  );
}
