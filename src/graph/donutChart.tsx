import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, data } = props;
  const averageCompletion = Math.round(
  data.reduce((sum, item) => sum + item.currentValue / item.targetValue, 0) / data.length * 100
);
  return (
    <text
      x={cx}
      y={cy}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={32}
      fontWeight={500}
    >
      {averageCompletion}%
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "8px",
        }}
      >
        <p>{`0${payload[0].value} ${payload[0].name}`}</p>
      </div>
    );
  }
  return null;
};

type ChartDataType = {
  name: string;
  currentValue: number;
  targetValue: number;
  color: string;
}[];

interface DonutChartProps {
  data: ChartDataType;
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  return (
    <div className="m-auto p-8 rounded-xl text-white flex items-center justify-center gap-12">
      <ResponsiveContainer width={250} height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            dataKey="currentValue"
            labelLine={false}
            label={(props) => renderCustomizedLabel({ ...props, data })}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-sm height-[240px] overflow-y-scroll hide-scrollbar">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="w-32">{entry.name}</span>
            <span>{`${entry.currentValue}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
