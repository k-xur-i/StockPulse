import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export default function StockChart({ symbol }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!symbol || !containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
    });

    chartRef.current = chart;

    const fetchChartData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/stocks/${symbol}/chart`
        );
        const data = await response.json();

        if (chartRef.current && Array.isArray(data) && data.length > 0) {
          // v5 API: addSeries(SeriesType, options)
          const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
          });
          candleSeries.setData(data);
          chartRef.current.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '400px' }}
      className="bg-white rounded-lg shadow-lg"
    />
  );
}