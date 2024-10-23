'use client';
import React from 'react';
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

function DoughnutChart({ labelsT, datesT, labelN }) {
  const chartRef = useRef(null);
  labelsT = labelsT || [];
  datesT = datesT || [];

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      const context = chartRef.current.getContext('2d');

      const newChart = new Chart(context, {
        type: 'doughnut',
        data: {
          labels: labelsT,
          datasets: [
            {
              label: labelN,
              data: datesT,
              backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
              ],
              hoverOffset: 4,
            },
          ],
        },
      });
      chartRef.current.chart = newChart;
    }
  }, []);
  return (
    <div style={{ width: '50vw', height: '50vh' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export default DoughnutChart;
