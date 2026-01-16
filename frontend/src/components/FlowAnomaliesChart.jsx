import { useState } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Flow Anomalies Chart - показывает точки транзакций
export default function FlowAnomaliesChart() {
  const [selectedMetrics, setSelectedMetrics] = useState([
    { id: 'openInterest', label: 'OI', name: 'Open Interest', color: '#3B82F6' },
    { id: 'netFlow', label: 'NF', name: 'Net Flow', color: '#8B5CF6' },
    { id: 'price', label: 'PR', name: 'Price', color: '#10B981' }
  ]);

  const allMetrics = [
    { id: 'openInterest', label: 'OI', name: 'Open Interest', color: '#3B82F6' },
    { id: 'netFlow', label: 'NF', name: 'Net Flow', color: '#8B5CF6' },
    { id: 'price', label: 'PR', name: 'Price', color: '#10B981' },
    { id: 'volume', label: 'VOL', name: 'Volume', color: '#F59E0B' }
  ];

  // Generate mock data showing anomalies (deviations from baseline)
  const generateAnomalyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const dataPoint = { day };
      
      // Generate anomaly values (deviations from 0x baseline)
      selectedMetrics.forEach(metric => {
        const baseline = 0;
        const anomaly = (Math.random() - 0.5) * 8; // Range: -4x to +4x
        dataPoint[metric.id] = baseline + anomaly;
      });
      
      return dataPoint;
    });
  };

  const data = generateAnomalyData();

  const removeMetric = (metricId) => {
    if (selectedMetrics.length > 1) {
      setSelectedMetrics(selectedMetrics.filter(m => m.id !== metricId));
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-2xl border-2 border-gray-200 shadow-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>
          {payload.map((entry, index) => {
            const metric = selectedMetrics.find(m => m.id === entry.dataKey);
            const value = entry.value.toFixed(2);
            return (
              <div key={index} className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-medium text-gray-700">{metric?.name}</span>
                </div>
                <span className={`text-xs font-bold ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {value >= 0 ? '+' : ''}{value}x
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Flow Anomalies</h3>
        <span className="text-xs text-gray-500">Z-score deviations</span>
      </div>

      {/* Metric selector pills */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {selectedMetrics.map(metric => (
          <div 
            key={metric.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }} />
            <span className="text-xs font-medium text-gray-700">{metric.label} {metric.name}</span>
            {selectedMetrics.length > 1 && (
              <button
                onClick={() => removeMetric(metric.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value.toFixed(1)}x`}
              domain={[-5, 5]}
              ticks={[-5, -2.5, 0, 2.5, 5]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {selectedMetrics.map(metric => (
              <Line
                key={metric.id}
                type="monotone"
                dataKey={metric.id}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 4, fill: metric.color, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: metric.color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
        {selectedMetrics.map(metric => (
          <div key={metric.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
            <span className="text-xs font-medium text-gray-600">{metric.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
