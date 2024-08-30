import React from "react";
import { Home, Upload, Users, User, X } from "lucide-react";

const MobileMenu = ({ onClose, onNavigate }) => {
  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/convo', label: 'Convo', icon: Upload },
    { path: '/m/subscriptions', label: 'Subscriptions', icon: Users },
    { path: '/dashboard', label: 'You', icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        <X size={24} />
      </button>
      <nav className="flex flex-col items-center space-y-6">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              onNavigate(item.path);
              onClose();
            }}
            className="flex items-center text-white text-xl"
          >
            <item.icon className="mr-2" size={24} /> {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobileMenu;