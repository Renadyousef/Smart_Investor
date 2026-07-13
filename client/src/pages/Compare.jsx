import { BarChart2, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DATA = [
  { name: 'أرامكو', growth: 8.5, risk: 2.1 },
  { name: 'سابك', growth: -4.2, risk: 7.5 },
  { name: 'الراجحي', growth: 6.8, risk: 5.2 },
];

const Compare = () => {
  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">مقارنة الأسهم</h1>
        <BarChart2 className="text-primary" />
      </header>

      <section className="bg-surface p-4 rounded-2xl space-y-4 border border-gray-800">
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
            <ArrowLeftRight size={16} />
            <span>مقارنة النمو والمخاطر (%)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="growth" name="النمو المتوقع" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              <Bar dataKey="risk" name="نسبة المخاطرة" fill="#F44336" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {DATA.map((stock) => (
          <div key={stock.name} className="bg-surface p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg">{stock.name}</h4>
              <p className="text-xs text-gray-500">تحليل قطاع السوق</p>
            </div>
            <div className="flex space-x-6 space-x-reverse">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">النمو</p>
                <div className={`flex items-center text-sm font-bold ${stock.growth > 0 ? 'text-success' : 'text-danger'}`}>
                  {stock.growth > 0 ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />}
                  {stock.growth}%
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">المخاطر</p>
                <div className="text-sm font-bold text-accent">
                  {stock.risk}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Compare;
