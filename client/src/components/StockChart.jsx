import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis } from 'recharts';

const StockChart = ({ data, color, showTooltip = false }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((val, i) => ({ price: val, index: i }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis hide domain={['auto', 'auto']} />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: color }}
              labelStyle={{ display: 'none' }}
              formatter={(value) => [`SAR ${value}`, 'السعر']}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
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
