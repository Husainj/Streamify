import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { Menu } from "lucide-react";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
const ChannelPage = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [videos, setVideos] = useState([]);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        if(isLoggedIn){
          const response = await api.get(`/users/c/${username}`);
        console.log("Channel details:", response.data.data);
        setChannel(response.data.data);
        setSubscriberCount(response.data.data.subscribersCount);
        console.log("Is subscribed ?? : " ,response.data.data.isSubscribed )
        setIsSubscribed(response.data.data.isSubscribed);
        }
        else{

        
        const response = await api.get(`/users/c/u/${username}`);
        console.log("Channel details:", response.data.data);
        setChannel(response.data.data);
        setSubscriberCount(response.data.data.subscribersCount);
        console.log("Is subscribed ?? : " ,response.data.data.isSubscribed )
        setIsSubscribed(response.data.data.isSubscribed);
      }
      } catch (error) {
        toast.error(error.message || "Failed to fetch channel details");
      }
    };

    fetchChannelDetails();
  }, [username]);

  useEffect(() => {
    if (channel && channel._id) {
      const fetchChannelVideos = async () => {
        try {
          const response = await api.get(`/dashboard/videos/${channel._id}`);
          console.log(
            "Videos of channel dashboard fetched:",
            response.data.data
          );
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
      console.log("Subscription toggled:", response.status);

      if (response.status === 200) {
        const updatedResponse = await api.get(`/users/c/${username}`);
        console.log("Subscriber count updated:", updatedResponse);
        setSubscriberCount(updatedResponse.data.data.subscribersCount);
        setIsSubscribed(updatedResponse.data.data.isSubscribed);
      }
    } catch (error) {
      toast.error(error.message || "Failed to toggle subscription");
    }
  };

  if (!channel) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div
        className={`flex-1 md:ml-40 p-4 text-white transition-all ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Hamburger Menu for Mobile */}
        <button
          className="mr-4 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} />
        </button>
        {isMenuOpen && (
          <div className="mt-4 lg:hidden">
            <nav>
              <a href="/" className="block py-2">
                Home
              </a>
              <a href="#" className="block py-2">
                Convo
              </a>
              <a href="#" className="block py-2">
                Subscriptions
              </a>
              <a href="#" className="block py-2">
                You
              </a>
            </nav>
          </div>
        )}

        {/* Channel Details */}
        <div className="channel-details">
          <div
            className="cover-image w-full h-60 bg-cover bg-center mb-4"
            style={{ backgroundImage: `url(${channel.coverImage})` }}
          >
            {/* Optional overlay */}
          </div>
          <div className="flex items-center mb-4">
            <img
              src={channel.avatar}
              alt={`${channel.username} avatar`}
              className="w-20 h-20 rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">{channel.username}</h1>
              <p className="text-gray-400">{subscriberCount} subscribers</p>
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

          {/* Channel Videos */}
        
          <h1 className="text-3xl font-bold text-white mb-6 border-b-2 border-gray-700 pb-2">
            Videos
          </h1>
        
          <div className="channel-videos grid grid-cols-1 md:grid-cols-4 gap-4">
            {videos.length > 0 ? (
              videos.map((video) => (
                <Link to={`/videos/${video._id}`}> 
                <div
                  key={video._id}
                  className="video-card bg-gray-800 p-4 rounded-lg shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-1.5 py-0.5 rounded">
                      {video.duration?.toFixed(2)}
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

      <ToastContainer />
    </div>
  );
};

export default ChannelPage;
