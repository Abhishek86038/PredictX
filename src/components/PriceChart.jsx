import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPriceHistory } from '../services/priceService';

export default function PriceChart({ cryptoId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async () => {
    try {
      setLoading(true);
      const prices = await getPriceHistory(cryptoId, 7);
      const formattedData = prices.map(([timestamp, price]) => ({
        time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
        price: parseFloat(price.toFixed(2))
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [cryptoId]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  if (loading) return <div className="chart-loading">Loading chart...</div>;

  return (
    <div className="price-chart" style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }} 
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 10 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value) => [`$${value}`, 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#0066CC" 
            strokeWidth={2}
            dot={false} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
