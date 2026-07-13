import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import StockChart from '../components/StockChart';
import { portfolioService } from '../services/api';

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolding, setNewHolding] = useState({
    stock_symbol: '',
    ticker: '',
    quantity: '',
    average_purchase_price: ''
  });

  const fetchHoldings = async () => {
    try {
      const response = await portfolioService.getHoldings();
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

  const totalValue = holdings.reduce((sum, item) => sum + (item.quantity * item.average_purchase_price), 0);

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold">محفظتي</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-primary rounded-full text-white hover:bg-opacity-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="bg-surface p-6 rounded-3xl space-y-4 border border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl"></div>
        <div className="relative text-center">
          <p className="text-gray-400 text-sm">إجمالي القيمة المستثمرة</p>
          <h2 className="text-4xl font-black mt-1">SAR {totalValue.toLocaleString()}</h2>
        </div>

        <div className="h-20 w-full mt-4 opacity-30">
          <StockChart
            data={[25000, 26000, 25500, 28000, 27500, 30000]}
            color="#6C63FF"
          />
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">استثماراتي ({holdings.length})</h3>

        {loading ? (
          <div className="text-center py-10 text-gray-500">جاري تحميل المحفظة...</div>
        ) : holdings.length === 0 ? (
          <div className="bg-surface/30 border border-dashed border-gray-700 p-10 rounded-2xl text-center text-gray-500">
            لا توجد أسهم حالياً. اضغط على + لإضافة استثمارك الأول.
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((item) => (
              <div key={item.id} className="bg-surface p-4 rounded-2xl flex justify-between items-center border border-gray-800/50 hover:border-primary/30 transition-all group">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 rounded-full bg-background border border-gray-800 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                    {item.ticker[0]}
                  </div>
                  <div>
                    <p className="font-bold">{item.stock_symbol}</p>
                    <p className="text-[10px] text-gray-600 font-mono">{item.ticker}</p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-bold">{(item.quantity * item.average_purchase_price).toLocaleString()} SAR</p>
                  <p className="text-[10px] text-gray-500 text-right">{item.quantity} سهم</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-surface w-full max-w-md p-8 rounded-[2.5rem] border border-gray-800 space-y-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 left-6 text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center">إضافة سهم للمحفظة</h2>

            <form onSubmit={handleAddHolding} className="space-y-4">
              <input
                type="text"
                placeholder="اسم السهم (مثال: أرامكو)"
                required
                className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                value={newHolding.stock_symbol}
                onChange={e => setNewHolding({...newHolding, stock_symbol: e.target.value})}
              />
              <input
                type="text"
                placeholder="الرمز (مثال: 2222.SR)"
                required
                className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                value={newHolding.ticker}
                onChange={e => setNewHolding({...newHolding, ticker: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="الكمية"
                  required
                  className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={newHolding.quantity}
                  onChange={e => setNewHolding({...newHolding, quantity: e.target.value})}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="متوسط التكلفة"
                  required
                  className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={newHolding.average_purchase_price}
                  onChange={e => setNewHolding({...newHolding, average_purchase_price: e.target.value})}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all"
              >
                إضافة للمحفظة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
