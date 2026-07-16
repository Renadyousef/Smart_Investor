import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowRight, Loader2 } from 'lucide-react';
import { chatService } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك في سوق الأسهم اليوم؟ يمكنك سؤالي عن تحليل الشركات أو التقارير المالية.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const newUserMessage = { id: Date.now(), text: textToSend, isBot: false };
    setMessages(prev => [...prev, newUserMessage]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(textToSend);
      const botResponse = {
        id: Date.now() + 1,
        text: response.data.answer,
        isBot: true
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى التأكد من تشغيل الخادم وتوفر مفتاح NVIDIA API.',
        isBot: true,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background max-w-lg mx-auto w-full border-x border-gray-800">
      <header className="p-4 border-b border-gray-800 flex items-center space-x-3 space-x-reverse bg-surface/50 backdrop-blur-md">
        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
          <Bot className="text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg">المساعد الذكي</h1>
          <div className="flex items-center space-x-1 space-x-reverse">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span className="text-[10px] text-gray-500 font-medium">متصل بنماذج NVIDIA AI</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} items-end space-x-2 space-x-reverse animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {msg.isBot && (
              <div className="w-8 h-8 rounded-xl bg-surface border border-gray-800 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.isBot
              ? msg.isError ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-surface text-gray-200 border border-gray-800 rounded-br-none'
              : 'bg-primary text-white shadow-lg shadow-primary/20 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
            {!msg.isBot && (
              <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-primary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center space-x-2 space-x-reverse animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-surface border border-gray-800 flex items-center justify-center">
                <Bot size={16} className="text-primary animate-bounce" />
            </div>
            <div className="bg-surface/50 border border-gray-800 p-3 rounded-2xl rounded-br-none flex items-center space-x-2 space-x-reverse">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span className="text-xs text-gray-500 font-medium italic">جاري تحليل التقارير المالية...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface border-t border-gray-800">
        <div className="flex space-x-2 space-x-reverse mb-4 overflow-x-auto pb-2 no-scrollbar">
            <QuickAction text="تحليل سهم أرامكو" onClick={() => handleSend(null, "قدم لي تحليلاً مالياً لسهم أرامكو بناءً على آخر التقارير")} />
            <QuickAction text="توصيات اليوم" onClick={() => handleSend(null, "ما هي أهم التوصيات الاستثمارية لليوم؟")} />
            <QuickAction text="أداء السوق" onClick={() => handleSend(null, "كيف هو أداء سوق الأسهم السعودي بشكل عام؟")} />
        </div>
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            className="w-full bg-background border border-gray-700 group-focus-within:border-primary rounded-[1.2rem] py-4 pr-4 pl-14 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-gray-600"
            placeholder="اكتب رسالتك هنا..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`absolute left-2.5 top-2.5 p-2 rounded-xl text-white transition-all shadow-lg ${
                loading || !input.trim()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-primary hover:bg-opacity-90 active:scale-95 shadow-primary/20'
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

const QuickAction = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="whitespace-nowrap bg-background border border-gray-800 rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center font-medium group"
  >
    {text}
    <Bot size={12} className="mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
  </button>
);

export default Chatbot;
