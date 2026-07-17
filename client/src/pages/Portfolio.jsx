import { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Tag, Loader2 } from 'lucide-react';
import StockChart from '../components/StockChart';
import { portfolioService, stockService } from '../services/api';
import aramcoLogo from '../assets/a.png';
import sabicLogo from '../assets/s.png';
import rajhiLogo from '../assets/r.png';

const SUPPORTED_STOCKS = [
  { ticker: '2222.SR', name: 'أرامكو السعودية', image: aramcoLogo },
  { ticker: '2010.SR', name: 'سابك', image: sabicLogo },
  { ticker: '1120.SR', name: 'مصرف الراجحي', image: rajhiLogo }
];

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellQuantity, setSellQuantity] = useState('');
  const [newHolding, setNewHolding] = useState({
    stock_symbol: '',
    ticker: '',
    quantity: '',
    average_purchase_price: ''
  });

  const fetchHoldings = async () => {
    try {
      console.log('DEBUG: Fetching holdings...');
      const response = await portfolioService.getHoldings();
      console.log('DEBUG: Received holdings:', response.data);
      setHoldings(response.data);
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    try {
      await portfolioService.addHolding({
        ...newHolding,
        quantity: parseFloat(newHolding.quantity),
        average_purchase_price: parseFloat(newHolding.average_purchase_price)
      });
      setShowAddModal(false);
      setNewHolding({ stock_symbol: '', ticker: '', quantity: '', average_purchase_price: '' });
      fetchHoldings();
    } catch (err) {
      alert('فشل إضافة السهم');
    }
  };

  const handleStockSelect = async (ticker) => {
    const selected = SUPPORTED_STOCKS.find(s => s.ticker === ticker);
    if (!selected) return;

    setNewHolding(prev => ({ ...prev, ticker, stock_symbol: selected.name }));
    setFetchingPrice(true);
    try {
      const response = await stockService.getHistory(ticker);
      const currentPrice = response.data.current_price;
      setNewHolding(prev => ({ ...prev, average_purchase_price: currentPrice.toString() }));
    } catch (error) {
      console.error('Failed to fetch stock price:', error);
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleSellHolding = async (e) => {
    e.preventDefault();
    if (!selectedHolding || !sellQuantity) return;

    const quantity = parseFloat(sellQuantity);
    if (quantity <= 0 || quantity > selectedHolding.quantity) {
      alert('كمية غير صالحة');
      return;
    }

    try {
      await portfolioService.sellHolding(selectedHolding.id, quantity);
      setShowSellModal(false);
      setSelectedHolding(null);
      setSellQuantity('');
      fetchHoldings();
    } catch (err) {
      alert(err.response?.data?.detail || 'فشل عملية البيع');
    }
  };

  const totalCost = holdings.reduce((sum, item) => sum + (item.quantity * item.average_purchase_price), 0);
  const totalMarketValue = holdings.reduce((sum, item) => sum + (item.total_value || 0), 0);
  const totalPL = totalMarketValue - totalCost;
  const totalPLPercentage = (totalPL / totalCost * 100) || 0;

  const getStockIcon = (ticker) => {
    const stock = SUPPORTED_STOCKS.find(s => s.ticker === ticker);
    if (stock?.image) {
      return <img src={stock.image} alt={stock.name} className="w-full h-full object-contain rounded-xl" />;
    }
    return <Tag size={24} />;
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-black text-white tracking-tight">محفظتي </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl text-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/30"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </header>

      <div className="bg-surface p-8 rounded-[3rem] space-y-4 border border-gray-800 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="relative text-center space-y-1">
          <p className="text-gray-400 text-sm font-medium">القيمة الحالية لاستثماراتك</p>
          <h2 className="text-4xl font-black tracking-tight text-white">SAR {totalMarketValue.toLocaleString()}</h2>
          <div className={`inline-flex items-center space-x-2 space-x-reverse px-4 py-1 rounded-full mt-2 ${totalPL >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
            {totalPL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-bold text-sm">
              {totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString()} ({totalPLPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="h-24 w-full mt-6 opacity-30">
          <StockChart
            data={totalPL >= 0
              ? [totalCost, totalCost * 1.02, totalMarketValue * 0.98, totalMarketValue]
              : [totalCost, totalCost * 0.98, totalMarketValue * 1.02, totalMarketValue]
            }
            color={totalPL >= 0 ? '#4CAF50' : '#f84c3f'}
            showTooltip={true}
          />
        </div>
      </div>

      <section className="space-y-4 pb-10">
        <h3 className="text-lg font-bold px-1">استثماراتي ({holdings.length})</h3>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse font-medium italic">جاري جلب أداء السوق المباشر...</div>
        ) : holdings.length === 0 ? (
          <div className="bg-surface/30 border-2 border-dashed border-gray-800 p-12 rounded-[2rem] text-center text-gray-500 space-y-4">
            <p>لا توجد أسهم حالياً.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-primary font-bold underline"
            >
              أضف استثمارك الأول الآن
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {holdings.map((item) => (
              <div key={item.id} className="bg-surface/50 hover:bg-surface p-6 rounded-[2.5rem] flex justify-between items-center border border-gray-800/50 hover:border-primary/40 transition-all group shadow-xl">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-gray-800 flex items-center justify-center font-black text-primary text-2xl group-hover:scale-110 transition-transform shadow-inner overflow-hidden">
                    {getStockIcon(item.ticker)}
                  </div>
                  <div>
                    <p className="font-black text-xl text-gray-300 group-hover:text-blue-400 transition-colors">{item.stock_symbol}</p>
                    <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">{item.ticker}</p>
                    <p className="text-[12px] text-gray-300 mt-1 font-bold">{item.quantity} سهم • {item.average_purchase_price} SAR تكلفة السهم</p>
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <p className="font-black text-2xl text-white">SAR {item.total_value.toLocaleString()}</p>
                  <div className={`flex items-center justify-end text-sm font-black ${item.profit_loss >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                    <span className="text-[10px] opacity-60 ml-1">صافي</span>
                    {item.profit_loss >= 0 ? '+' : ''}{item.profit_loss.toLocaleString()}
                    <span className="mx-1">({item.pl_percentage}%)</span>
                    {item.profit_loss >= 0 ? <TrendingUp size={16} className="ml-1" /> : <TrendingDown size={16} className="ml-1" />}
                  </div>
                  <div className="flex items-center justify-end space-x-3 space-x-reverse mt-3">
                    <p className="text-[12px] text-gray-400 font-medium">السعر الحالي: {item.current_price} SAR</p>

                  </div>


                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHolding(item);
                      setShowSellModal(true);
                    }}
                    className="flex items-center space-x-1.5 space-x-reverse px-5 py-2.5 bg-gradient-to-br from-danger to-red-600 text-white rounded-xl font-black shadow-lg shadow-danger/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Tag size={14} />
                    <span >بيع</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md p-10 rounded-[3rem] border border-gray-800 space-y-8 relative shadow-2xl scale-in-center">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-8 left-8 text-gray-600 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">إضافة سهم</h2>
              <p className="text-gray-500 text-sm">أدخل تفاصيل استثمارك الجديد</p>
            </div>

            <form onSubmit={handleAddHolding} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">اختر السهم</label>
                <select
                  required
                  className="w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  value={newHolding.ticker}
                  onChange={e => handleStockSelect(e.target.value)}
                >
                  <option value="" disabled>-- اختر من القائمة --</option>
                  {SUPPORTED_STOCKS.map(stock => (
                    <option key={stock.ticker} value={stock.ticker}>{stock.name} ({stock.ticker})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">الكمية</label>
                  <input
                    type="number"
                    placeholder="0"
                    required
                    className="w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-700"
                    value={newHolding.quantity}
                    onChange={e => setNewHolding({ ...newHolding, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">سعر الشراء</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className={`w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-700 ${fetchingPrice ? 'opacity-50' : ''}`}
                      value={newHolding.average_purchase_price}
                      onChange={e => setNewHolding({ ...newHolding, average_purchase_price: e.target.value })}
                    />
                    {fetchingPrice && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary py-5 rounded-2xl font-black text-xl text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                تأكيد الإضافة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sell Holding Modal */}
      {showSellModal && selectedHolding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md p-10 rounded-[3rem] border border-gray-800 space-y-8 relative shadow-2xl scale-in-center">
            <button
              onClick={() => {
                setShowSellModal(false);
                setSelectedHolding(null);
                setSellQuantity('');
              }}
              className="absolute top-8 left-8 text-gray-600 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">بيع {selectedHolding.stock_symbol}</h2>
              <p className="text-gray-400 text-sm">لديك {selectedHolding.quantity} سهم متوفرة</p>
            </div>

            <form onSubmit={handleSellHolding} className="space-y-6">
              <div className="space-y-2">
                <label className=" text-gray-300 mr-2 uppercase tracking-widest">الكمية المراد بيعها</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    required
                    className="w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-danger/50 transition-all placeholder:text-gray-700"
                    value={sellQuantity}
                    onChange={e => setSellQuantity(e.target.value)}
                    max={selectedHolding.quantity}
                    min="0.000001"
                  />
                  <button
                    type="button"
                    onClick={() => setSellQuantity(selectedHolding.quantity.toString())}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-300 hover:text-primary-light"
                  >
                    بيع الكل
                  </button>
                </div>
              </div>

              <div className="bg-danger/5 border border-danger/10 p-4 rounded-2xl space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">القيمة التقديرية</span>
                  <span className="text-white font-bold">SAR {(parseFloat(sellQuantity || 0) * selectedHolding.current_price).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-danger to-red-600 py-5 rounded-2xl font-black  text-white shadow-xl shadow-danger/30 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                تأكيد البيع
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
