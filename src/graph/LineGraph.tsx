import { formattedValue } from "@/utils/ReusableFunctions";
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Chart as ChartType,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useCallback, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineGraphProps {
  data: any;
  width: string;
  height: string;
  showLegend: boolean;
}

const backgroundColorPlugin = {
  id: "custom_canvas_background_color",
  beforeDraw: (chart: any) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.fillStyle = "#000"; // Black background
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const gradientBorderPlugin = {
  id: "gradientBorderPlugin",
  beforeDatasetsDraw(chart: any) {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (!chartArea) return;

    const startColor = "#9AD99A";
    const endColor = "#F49191";

    const interpolateColor = (color1: string, color2: string, factor: number): string => {
      const hexToRgb = (hex: string) =>
        hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? [0, 0, 0];
      const rgbToHex = (r: number, g: number, b: number) =>
        `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      const result = c1.map((c, i) => Math.round(c + factor * (c2[i] - c))) as [number, number, number];
      return rgbToHex(...result);
    };

    const dataset = chart.data.datasets[0];
    const dataLength = dataset.data.length;

    // Line stroke gradient
    const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    dataset.borderColor = gradient;

    // Per-point color array
    const pointColors = Array.from({ length: dataLength }, (_, i) =>
      interpolateColor(startColor, endColor, i / (dataLength - 1))
    );

    dataset.pointBackgroundColor = pointColors;
    dataset.pointBorderColor = pointColors;
  },
};


const lineShadowPlugin = {
  id: "lineShadow",
  beforeDatasetsDraw(chart:any) {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset:any, i:any) => {
      const meta = chart.getDatasetMeta(i);
      meta.dataset.options.borderColor = dataset.borderColor;
      ctx.save();
      ctx.shadowColor = "rgba(0,198,255,0.4)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      meta.dataset.draw(ctx);
      ctx.restore();
    });
  },
};


const transformGraphData = (kpi: any) => {

  if (!kpi || !kpi.breakdownData) return [];
 
  return kpi?.breakdownData.map((item: any) => ({
    period: item.intervalName,
    currentValue: item.intervalContribution,
    targetedValue: item.intervalTarget,
  }));
};

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {


  const chartRef = useRef<ChartType<"line"> | null>(null);
  const transformData = useMemo(() => transformGraphData(data), [data]);

  const labels = useMemo(() => transformData.map((item: any) => item.period), [transformData]);
  const currentValue = useMemo(() => transformData.map((item: any) => formattedValue(item.currentValue)), [transformData]);
  const targetedValue = useMemo(() => transformData.map((item: any) => formattedValue(item.targetedValue)), [transformData]);

  const maxValue = Math.max(...targetedValue, ...currentValue);

  const getGradient = useCallback(
    (ctx: CanvasRenderingContext2D, chartArea: { left: number; top: number; right: number; bottom: number }) => {
      const gradient = ctx.createLinearGradient(0, 0, chartArea.right, 0);
      gradient.addColorStop(0, "#9AD99A"); // Light green
      gradient.addColorStop(1, "#F49191"); // Light pink
      return gradient;
    },
    []
  );
  
  const chartData = useMemo(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const { chartArea } = chart;

      if (chartArea) {
        const gradient = getGradient(ctx, chartArea);

        return {
          datasets: [
            {
              label: "Current Value",
              data: currentValue,
              fill: false,
              borderColor: gradient, // Use gradient directly here
              borderWidth: 4,
              pointRadius: 5,
              pointBackgroundColor: gradient,
              pointBorderWidth: 2,
              tension: 0.4,
            },
            {
              label: "Targeted Value",
              data: targetedValue,
              borderColor: "#aaaaaa",
              backgroundColor: "#aaaaaa",
              pointRadius: 6,
              pointBackgroundColor: "#aaaaaa",
              pointBorderColor: "#888",
              borderWidth: 2,
              borderDash: [10, 5], // Dotted line for target
            },
          ],
        };
      }
    }

    return {
      datasets: [
        {
          label: "Current Value",
          data: currentValue,
          fill: false,
          borderColor: "#fff",
          borderWidth: 3,
          pointBackgroundColor: "#00c6ff",
          pointBorderWidth: 2,
          tension: 0.4,
        },
        {
          label: "Targeted Value",
          data: targetedValue,
          borderColor: "#aaaaaa",
          backgroundColor: "#aaaaaa",
          pointRadius: 5,
          pointBackgroundColor: "#aaaaaa",
          pointBorderColor: "#888",
          lineWidth: 1,
         
          borderDash: [10, 5], // Dotted line for target
        },
      ],
    };
  }, [currentValue, getGradient]);

  const stepSize = useMemo(() => {
    const steps = 5;
    return Math.ceil(maxValue / steps); // Calculate step size and round up
  }, [maxValue]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,  // Adjust this value as needed
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
      animation: {
        duration: 1200,
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            color: "#fff",
            font: {
              size: 13,
             weight: "bold",
            },
          },
        },
        
        tooltip: {
          enabled: true,
          intersect: false,
          mode: "index",
          backgroundColor: "#1a1a1a",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#00c6ff",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
          },
          external: (context) => {
            if (!context.tooltip) return;

            const { chart, tooltip } = context;
            const ctx = chart.ctx;
            ctx.save();

            // Get the x position of the tooltip
            const x = tooltip.caretX;
            const topY = chart.chartArea.top;
            const bottomY = chart.chartArea.bottom;

            // Draw a dotted vertical line
            ctx.beginPath();
            ctx.setLineDash([10, 5]); // Dotted line pattern
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FFFFFF80"; // White with transparency
            ctx.stroke();
            ctx.restore();
          },
        },
      },
     
      scales: {
        y: {
          type: "linear",
          beginAtZero: false,
          ticks: {
            color: "#fff",
            font: {
              size: 12,
            },
            stepSize: stepSize,
            callback: function (tickValue: string | number) {
              return `${tickValue}`;
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            lineWidth: 1,
            drawBorder: false,
          },

          max: maxValue,
        },
        x: {
          type: "category",
          labels: labels,
          ticks: {
            color: "#fff",
            font: {
              size: 12,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    [maxValue, labels,stepSize]
  );

  return (
    <div className="bg-[#080808] rounded-xl shadow-lg p-6 w-full h-[400px] flex flex-col">
      <div className="flex-grow relative w-full h-full">
        <Line ref={chartRef} data={chartData} options={options} plugins={[backgroundColorPlugin,lineShadowPlugin,gradientBorderPlugin]}/>
      </div>
    </div>
  );
};

export default LineGraph;
