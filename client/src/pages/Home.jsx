import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Search, MessageCircle, LogOut } from 'lucide-react';
import StockChart from '../components/StockChart';

const MOCK_STOCKS = [
  { id: '1', symbol: '2222.SR', name: 'أرامكو السعودية', price: 29.50, change: 1.25, history: [28, 28.5, 29, 28.8, 29.2, 29.5] },
  { id: '2', symbol: '2010.SR', name: 'سابك', price: 78.20, change: -0.45, history: [80, 79.5, 79, 78.5, 78, 78.2] },
  { id: '3', symbol: '1120.SR', name: 'الراجحي', price: 85.10, change: 2.10, history: [82, 83, 84.5, 84, 85, 85.1] },
];

const Home = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="py-6 space-y-8">
      <header className="flex justify-between items-start">
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={signOut}
            className="p-3 bg-danger/10 text-danger rounded-2xl border border-danger/20 hover:bg-danger/20 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={22} />
          </button>
          <button className="p-3 bg-surface rounded-2xl border border-gray-800 hover:bg-gray-800 transition-colors">
            <Search size={22} className="text-gray-400" />
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold tracking-tight">مرحباً {user?.full_name || 'أحمد'}</h1>
          <p className="text-gray-500 text-sm font-medium">رقم الحساب: {user?.account_number}</p>
        </div>
      </header>

      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all"></div>
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 rounded-[2.5rem] shadow-2xl text-center space-y-2 border border-white/10">
          <p className="text-white/60 text-sm font-medium">إجمالي المحفظة</p>
          <h2 className="text-4xl font-black tracking-tight">SAR 30,000</h2>
          <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
            <TrendingUp size={16} className="text-success" />
            <span className="text-success font-bold text-sm">(8.50%) 2,500+</span>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-xl font-bold px-1">نظرة السوق</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_STOCKS.map((stock) => (
            <div key={stock.id} className="bg-surface p-6 rounded-[2rem] space-y-4 border border-gray-800 hover:border-primary/50 transition-all group">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {stock.change > 0 ? (
                    <TrendingUp size={18} className="text-success" />
                  ) : (
                    <TrendingDown size={18} className="text-danger" />
                  )}
                  <span className="font-bold text-gray-300">{stock.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-black text-2xl tracking-tighter">SAR {stock.price}</p>
                  <p className={`text-sm font-bold ${stock.change > 0 ? 'text-success' : 'text-danger'}`}>
                    {stock.change > 0 ? '+' : ''}{stock.change}%
                  </p>
                </div>
                <div className="w-24 h-12">
                   <StockChart
                    data={stock.history}
                    color={stock.change > 0 ? '#4CAF50' : '#F44336'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold px-1">توصيات الذكاء الاصطناعي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_STOCKS.map((stock, index) => (
            <div key={stock.id} className="bg-surface/50 hover:bg-surface p-5 rounded-[1.5rem] flex justify-between items-center border border-gray-800 transition-colors group">
              <div className="text-left">
                <p className="font-black text-xl tracking-tighter">SAR {stock.price}</p>
                <p className={`text-xs font-bold ${stock.change > 0 ? 'text-success' : 'text-danger'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change}%
                </p>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-right">
                  <p className="font-bold group-hover:text-primary transition-colors">{stock.name}</p>
                  <p className="text-[10px] text-gray-600 font-mono tracking-widest">{stock.symbol}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-background border border-gray-800 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                  {3 - index}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="fixed bottom-28 left-6 w-16 h-16 bg-primary rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center text-white z-40 hover:scale-110 active:scale-95 transition-all">
        <MessageCircle size={32} />
      </button>
    </div>
  );
};

export default Home;
