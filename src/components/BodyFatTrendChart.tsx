"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatShortDate } from "@/lib/format";

export interface BodyFatTrendPoint {
  date: string;
  bodyFat: number;
}

export function BodyFatTrendChart({ data }: { data: BodyFatTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatShortDate(d)}
          tick={{ fontSize: 12 }}
          minTickGap={24}
        />
        <YAxis
          domain={["dataMin - 1", "dataMax + 1"]}
          tick={{ fontSize: 12 }}
          width={40}
        />
        <Tooltip
          labelFormatter={(d) => formatShortDate(String(d))}
          formatter={(value) => `${value}%`}
        />
        <Line
          type="monotone"
          dataKey="bodyFat"
          name="体脂肪率"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
