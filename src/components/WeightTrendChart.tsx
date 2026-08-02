"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatShortDate } from "@/lib/format";

export interface WeightTrendPoint {
  date: string;
  weight: number | null;
  average: number | null;
}

export function WeightTrendChart({ data }: { data: WeightTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
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
          formatter={(value) => `${value}kg`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="weight"
          name="体重"
          stroke="#059669"
          strokeWidth={2}
          dot={{ r: 2 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="average"
          name="7日移動平均"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
