import { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Tag } from 'lucide-react';
import StockChart from '../components/StockChart';
import { portfolioService } from '../services/api';

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold tracking-tight">محفظتي</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-primary rounded-2xl text-white hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={28} />
        </button>
      </header>

      <div className="bg-surface p-8 rounded-[2.5rem] space-y-4 border border-gray-800 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="relative text-center space-y-1">
          <p className="text-gray-400 text-sm font-medium">القيمة السوقية الإجمالية</p>
          <h2 className="text-4xl font-black tracking-tight text-white">SAR {totalMarketValue.toLocaleString()}</h2>
          <div className={`inline-flex items-center space-x-2 space-x-reverse px-4 py-1 rounded-full mt-2 ${
            totalPL >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {totalPL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-bold text-sm">
              {totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString()} ({totalPLPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="h-24 w-full mt-6 opacity-30">
          <StockChart
            data={[totalCost * 0.9, totalCost * 0.95, totalMarketValue * 0.98, totalMarketValue]}
            color={totalPL >= 0 ? '#4CAF50' : '#F44336'}
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
              <div key={item.id} className="bg-surface/50 hover:bg-surface p-5 rounded-[1.8rem] flex justify-between items-center border border-gray-800/50 hover:border-primary/40 transition-all group">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-gray-800 flex items-center justify-center font-black text-primary text-xl group-hover:scale-110 transition-transform shadow-inner">
                    {item.ticker[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-100 group-hover:text-primary transition-colors">{item.stock_symbol}</p>
                    <p className="text-[10px] text-gray-600 font-mono tracking-wider uppercase">{item.ticker}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">{item.quantity} سهم @ {item.average_purchase_price} SAR</p>
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <p className="font-black text-lg text-white">SAR {item.total_value.toLocaleString()}</p>
                  <div className={`flex items-center justify-end text-xs font-bold ${
                    item.profit_loss >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {item.profit_loss >= 0 ? '+' : ''}{item.profit_loss.toLocaleString()}
                    <span className="mx-1">({item.pl_percentage}%)</span>
                    {item.profit_loss >= 0 ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />}
                  </div>
                  <div className="flex items-center justify-end space-x-3 space-x-reverse mt-3">
                    <p className="text-[10px] text-gray-600 font-medium">السعر الحالي: {item.current_price} SAR</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHolding(item);
                        setShowSellModal(true);
                      }}
                      className="flex items-center space-x-1.5 space-x-reverse px-5 py-2.5 bg-gradient-to-br from-danger to-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-danger/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Tag size={14} />
                      <span>بيع</span>
                    </button>
                  </div>
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
                <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">اسم الشركة</label>
                <input
                    type="text"
                    placeholder="مثال: أرامكو السعودية"
                    required
                    className="w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-700"
                    value={newHolding.stock_symbol}
                    onChange={e => setNewHolding({...newHolding, stock_symbol: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">الرمز (Ticker)</label>
                <input
                    type="text"
                    placeholder="مثال: 2222.SR"
                    required
                    className="w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-700"
                    value={newHolding.ticker}
                    onChange={e => setNewHolding({...newHolding, ticker: e.target.value})}
                />
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
                        onChange={e => setNewHolding({...newHolding, quantity: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">سعر الشراء</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="w-full bg-background border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-700"
                        value={newHolding.average_purchase_price}
                        onChange={e => setNewHolding({...newHolding, average_purchase_price: e.target.value})}
                    />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary py-5 rounded-2xl font-black text-lg text-white shadow-xl shadow-primary/30 hover:bg-opacity-90 active:scale-95 transition-all mt-4"
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
                <p className="text-gray-500 text-sm">لديك {selectedHolding.quantity} سهم متوفرة</p>
            </div>

            <form onSubmit={handleSellHolding} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-widest">الكمية المراد بيعها</label>
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-light"
                    >
                        بيع الكل
                    </button>
                </div>
              </div>

              <div className="bg-danger/5 border border-danger/10 p-4 rounded-2xl space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">القيمة التقديرية</span>
                    <span className="text-white font-bold">SAR {(parseFloat(sellQuantity || 0) * selectedHolding.current_price).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-danger py-5 rounded-2xl font-black text-lg text-white shadow-xl shadow-danger/30 hover:bg-opacity-90 active:scale-95 transition-all mt-4"
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
