import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Search, MessageCircle } from 'lucide-react';
import StockChart from '../components/StockChart';

const MOCK_STOCKS = [
  { id: '1', symbol: '2222.SR', name: 'أرامكو السعودية', price: 29.50, change: 1.25, history: [28, 28.5, 29, 28.8, 29.2, 29.5] },
  { id: '2', symbol: '2010.SR', name: 'سابك', price: 78.20, change: -0.45, history: [80, 79.5, 79, 78.5, 78, 78.2] },
  { id: '3', symbol: '1120.SR', name: 'الراجحي', price: 85.10, change: 2.10, history: [82, 83, 84.5, 84, 85, 85.1] },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <div>
          <h1 className="text-2xl font-bold">مرحباً {user?.user_metadata?.full_name || 'أحمد'}</h1>
          <p className="text-gray-400 text-sm">مساعدك الذكي في سوق الأسهم</p>
        </div>
        <button className="p-2 bg-surface rounded-full">
          <Search size={20} className="text-gray-400" />
        </button>
      </header>

      <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-3xl shadow-xl space-y-4">
        <div>
          <p className="text-white/70 text-sm">إجمالي المحفظة</p>
          <h2 className="text-3xl font-bold">30,000 SAR</h2>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="flex items-center text-success bg-white/10 px-2 py-1 rounded-lg text-xs font-bold">
            <TrendingUp size={14} className="ml-1" />
            +2,500 (8.50%)
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">نظرة السوق</h3>
        <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
          {MOCK_STOCKS.map((stock) => (
            <div key={stock.id} className="min-w-[160px] bg-surface p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm">{stock.name}</span>
                {stock.change > 0 ? (
                  <TrendingUp size={16} className="text-success" />
                ) : (
                  <TrendingDown size={16} className="text-danger" />
                )}
              </div>
              <div>
                <p className="font-bold text-lg">{stock.price} SAR</p>
                <p className={`text-xs ${stock.change > 0 ? 'text-success' : 'text-danger'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change}%
                </p>
              </div>
              <StockChart
                data={stock.history}
                color={stock.change > 0 ? '#4CAF50' : '#F44336'}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">توصيات الذكاء الاصطناعي</h3>
        <div className="space-y-3">
          {MOCK_STOCKS.map((stock) => (
            <div key={stock.id} className="bg-surface p-4 rounded-2xl flex justify-between items-center">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-primary">
                  {stock.symbol[0]}
                </div>
                <div>
                  <p className="font-bold">{stock.name}</p>
                  <p className="text-xs text-gray-500">{stock.symbol}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold">{stock.price} SAR</p>
                <p className={`text-xs ${stock.change > 0 ? 'text-success' : 'text-danger'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="fixed bottom-24 left-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white z-40">
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default Home;
