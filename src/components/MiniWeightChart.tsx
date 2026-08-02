"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import type { DailyRecord } from "@/lib/types";

export function MiniWeightChart({ records }: { records: DailyRecord[] }) {
  const data = records.map((r) => ({
    date: r.recordDate,
    weight: r.weightKg,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#059669"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
