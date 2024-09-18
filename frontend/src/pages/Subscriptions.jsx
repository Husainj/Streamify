import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { User,Menu,  Bell, Settings } from 'lucide-react';
import MobileMenu from '../components/MobileMenu/MobileMenu';
const Subscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  
  const fetchSubscribedChannels = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/subscriptions/u/${user._id}`);
      setSubscriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels();
  }, [user._id]);

  const handleChannelClick = (username) => {
    navigate(`/channel/${username}`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-black p-4   sticky top-0 z-10">
       
        <div className="flex space-x-4">
        <div className="md:hidden fixed top-0 left-0 z-50 p-4">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>

        {isMobileMenuOpen && (
        <MobileMenu
          onClose={() => setIsMobileMenuOpen(false)}
          onNavigate={handleNavigation}
        />
      )}
        </div>
        <h1 className="text-xl font-bold text-center">Subscriptions</h1>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : subscriptions.length > 0 ? (
          <ul className="space-y-4">
            {subscriptions.map((channel) => (
              <li
                key={channel.channels.id}
                className="flex items-center p-3 bg-gray-800 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                onClick={() => handleChannelClick(channel.channels.username)}
              >
                {channel.channels.avatar ? (
                  <img
                    src={channel.channels.avatar}
                    alt={channel.channels.username}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-4 bg-gray-600 flex items-center justify-center">
                    <User size={24} />
                  </div>
                )}
                <div className="flex-grow">
                  <h2 className="font-semibold text-lg">{channel.channels.username}</h2>
                 
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center mt-12">
            <p className="text-xl text-gray-400 mb-4">No subscriptions yet</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
            >
             Watch Videos on Video Feed!
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Subscriptions;