import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSelector } from 'react-redux';
const Subscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);


  const user = useSelector((state)=>state.auth.user)
  const fetchSubscribedChannels = async () => {
    try {
      const response = await api.get(`/subscriptions/u/${user._id}`); // Replace with your actual API endpoint
      console.log(" Subscribed channels fetched :" , response.data.data)
      setSubscriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };


  useEffect(() => {
    fetchSubscribedChannels();
  }, [user, user._id]); 

  const handleChannelClick = (username) => {
    navigate(`/channel/${username}`);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-center">Subscriptions</h2>
      <ul>
        {subscriptions.length > 0 ? (
          subscriptions.map((channel) => (
            <li
              key={channel.channels.id}
              className="flex items-center py-3 px-4 mb-2 bg-white rounded-lg shadow cursor-pointer"
              onClick={() => handleChannelClick(channel.channels.username)}
            >
              <img
                src={channel.channels.avatar}
                alt={channel.channels.username}
                className="w-10 h-10 rounded-full mr-4"
              />
              <span className="truncate max-w-full font-medium">{channel.channels.username}</span>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500">No subscriptions yet</li>
        )}
      </ul>
    </div>
  );
};

export default Subscriptions;
