import React from 'react';
import { Bell, AlertCircle, Info, Lightbulb } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'تنبيه مخاطر',
    body: 'سهم سابك انخفض بنسبة 2% اليوم، نوصي بالحذر.',
    time: 'منذ 10 دقائق',
    type: 'warning',
    icon: <AlertCircle className="text-danger" />
  },
  {
    id: '2',
    title: 'توصية جديدة',
    body: 'تم تحديث توصية سهم أرامكو إلى "KEEP" بناءً على التحليل الأخير.',
    time: 'منذ ساعة',
    type: 'recommendation',
    icon: <Lightbulb className="text-primary" />
  },
  {
    id: '3',
    title: 'أداء المحفظة',
    body: 'حققت محفظتك نمواً بنسبة 1.5% خلال الـ 24 ساعة الماضية.',
    time: 'منذ 3 ساعات',
    type: 'info',
    icon: <Info className="text-success" />
  }
];

const Notifications = () => {
  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">التنبيهات</h1>
        <div className="relative">
          <Bell className="text-gray-400" />
          <span className="absolute -top-1 -right-1 bg-danger w-2 h-2 rounded-full"></span>
        </div>
      </header>

      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-2xl flex space-x-4 space-x-reverse border ${
              notif.type === 'warning' ? 'bg-danger/5 border-danger/20' : 'bg-surface border-gray-800'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              notif.type === 'warning' ? 'bg-danger/10' : 'bg-background'
            }`}>
              {notif.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm">{notif.title}</h4>
                <span className="text-[10px] text-gray-500">{notif.time}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {notif.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
