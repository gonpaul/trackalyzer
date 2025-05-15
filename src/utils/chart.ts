import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import path from 'path';
import { ChartConfiguration } from 'chart.js';

interface ChartDataPoint {
  id: number;
  name: string;
  hoursSpent: number;
}

export async function createBarChart(
  data: ChartDataPoint[],
  xLabel: string,
  yLabel: string,
  title: string,
  outputPath: string
): Promise<string> {
  // Sort data by ID
  const sortedData = [...data].sort((a, b) => a.id - b.id);
  
  const width = 800;
  const height = 500;
  
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: 'white'
  });
  
  const configuration: ChartConfiguration = {
    type: 'bar' as const,
    data: {
      labels: sortedData.map(item => `#${item.id}`),
      datasets: [{
        label: 'Hours Spent',
        data: sortedData.map(item => item.hoursSpent),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        },
        legend: {
          display: true,
          position: 'top' as const
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xLabel
          }
        },
        y: {
          title: {
            display: true,
            text: yLabel
          },
          beginAtZero: true
        }
      }
    }
  };
  
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  
  // Ensure the directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, buffer);
  
  return outputPath;
} 