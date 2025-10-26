"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface HeatMapProps {
  data: number[][];
}

export default function HeatMap({ data }: HeatMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        position: "top",
      },
      grid: {
        height: "50%",
        top: "10%",
      },
      xAxis: {
        type: "category",
        data: ["1", "2", "3", "4", "5"],
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: "category",
        data: ["1", "2", "3", "4", "5"],
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "15%",
        inRange: {
          color: ["#50a3ba", "#eac736", "#d94e5d"],
        },
      },
      series: [
        {
          name: "Risk Score",
          type: "heatmap",
          data: data,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "500px" }} />;
}
