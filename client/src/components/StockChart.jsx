import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis } from 'recharts';

const StockChart = ({ data, color, showTooltip = false }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((val, i) => ({ price: val, index: i }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis hide domain={['auto', 'auto']} />
          {showTooltip && (
            <Tooltip
              cursor={{ stroke: '#374151', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#000000',
                border: '1px solid #4b5563',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ color: color, padding: '4px 0' }}
              labelStyle={{ display: 'none' }}
              formatter={(value) => [`SAR ${value.toLocaleString()}`, 'السعر']}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#gradient-${color.replace('#', '')})`}
            dot={false}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
