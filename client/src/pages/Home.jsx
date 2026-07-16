import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Search, MessageCircle, LogOut, Loader2 } from 'lucide-react';
import StockChart from '../components/StockChart';
import { stockService, portfolioService } from '../services/api';

const Home = () => {
  const { user, signOut } = useAuth();
  const [marketData, setMarketData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const tickers = ['2222.SR', '2010.SR', '1120.SR'];

  const getStockName = (ticker) => {
    const names = {
      '2222.SR': 'أرامكو السعودية',
      '2010.SR': 'سابك',
      '1120.SR': 'الراجحي'
    };
    return names[ticker] || ticker;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Parallel requests for Market History, AI Predictions, and Portfolio Summary
        const [historyResults, predictionResults, summaryRes] = await Promise.all([
          Promise.all(tickers.map(async (ticker) => {
            try {
              const res = await stockService.getHistory(ticker);
              return { ...res.data, name: getStockName(ticker) };
            } catch (err) { return null; }
          })),
          Promise.all(tickers.map(async (ticker) => {
            try {
              const res = await stockService.getPrediction(ticker);
              return { ...res.data, name: getStockName(ticker) };
            } catch (err) { return null; }
          })),
          portfolioService.getSummary()
        ]);

        setMarketData(historyResults.filter(r => r !== null));
        setRecommendations(predictionResults.filter(r => r !== null));
        setPortfolioSummary(summaryRes.data);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="py-6 space-y-8 px-4">
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
          <h2 className="text-4xl font-black tracking-tight text-white">
            SAR {portfolioSummary?.total_market_value?.toLocaleString() || '0'}
          </h2>
          <div className={`inline-flex items-center space-x-2 space-x-reverse px-4 py-1.5 rounded-full backdrop-blur-md ${
            (portfolioSummary?.total_profit_loss || 0) >= 0 ? 'text-success' : 'text-danger'
          }`}>
            {(portfolioSummary?.total_profit_loss || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-bold text-sm">
              ({portfolioSummary?.pl_percentage || '0.00'}%) {Math.abs(portfolioSummary?.total_profit_loss || 0).toLocaleString()}{portfolioSummary?.total_profit_loss >= 0 ? '+' : '-'}
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-xl font-bold px-1">نظرة السوق (بيانات حية)</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <p className="text-gray-500 text-sm italic">جاري جلب أداء السوق المباشر...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.map((stock) => (
              <div key={stock.stock} className="bg-surface p-6 rounded-[2rem] space-y-4 border border-gray-800 hover:border-primary/50 transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-bold text-gray-300">{stock.name}</span>
                  </div>
                  <TrendingUp size={18} className="text-success" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-black text-2xl tracking-tighter">SAR {stock.current_price}</p>
                    <p className="text-[10px] text-gray-500">مباشر من تداول</p>
                  </div>
                  <div className="w-24 h-12">
                    <StockChart
                      data={stock.history}
                      color="#4CAF50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold px-1">توصيات الذكاء الاصطناعي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((stock, index) => (
            <div key={stock.stock} className="bg-surface/50 hover:bg-surface p-5 rounded-[1.5rem] flex justify-between items-center border border-gray-800 transition-colors group">
              <div className="text-left">
                <p className="font-black text-xl tracking-tighter">SAR {stock.current_price}</p>
                <div className="flex flex-col">
                    <p className={`text-xs font-bold ${stock.growth_pct > 0 ? 'text-success' : 'text-danger'}`}>
                    {stock.growth_pct > 0 ? '+' : ''}{stock.growth_pct}% متوقع
                    </p>
                    <div className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-max ${
                        stock.recommendation === 'BUY' ? 'bg-success/20 text-success' :
                        stock.recommendation === 'KEEP' ? 'bg-primary/20 text-primary' :
                        'bg-danger/20 text-danger'
                    }`}>
                        {stock.recommendation}
                    </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-right">
                  <p className="font-bold group-hover:text-primary transition-colors">{stock.name}</p>
                  <p className="text-[10px] text-gray-600 font-mono tracking-widest">{stock.stock}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-background border border-gray-800 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                  {index + 1}
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
