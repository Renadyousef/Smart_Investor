import React from 'react';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import StockChart from '../components/StockChart';

const MOCK_PORTFOLIO = [
  {
    id: '1',
    symbol: '2222.SR',
    name: 'أرامكو السعودية',
    quantity: 1000,
    value: 29500,
    change: 1.25,
    recommendation: 'KEEP'
  },
  {
    id: '2',
    symbol: '2010.SR',
    name: 'سابك',
    quantity: 200,
    value: 15640,
    change: -0.45,
    recommendation: 'RISKY'
  },
  {
    id: '3',
    symbol: '1120.SR',
    name: 'الراجحي',
    quantity: 50,
    value: 4255,
    change: 2.10,
    recommendation: 'SELL'
  },
];

const Portfolio = () => {
  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold">محفظتي</h1>
        <button className="p-2 bg-primary rounded-full text-white">
          <Plus size={24} />
        </button>
      </header>

      <div className="bg-surface p-6 rounded-3xl space-y-4 border border-gray-800">
        <div className="text-center">
          <p className="text-gray-400 text-sm">إجمالي المحفظة</p>
          <h2 className="text-4xl font-bold mt-1">30,000 SAR</h2>
          <div className="flex items-center justify-center text-success mt-2">
            <TrendingUp size={18} className="ml-1" />
            <span className="font-bold">+2,500 (9.00%)</span>
          </div>
        </div>

        <div className="h-20 w-full mt-4 opacity-50">
          <StockChart
            data={[25000, 26000, 25500, 28000, 27500, 30000]}
            color="#6C63FF"
          />
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">استثماراتي</h3>
        <div className="space-y-3">
          {MOCK_PORTFOLIO.map((item) => (
            <div key={item.id} className="bg-surface p-4 rounded-2xl flex justify-between items-center border border-gray-800/50">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-primary">
                  {item.symbol[0]}
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity} سهم</p>
                </div>
              </div>

              <div className="text-left">
                <p className="font-bold">{item.value.toLocaleString()} SAR</p>
                <div className="flex items-center justify-end">
                   <span className={`text-xs font-bold ${item.change > 0 ? 'text-success' : 'text-danger'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                  {item.change > 0 ? (
                    <TrendingUp size={14} className="text-success mr-1" />
                  ) : (
                    <TrendingDown size={14} className="text-danger mr-1" />
                  )}
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                  item.recommendation === 'KEEP' ? 'bg-success/20 text-success' :
                  item.recommendation === 'SELL' ? 'bg-danger/20 text-danger' :
                  'bg-accent/20 text-accent'
                }`}>
                  {item.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
