import React, { useState, useEffect } from "react";
import { useParams, Link ,useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X ,Users } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "../components/Sidebar/Sidebar";
import api from "../services/api";
import MobileMenu from "../components/MobileMenu/MobileMenu";
import Loading from "../components/Loading/Loading"
const ChannelPage = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const response = await api.get(isLoggedIn ? `/users/c/${username}` : `/users/c/u/${username}`);
        setChannel(response.data.data);
        setSubscriberCount(response.data.data.subscribersCount);
        setIsSubscribed(response.data.data.isSubscribed);
      } catch (error) {
        toast.error(error.message || "Failed to fetch channel details");
      }
    };

    fetchChannelDetails();
  }, [username, isLoggedIn]);

  useEffect(() => {
    if (channel && channel._id) {
      const fetchChannelVideos = async () => {
        try {
          const response = await api.get(`/dashboard/videos/${channel._id}`);
          setVideos(response.data.data || []);
        } catch (error) {
          toast.error(error.message || "Failed to fetch videos");
        }
      };

      fetchChannelVideos();
    }
  }, [channel]);

  const toggleSubscription = async () => {
    try {
      const response = await api.post(`/subscriptions/c/${channel._id}`);
      if (response.status === 200) {
        const updatedResponse = await api.get(`/users/c/${username}`);
        setSubscriberCount(updatedResponse.data.data.subscribersCount);
        setIsSubscribed(updatedResponse.data.data.isSubscribed);
      }
    } catch (error) {
      toast.error(error.message || "Failed to toggle subscription");
    }
  };

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const response = await api.get(`/subscriptions/c/${channel._id}`);
    console.log("Subscribers : " , response.data.data)
      setSubscribers(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch subscribers");
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const handleOpenSubscribersModal = () => {
    setShowSubscribersModal(true);
    fetchSubscribers();
  };

  

  const SubscribersModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Subscribers</h2>
          <button onClick={() => setShowSubscribersModal(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        {isLoadingSubscribers ? (
          <p className="text-center">Loading subscribers...</p>
        ) : subscribers.length > 0 ? (
          <ul className="space-y-4">
           {subscribers
  .filter(subscriber => subscriber.subscriber && Object.keys(subscriber.subscriber).length > 0) 
  .map(subscriber => (
    <li key={subscriber.subscriber._id} className="flex items-center space-x-3">
      <img
        src={subscriber.subscriber.avatar}
        alt={subscriber.subscriber.fullname}
        className="w-10 h-10 rounded-full"
      />
      <span className="text-white">{subscriber.subscriber.fullname}</span>
    </li>
  ))}

          </ul>
        ) : (
          <p className="text-center">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
  const handleNavigation = (path) => {
    navigate(path);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!channel) return <Loading />;


  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return '00:00';
  
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
  
 
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
 
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };
  
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 md:ml-40 p-4 text-white transition-all ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
      
        <div className="md:hidden fixed top-0 left-0 z-50 p-4">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none bg-black rounded-lg p-1"
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


        
<div className="channel-details">
<div
            className="cover-image w-full h-60 bg-cover bg-center mb-4"
            style={{ backgroundImage: `url(${channel.coverImage})`  }}
          ></div>

          <div className="flex items-center mb-4">
            <img
              src={channel.avatar}
              alt={`${channel.username} avatar`}
              className="w-20 h-20 rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">{channel.username}</h1>
              <div 
                className="flex items-center text-gray-400 hover:text-white cursor-pointer transition-colors duration-200 group"
                onClick={handleOpenSubscribersModal}
              >
                <Users size={16} className="mr-1" />
                <p>{subscriberCount} subscribers</p>
              </div>
            </div>
            <button
              onClick={toggleSubscription}
              className={`ml-auto px-4 py-2 rounded-lg ${
                isSubscribed ? "bg-gray-700" : "bg-red-600"
              } text-white`}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-6 border-b-2 border-gray-700 pb-2">
            Videos
          </h1>
        
          <div className="channel-videos grid grid-cols-1 md:grid-cols-4 gap-4">
            {videos.length > 0 ? (
              videos.map((video) => (
                <Link to={`/videos/${video._id}`} key={video._id}> 
                  <div className="video-card bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-1.5 py-0.5 rounded">
                      {formatDuration(video.duration)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{video.title}</h3>
                    <p className="text-gray-400">{video.views} views</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center">
                No videos uploaded.
              </div>
            )}
          </div>
        </div>
      </div>

      {showSubscribersModal && <SubscribersModal />}
      <ToastContainer />
    </div>
  );
};

export default ChannelPage;