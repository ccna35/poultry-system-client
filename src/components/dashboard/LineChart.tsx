import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

type LineChartProps = {
  values: Array<number | null>
  stroke: string
  fill?: string
  dashed?: boolean
  heightClassName?: string
}

const fallbackSeries = [5, 12, 14, 19, 22, 25, 27]

function formatTooltipValue(value: unknown) {
  if (typeof value === "number") {
    return formatNumber(value)
  }

  return value == null ? "--" : String(value)
}

function LineChart({
  values,
  stroke,
  fill,
  dashed,
  heightClassName,
}: LineChartProps) {
  const normalizedValues = values.filter(
    (value): value is number => value !== null
  )
  const source = normalizedValues.length > 1 ? normalizedValues : fallbackSeries
  const data = source.map((value, index) => ({
    day: `${index + 1}`,
    value,
  }))

  return (
    <div className={cn("w-full", heightClassName ?? "h-44")}>
      <ResponsiveContainer>
        {fill ? (
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.18)"
              strokeDasharray="2 3"
              vertical={false}
            />
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [formatTooltipValue(value), "القيمة"]}
              labelFormatter={(label) => `يوم ${label}`}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#E3E8DF",
                backgroundColor: "#ffffff",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={stroke}
              fill={fill}
              strokeWidth={2.4}
              strokeDasharray={dashed ? "4 3" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        ) : (
          <RechartsLineChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.18)"
              strokeDasharray="2 3"
              vertical={false}
            />
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [formatTooltipValue(value), "القيمة"]}
              labelFormatter={(label) => `يوم ${label}`}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#E3E8DF",
                backgroundColor: "#ffffff",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={stroke}
              strokeWidth={2.4}
              strokeDasharray={dashed ? "4 3" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart
