'use client';
import React from 'react';
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

function LineChart({ labelsT, datesT, labelN, bgCol, borCol, tody }) {
  const chartRef = useRef(null);
  labelsT = labelsT || [];
  datesT = datesT || [];

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      const context = chartRef.current.getContext('2d');
      const today = new Date(tody);
      const todayIndex = datesT.findIndex(
        (date) => new Date(date).toDateString() === today.toDateString()
      );

      // Set point colors
      const pointBackgroundColors = datesT.map((_, index) =>
        index === todayIndex
          ? 'rgba(2, 255, 132, 0.2)'
          : bgCol || 'rgba(255, 99, 132, 0.2)'
      );
      const pointBorderColors = datesT.map((_, index) =>
        index === todayIndex
          ? 'rgba(2,99, 132, 1)'
          : borCol || 'rgba(255, 99, 132, 1)'
      );

      const newChart = new Chart(context, {
        type: 'line',
        data: {
          labels: labelsT,
          datasets: [
            {
              label: labelN,
              data: datesT,
              backgroundColor: pointBackgroundColors,
              borderColor: pointBorderColors,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
          },
        },
      });
      chartRef.current.chart = newChart;
    }
  }, []);
  return (
    <div style={{ position: 'relative', width: '40vw', height: '50vh' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export default LineChart;
