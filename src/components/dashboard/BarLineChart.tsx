import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatNumber } from "@/lib/format"

type BarLineChartProps = {
  bars: number[]
  line: number[]
  barColor: string
  lineColor: string
}

function formatTooltipValue(value: unknown) {
  if (typeof value === "number") {
    return formatNumber(value)
  }

  return value == null ? "--" : String(value)
}

function BarLineChart({ bars, line, barColor, lineColor }: BarLineChartProps) {
  const normalizedBars = bars.length > 0 ? bars : [1, 3, 2, 5, 4, 2, 6]
  const normalizedLine = line.length > 0 ? line : [5, 8, 12, 17, 20, 23, 30]
  const data = normalizedBars.map((barValue, index) => ({
    day: `${index + 1}`,
    bar: barValue,
    line: normalizedLine[index] ?? 0,
  }))

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <ComposedChart
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
            formatter={(value, name) => [
              formatTooltipValue(value),
              name === "bar" ? "يومى" : "تراكمى",
            ]}
            labelFormatter={(label) => `اليوم ${label}`}
            contentStyle={{
              borderRadius: "0.75rem",
              borderColor: "#E3E8DF",
              backgroundColor: "#ffffff",
            }}
          />
          <Bar
            dataKey="bar"
            fill={barColor}
            radius={[4, 4, 0, 0]}
            opacity={0.85}
          />
          <Line
            type="monotone"
            dataKey="line"
            stroke={lineColor}
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarLineChart
