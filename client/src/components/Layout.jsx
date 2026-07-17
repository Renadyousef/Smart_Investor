import React from 'react';
import { Home, Wallet, Bell, MessageSquare, BarChart2 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col w-full pb-20">
      <main className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-lg border-t border-gray-800 px-6 py-3 flex justify-around items-center z-50 sm:max-w-4xl sm:mx-auto sm:rounded-t-3xl">
        <NavItem to="/" icon={<Home />} label="الرئيسية" />
        <NavItem to="/portfolio" icon={<Wallet />} label="المحفظة" />
        <NavItem to="/notifications" icon={<Bell />} label="التنبيهات" />
        <NavItem to="/chatbot" icon={<MessageSquare />} label="المساعد" />
        <NavItem to="/compare" icon={<BarChart2 />} label="المقارنة" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center space-y-1 transition-colors ${
        isActive ? 'text-blue-300' : 'text-gray-500'
      }`
    }
  >
    {React.cloneElement(icon, { size: 24 })}
    <span className="text-[14px] font-medium">{label}</span>
  </NavLink>
);

export default Layout;
