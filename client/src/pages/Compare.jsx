import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, ArrowLeftRight, Loader2, Crown, Info, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { stockService } from '../services/api';
import aramcoLogo from '../assets/a.png';
import sabicLogo from '../assets/s.png';
import rajhiLogo from '../assets/r.png';

const Compare = () => {
  const [data, setData] = useState([]);
  const [normalizedHistory, setNormalizedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winnerTicker, setWinnerTicker] = useState(null);

  const tickers = ['2222.SR', '2010.SR', '1120.SR'];

  const getStockLogo = (ticker) => {
    const logos = {
      '2222.SR': aramcoLogo,
      '2010.SR': sabicLogo,
      '1120.SR': rajhiLogo
    };
    return logos[ticker];
  };

  const getStockShortName = (ticker) => {
    const names = {
      '2222.SR': 'أرامكو',
      '2010.SR': 'سابك',
      '1120.SR': 'الراجحي'
    };
    return names[ticker] || ticker;
  };

  const getStockColor = (ticker) => {
    const colors = {
      '2222.SR': '#3B82F6', // Blue
      '2010.SR': '#F59E0B', // Amber
      '1120.SR': '#7C3AED'  // Purple
    };
    return colors[ticker] || '#9ca3af';
  };

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Predictions & History in parallel
        const [predictionResults, historyResults] = await Promise.all([
          Promise.all(tickers.map(ticker => stockService.getPrediction(ticker))),
          Promise.all(tickers.map(ticker => stockService.getHistory(ticker)))
        ]);

        // 2. Process Prediction Data & Find Winner
        const processedData = predictionResults.map((res, index) => {
          const ticker = tickers[index];
          const growth = res.data.growth_pct;
          const risk = res.data.mae_percent;
          // Smart Score = (Growth * 0.7) - (Risk * 0.3)
          const smartScore = (growth * 0.7) - (risk * 0.3);

          return {
            name: getStockShortName(ticker),
            ticker: ticker,
            growth: growth,
            risk: risk,
            logo: getStockLogo(ticker),
            smartScore: smartScore
          };
        });

        const winner = [...processedData].sort((a, b) => b.smartScore - a.smartScore)[0];
        setWinnerTicker(winner.ticker);
        setData(processedData);

        // 3. Normalize History Data (Base 100)
        const minLen = Math.min(...historyResults.map(h => h.data.history.length));
        const normalized = [];

        for (let i = 0; i < minLen; i++) {
          const point = { index: i };
          historyResults.forEach((h, idx) => {
            const ticker = tickers[idx];
            const startPrice = h.data.history[0];
            const currentPrice = h.data.history[i];
            // Normalize: (Price / StartPrice) * 100
            point[ticker] = (currentPrice / startPrice) * 100;
          });
          normalized.push(point);
        }
        setNormalizedHistory(normalized);

      } catch (error) {
        console.error('Failed to fetch comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  return (
    <div className="p-4 space-y-8 pb-20">
      <header className="flex justify-between items-center py-2 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">مركز مقارنة الأسهم</h1>
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
          <BarChart2 className="text-primary" />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-surface rounded-[2rem] border border-gray-800 shadow-xl">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-gray-500 font-bold italic">جاري جلب تحليلات السوق والمقارنة...</p>
        </div>
      ) : (
        <>
          {/* Section 1: Growth Race (Normalized Line Chart) */}
          <section className="bg-surface p-6 rounded-[2rem] space-y-4 border border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500 opacity-50"></div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 space-x-reverse text-sm font-black text-gray-300">
                <LineChartIcon size={18} className="text-primary" />
                <span className="uppercase tracking-widest text-[12px]">مقارنة الأداء النسبي</span>
              </div>
              <div className="p-1.5 bg-background/50 rounded-lg group relative cursor-help">
                 <Info size={14} className="text-gray-500" />
                 <div className="absolute  left-0 mb-2 w-48 p-2 bg-black text-[12px] text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-800">
                   يوضح هذا الرسم مدى نمو كل سهم مقارنة بالآخرين، بافتراض أنك استثمرت نفس المبلغ في كل منها.
                 </div>
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={normalizedHistory}>
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #374151', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(val) => [`${val.toFixed(2)}%`, 'الأداء']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
                  {tickers.map(ticker => (
                    <Line
                      key={ticker}
                      type="monotone"
                      dataKey={ticker}
                      name={getStockShortName(ticker)}
                      stroke={getStockColor(ticker)}
                      strokeWidth={3}
                      dot={false}
                      animationDuration={2000}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Section 2: Smart Winner Highlighting */}
          <div className="grid grid-cols-1 gap-6">
            {data.map((stock) => {
              const isWinner = stock.ticker === winnerTicker;
              return (
                <div
                  key={stock.name}
                  className={`bg-surface p-6 rounded-[2.5rem] border transition-all duration-500 shadow-xl flex flex-col space-y-5 relative overflow-hidden ${
                    isWinner ? 'border-amber-400/40 shadow-amber-400/5 ring-1 ring-amber-400/20' : 'border-gray-800'
                  }`}
                >
                  {isWinner && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-3xl -mr-16 -mt-16"></div>
                      <div className="absolute top-4 left-6 flex items-center space-x-1 space-x-reverse bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30 animate-pulse">
                         <Crown size={14} className="text-amber-400" />
                         <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter">الأفضل أداءً مقابل المخاطر</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-gray-800 flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform">
                        <img src={stock.logo} alt={stock.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-white">{stock.name}</h4>
                        <div className="flex items-center space-x-2 space-x-reverse mt-1">
                          <span className="px-3 py-1 bg-primary/10 text-gray-400 border border-primary/20 rounded-xl text-[10px] font-black uppercase">تحليل ذكي</span>
                          {isWinner && <span className="text-[10px] text-amber-500 font-bold italic">الأفضل أداءً مقابل المخاطر</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">النمو المتوقع</p>
                       <div className={`text-3xl font-black ${stock.growth > 0 ? 'text-success' : 'text-danger'}`}>
                          {stock.growth > 0 ? '+' : ''}{stock.growth}%
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-background/50 p-4 rounded-2xl border border-gray-800/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">تذبذب السعر (المخاطرة)</p>
                        <div className="flex items-center space-x-2 space-x-reverse">
                           <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-warning" style={{ width: `${stock.risk}%` }}></div>
                           </div>
                           <span className="text-sm font-black text-warning">{stock.risk}%</span>
                        </div>
                     </div>
                     <div className="bg-background/50 p-4 rounded-2xl border border-gray-800/50 flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">تقييم الجدارة الاستثمارية</p>
                        <p className="text-sm font-black text-blue-300">{stock.smartScore.toFixed(1)} Pts</p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Compare;
