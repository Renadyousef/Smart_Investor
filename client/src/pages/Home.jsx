import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Search, MessageCircle, LogOut, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockChart from '../components/StockChart';
import { stockService, portfolioService } from '../services/api';
import aramcoLogo from '../assets/a.png';
import sabicLogo from '../assets/s.png';
import rajhiLogo from '../assets/r.png';

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

  const getStockLogo = (ticker) => {
    const logos = {
      '2222.SR': aramcoLogo,
      '2010.SR': sabicLogo,
      '1120.SR': rajhiLogo
    };
    return logos[ticker];
  };

  const getRecommendationStyles = (recommendation) => {
    switch (recommendation) {
      case 'مستقر':
        return 'bg-gray-400/30 text-gray-300 border border-gray-400/20';
      case 'مراقبة':
        return 'bg-yellow-500/30 text-yellow-500 border border-yellow-500/20';
      case 'احتفاظ':
      case 'شراء':
      case 'BUY':
      case 'KEEP':
        return 'bg-success/30 text-success border border-success/20';
      case 'بيع':
      case 'تجنب':
      case 'مخاطرة عالية':
      case 'SELL':
      case 'AVOID':
        return 'bg-danger/30 text-danger border border-danger/20';
      default:
        return 'bg-primary/30 text-primary border border-primary/20';
    }
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
      <header className="flex justify-between items-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={signOut}
            className="p-3 bg-danger/10 text-danger rounded-2xl border border-danger/20 hover:bg-danger/20 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={22} />
          </button>
          <button className="p-3 bg-surface rounded-2xl border border-gray-800 hover:bg-gray-800 transition-colors hidden">
            <Search size={22} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-end space-x-2 space-x-reverse">
              <span>المستثمر الذكي</span>
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </h1>
            <p className="text-blue-300 text-[10px] font-bold tracking-widest uppercase mt-0.5">استثمارك، بذكاء • SMART INVESTOR</p>
          </div>
        </div>
      </header>

      <div className="bg-surface/30 p-4 rounded-2xl border border-gray-800/50 flex justify-between items-center">
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-200">مرحباً {user?.full_name || 'أحمد'}</h2>
          <p className="text-gray-500 text-xs font-medium">رقم الحساب: {user?.account_number}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black shadow-lg">
          {user?.full_name?.[0] || 'أ'}
        </div>
      </div>

      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all"></div>
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 rounded-[2.5rem] shadow-2xl text-center space-y-4 border border-white/10">
          <div className="space-y-2">
            <p className="text-white/60 text-sm font-medium">إجمالي المحفظة</p>
            <h2 className="text-4xl font-black tracking-tight text-white">
              SAR {portfolioSummary?.total_market_value?.toLocaleString() || '0'}
            </h2>
            <div className={`inline-flex items-center space-x-2 space-x-reverse px-4 py-1.5 rounded-full backdrop-blur-md ${(portfolioSummary?.total_profit_loss || 0) >= 0 ? 'text-success' : 'text-danger'
              }`}>
              {(portfolioSummary?.total_profit_loss || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-bold text-sm">
                ({portfolioSummary?.pl_percentage || '0.00'}%) {Math.abs(portfolioSummary?.total_profit_loss || 0).toLocaleString()}{portfolioSummary?.total_profit_loss >= 0 ? '+' : '-'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-white/80 text-sm leading-relaxed font-medium max-w-xs mx-auto">
              نمكنك من اتخاذ قرارات استثمارية ذكية مبنية على تحليلات دقيقة وتوقعات مدعومة بالذكاء الاصطناعي لنمو مستدام لمحفظتك.المستصمر 
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-xl font-bold px-1">الأسعار المباشرة الآن</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-gray-500 text-sm italic">جاري جلب أداء السوق المباشر...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {marketData.map((stock) => (
              <div key={stock.stock} className="bg-surface p-6 rounded-[2rem] flex flex-col space-y-4 border border-gray-800 hover:border-primary/50 transition-all group shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-gray-800 flex items-center justify-center overflow-hidden shadow-inner">
                      {getStockLogo(stock.stock) ? (
                        <img src={getStockLogo(stock.stock)} alt={stock.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-bold text-primary text-xl">{stock.name[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="font-bold text-gray-200 text-lg">{stock.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">مباشر • {stock.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl tracking-tighter text-white">SAR {stock.current_price}</p>
                    <div className="flex items-center justify-end text-success text-xs font-bold">
                      <TrendingUp size={14} className="ml-1" />
                      <span>+1.2%</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-28 mt-2">
                  <StockChart
                    data={stock.history}
                    color="#4CAF50"
                    showTooltip={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold px-1">توصيات الذكاء الاصطناعي</h3>
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((stock, index) => (
            <div key={stock.stock} className="bg-surface/50 hover:bg-surface p-6 rounded-[2rem] border border-gray-800 transition-all group flex flex-col space-y-4">
              <div className="flex justify-between items-center w-full">
                <div className="text-left">
                  <p className="font-black text-2xl tracking-tighter text-white">SAR {stock.current_price}</p>
                  <div className="flex flex-col text-start">
                    <p className={`text-sm font-bold ${stock.growth_pct > 0 ? 'text-success' : 'text-danger'}`}>
                      {stock.growth_pct > 0 ? '+' : ''}{stock.growth_pct}% متوقع
                    </p>
                    <div className={`mt-2 text-sm font-black px-4 py-1.5 rounded-full inline-block w-max shadow-lg ${getRecommendationStyles(stock.recommendation)}`}>
                      {stock.recommendation}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="text-right">
                    <p className="text-xl font-black text-white group-hover:text-blue-300 transition-colors">{stock.name}</p>
                    <p className="text-xs text-gray-500 font-mono tracking-widest">{stock.stock}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-gray-800 flex items-center justify-center shadow-inner overflow-hidden">
                    {getStockLogo(stock.stock) ? (
                      <img src={getStockLogo(stock.stock)} alt={stock.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-primary text-2xl">{index + 1}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Reasoning / Beginner Hint */}
              <div className="bg-background/50 p-4 rounded-2xl border border-gray-800/50">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                    <TrendingUp size={16} className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-md font-bold text-blue-300 mb-1 uppercase tracking-tighter">شرح مبسط للتوقعات</p>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                      {stock.reason || "بناءً على اتجاهات السوق الحالية، تظهر المؤشرات الفنية نمطاً استقراريًا مع إمكانية نمو طفيف."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link
        to="/chatbot"
        className="fixed bottom-28 left-6 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-[1.5rem] shadow-2xl shadow-primary/40 flex items-center justify-center text-white z-40 hover:scale-110 hover:rotate-6 active:scale-95 transition-all group"
      >
        <div className="absolute inset-0 bg-primary rounded-[1.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <MessageCircle size={32} className="relative z-10" />
      </Link>
    </div>
  );
};

export default Home;
