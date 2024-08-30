import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Edit2, Users, ThumbsUp, Video, Eye, Menu, Home, Upload, Settings, LogOut, Save , X} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import MobileMenu from '../components/MobileMenu/MobileMenu';
const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({
    likes: 0,
    subscribers: 0,
    totalVideos: 0,
    views: 0,
  });
  const [profile, setProfile] = useState({
    avatar: null,
    username: '',
    fullname: '',
    coverImage: null,
    email: '',
    channelId: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    fullname: '',
    email: '',
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

  const avatarInputRef = useRef(null);
  const coverImageInputRef = useRef(null);



  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, profileResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get("/dashboard/channelDetails")
        ]);
        
        setStats({
          likes: statsResponse.data.data.totalLikes,
          subscribers: statsResponse.data.data.totalSubscribers,
          totalVideos: statsResponse.data.data.totalVideos,
          views: statsResponse.data.data.totalViews,
        });

        setProfile({
          avatar: profileResponse.data.data.avatar,
          coverImage: profileResponse.data.data.coverImage,
          email: profileResponse.data.data.email,
          username: profileResponse.data.data.username,
          fullname: profileResponse.data.data.fullname,
          channelId: profileResponse.data.data._id,
        });

        setEditedProfile({
          fullname: profileResponse.data.data.fullname,
          email: profileResponse.data.data.email,
        });
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (profile.channelId) {
      const fetchChannelVideos = async () => {
        try {
          const response = await api.get(`/dashboard/videos/${profile.channelId}`);
          setVideos(response.data.data || []);
        } catch (error) {
          toast.error(error.message || "Failed to fetch videos");
        }
      };

      fetchChannelVideos();
    }
  }, [profile.channelId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await api.patch('/users/update-account', editedProfile);
      if (response.data.statusCode === 200) {
        setProfile(prev => ({
          ...prev,
          fullname: editedProfile.fullname,
          email: editedProfile.email,
        }));
        setIsEditing(false);
        toast.success("Account details updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update account details");
    }
  };

 
    const handleNavigation = (path) => {
      navigate(path);
    };
    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };
  


  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const response = await api.patch('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.statusCode === 200) {
        setProfile(prev => ({
          ...prev,
          avatar: response.data.data.avatar,
        }));
        toast.success("Avatar updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverImage', file);

    setIsUploadingCover(true);
    try {
      const response = await api.patch('/users/cover-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.statusCode === 200) {
        setProfile(prev => ({
          ...prev,
          coverImage: response.data.data.coverImage,
        }));
        toast.success("Cover image updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update cover image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const response = await api.get(`/subscriptions/c/${profile.channelId}`);
      console.log("Subscribers : " , response.data.data)
      setSubscribers(response.data.data || []);
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
          <h2 className="text-xl font-bold">Subscribers</h2>
          <button onClick={() => setShowSubscribersModal(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        {isLoadingSubscribers ? (
          <p className="text-center">Loading subscribers...</p>
        ) : subscribers.length > 0 ? (
          <ul className="space-y-4">
            {subscribers.map((subscriber) => (
              <li key={subscriber.subscriber._id} className="flex items-center space-x-3">
                <img src={subscriber.subscriber.avatar} alt={subscriber.subscriber.fullname} className="w-10 h-10 rounded-full" />
                <span>{subscriber.subscriber.fullname}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No subscribers yet.</p>
        )}
      </div>
    </div>
  );  

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
    <Sidebar />

    <div className="flex-1">
        {/* Hamburger menu for mobile */}
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

        <div className="p-6 mt-12 md:mt-0 md:ml-[8rem]">
          <div className="relative w-full h-60 bg-cover bg-center mb-4 rounded-lg overflow-hidden" 
               style={{ backgroundImage: `url(${profile.coverImage})` }}>
            <input
              type="file"
              ref={coverImageInputRef}
              onChange={handleCoverImageChange}
              className="hidden"
              accept="image/*"
            />
            <button 
              onClick={() => coverImageInputRef.current.click()}
              className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded"
              disabled={isUploadingCover}
            >
              {isUploadingCover ? 'Uploading...' : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Cover
                </>
              )}
            </button>
          </div>

          <div className="flex flex-row items-start space-x-4 mb-8">
            <div className="relative flex-shrink-0">
              <img src={profile.avatar} alt={profile.username} className="w-24 h-24 rounded-full" />
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
              <button 
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-white text-black rounded-full p-1"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <span className="text-xs">Uploading...</span>
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex-grow">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="fullname"
                    value={editedProfile.fullname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 rounded text-white"
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 rounded text-white"
                    placeholder="Email"
                  />
                  <button 
                    onClick={handleSave}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">{profile.fullname}</h1>
                    <button 
                      onClick={handleEdit}
                      className="text-white bg-transparent hover:bg-gray-700 p-1 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-lg text-gray-400">@{profile.username}</p>
                  <p className="text-sm text-gray-400 mt-1">{profile.email}</p>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer" onClick={handleOpenSubscribersModal}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Subscribers</span>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.subscribers}</div>
          </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Likes</span>
                <ThumbsUp className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{stats.likes}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Videos</span>
                <Video className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total Views</span>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{stats.views}</div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your Videos</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {videos.length > 0 ? (
    videos.map((video) => (
      <Link to={`/videos/${video._id}`} key={video._id} className="block">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="relative">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-40 object-cover"
            />
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-1.5 py-0.5 rounded">
              {video.duration?.toFixed(2)}
            </span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold line-clamp-2">{video.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{video.views} views</p>
          </div>
        </div>
      </Link>
    ))
  ) : (
    <div className="col-span-full text-center text-gray-400">
      No videos uploaded yet.
    </div>
  )}
</div>

        </div>
        {showSubscribersModal && <SubscribersModal />}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Dashboard; 