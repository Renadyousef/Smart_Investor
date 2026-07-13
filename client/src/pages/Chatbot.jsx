import { useState } from 'react';
import { Send, Bot, User, ArrowRight } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك في سوق الأسهم اليوم؟', isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: 'أنا أقوم بتحليل البيانات حالياً... سأقوم بالرد عليك قريباً بناءً على نماذج LSTM الخاصة بنا.',
        isBot: true
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-background max-w-lg mx-auto w-full">
      <header className="p-4 border-b border-gray-800 flex items-center space-x-3 space-x-reverse">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="text-primary" />
        </div>
        <div>
          <h1 className="font-bold">المساعد الذكي</h1>
          <div className="flex items-center space-x-1 space-x-reverse">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span className="text-[10px] text-gray-500">متصل الآن</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} items-end space-x-2 space-x-reverse`}>
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.isBot
              ? 'bg-surface text-white rounded-br-none'
              : 'bg-primary text-white rounded-bl-none'
            }`}>
              {msg.text}
            </div>
            {!msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-surface border-t border-gray-800">
        <div className="flex space-x-2 space-x-reverse mb-3 overflow-x-auto pb-2">
            <QuickAction text="تحليل أرامكو" />
            <QuickAction text="توصيات اليوم" />
            <QuickAction text="أداء المحفظة" />
        </div>
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            className="w-full bg-background border border-gray-700 rounded-2xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="اكتب رسالتك هنا..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute left-2 top-1.5 p-1.5 bg-primary rounded-xl text-white hover:bg-opacity-90 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const QuickAction = ({ text }) => (
  <button className="whitespace-nowrap bg-background border border-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all flex items-center">
    {text}
    <ArrowRight size={12} className="mr-1 rotate-180" />
  </button>
);

export default Chatbot;
