import React, { useState, useEffect , useRef , useCallback } from 'react';
import { Link, useParams ,useNavigate  } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '../Sidebar/Sidebar';
import { Edit, Menu, Trash, Heart, Eye, Home, Upload, Settings, LogOut } from "lucide-react";
import 'react-toastify/dist/ReactToastify.css';
import MobileMenu from '../MobileMenu/MobileMenu';


const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [updatedCommentText, setUpdatedCommentText] = useState('');

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 

  const [isSubscribed , setIsSubscribed] = useState(false)
  const [channelAvatar , setChannelAvatar] = useState(null)
  const [subscriberCount , SetSubscriberCount] = useState(0)

  const [views, setViews] = useState(0);
  const videoRef = useRef(null);
  const viewIncrementedRef = useRef(false);

  
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state)=>state.auth.user)

const navigate = useNavigate();


useEffect(() => {
  const fetchVideoDetails = async () => {
    try {
      const response = await api.get(`/videos/${id}`);
      console.log("Video details : ", response.data.data);
      setVideo(response.data.data);
      setViews(response.data.data.views);
    } catch (error) {
      toast.error(error.response.data);
    }
  };

  fetchVideoDetails();
  viewIncrementedRef.current = false;
}, [id]);

useEffect(() => {
  if (video) {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/${id}`);
        const commentsWithOwnership = response.data.data.comments.map((comment) => ({
          ...comment,
          isOwner: comment.owner._id === user._id,
        }));
        setComments(commentsWithOwnership);
      } catch (error) {
        toast.error(error.response.data);
      }
    };

    const fetchLikes = async () => {
      try {
        if (isLoggedIn) {
          const response = await api.get(`/likes/getLikes/${id}`);
          setLikes(response.data.data.likeCount);
          setIsLiked(response.data.data.isLiked);
        } else {
          const response = await api.get(`/likes/getLikes/u/${id}`);
          setLikes(response.data.data.likeCount);
          setIsLiked(response.data.data.isLiked);
        }
      } catch (error) {
        toast.error(error.response.data);
      }
    };

    const fetchChannelDetails = async () => {
      try {
        if (isLoggedIn) {
          const response = await api.get(`/users/c/${video.owner.username}`);
          setChannelAvatar(response.data.data.avatar);
          SetSubscriberCount(response.data.data.subscribersCount);
          setIsSubscribed(response.data.data.isSubscribed);
        } else {
          const response = await api.get(`/users/c/u/${video.owner.username}`);
          setChannelAvatar(response.data.data.avatar);
          SetSubscriberCount(response.data.data.subscribersCount);
          setIsSubscribed(response.data.data.isSubscribed);
        }
      } catch (error) {
        toast.error(error);
      }
    };

    fetchComments();
    fetchLikes();
    fetchChannelDetails();
  }
}, [id, user._id, video, isLoggedIn]);

  const incrementViewCount = useCallback(async () => {
    if (!viewIncrementedRef.current) {
      try {
        const response = await api.patch(`/videos/views/${id}`);
        console.log("Views Response : ", response);
        setViews(prevViews => prevViews + 1);
        viewIncrementedRef.current = true;
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    }
  }, [id]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !viewIncrementedRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const percentageWatched = (currentTime / duration) * 100;

      if (percentageWatched >= 25) {
        incrementViewCount();
      }
    }
  }, [incrementViewCount]);



  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      currentVideoRef.addEventListener('timeupdate', handleTimeUpdate);
  
      return () => {
        currentVideoRef.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [handleTimeUpdate]);



  const handleAddComment = async () => {
    try {
      const response = await api.post(`/comments/${id}`, { content: newComment });
      const newCommentData = {
        _id: response.data.data._id, // Ensure you use the new comment's ID
        content: response.data.data.content,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
        isOwner: true,
      };
      
      // Update comments immediately without needing to refresh
      setComments([newCommentData, ...comments]);
      setNewComment(''); // Clear the input field
      toast.success('Comment added successfully');
    } catch (error) {
      if(error.response.status === 420) {
        toast.error("Please Login!");
      }
      console.log(error);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const response = await api.patch(`/comments/c/${commentId}`, { content: updatedCommentText });
  
      // Update the comments list with the updated comment
      const updatedComments = comments.map((comment) =>
        comment._id === commentId
          ? { ...comment, content: response.data.data.content } // Update the comment's content
          : comment
      );
  
      setComments(updatedComments); // Set the updated list to trigger re-render
      setEditingComment(null);
      setUpdatedCommentText(''); // Clear the input field
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error(error.response.data);
    }
  };
  

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await api.delete(`/comments/c/${commentId}`);
      toast.success(response.data.message);
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      toast.error(error.response.data);
    }
  };

  const toggleLike = async () => {
    try {
      const response = await api.post(`/likes/toggle/v/${id}`);
      if (response.status === 200) {
        const updatedLikes = await api.get(`likes/getLikes/${id}`);
        console.log("Likes updated resposne : ",updatedLikes)
        setIsLiked(updatedLikes.data.data.isLiked);
        setLikes(updatedLikes.data.data.likeCount);
      }
    } catch (error) {
      if(error.response.status === 420) {
        toast.error("Please Login!");
      }
      console.log(error)
    }
  };

  const toggleSubscription = async()=>{
    try {
      const response = await api.post(`/subscriptions/c/${video.owner._id}`);
      console.log(" Subscription toggled : " , response.status)
     
      if(response.status === 200){
       
        const response = await api.get(`/users/c/${video.owner.username}`)
   console.log("Subscriber count updated : " , response)
       SetSubscriberCount(response.data.data.subscribersCount)
       setIsSubscribed(response.data.data.isSubscribed)
      console.log("Channel details : " , response.data.data)
      }
    } catch (error) {
      if(error.response.status === 420) {
        toast.error("Please Login!");
      }
      console.log(error)
    }
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading video...</div>;
  }
 

  
  const handleNavigation = (path) => {
    navigate(path);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };






  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 md:ml-40 p-6 text-white transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Mobile Hamburger Menu */}
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

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Video Player and Info */}
          <div className="lg:w-2/3">
            <div className="video-container mb-6">
            <video
                ref={videoRef}
                src={video.videoFile}
                controls
                className="w-full rounded-lg shadow-lg mb-4"
                style={{ aspectRatio: '16/9' }}
                onTimeUpdate={handleTimeUpdate} 
              ></video>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">{video.title}</h2>
              <div className="flex items-center justify-between mb-4">
  {/* Channel Info */}
  <Link  to={`/channel/${video.owner.username}`} >
  <div className="flex items-center">
    {/* Channel Avatar */}
    {channelAvatar && (
      <img
        src={channelAvatar}
        alt={`${video.owner.fullname}'s avatar`}
        className="w-12 h-12 rounded-full mr-4"
      />
    )}
    {/* Channel Name and Subscriber Count */}
    <div>
      <h3 className="text-lg lg:text-xl text-white font-semibold">{video.owner.username}</h3>
      <p className="text-sm lg:text-base text-gray-400">{subscriberCount} subscribers</p>
    </div>
  </div>
  </Link>
  {/* Subscribe Button */}
  <button
    onClick={toggleSubscription}
    className={`px-4 py-2 rounded-lg font-semibold ${isSubscribed ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'}`}
  >
    {isSubscribed ? 'Subscribed' : 'Subscribe'}
  </button>
</div>

<div className="lg:hidden mb-4">
                <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center space-x-2 ${
                      isLiked ? 'text-red-500' : 'text-gray-400'
                    } hover:text-red-500 transition-colors duration-200`}
                  >
                    <Heart
                      size={24}
                      fill={isLiked ? 'currentColor' : 'none'}
                      className="transition-transform duration-200 transform hover:scale-110"
                    />
                    <span className="text-lg font-semibold">{likes.toLocaleString()}</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Eye size={24} />
                    <span className="text-lg font-semibold">{views.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm lg:text-base mb-4 leading-relaxed border-t-2 border-gray-700 pt-2">{video.description}</p>
            </div>
          </div>

          {/* Like & Comments Section */}
          <div className="lg:w-1/3">
            {/* Views and Likes - Original position for large screens */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                <button
                  onClick={toggleLike}
                  className={`flex items-center space-x-2 ${
                    isLiked ? 'text-red-500' : 'text-gray-400'
                  } hover:text-red-500 transition-colors duration-200`}
                >
                  <Heart
                    size={24}
                    fill={isLiked ? 'currentColor' : 'none'}
                    className="transition-transform duration-200 transform hover:scale-110"
                  />
                  <span className="text-lg font-semibold">{likes.toLocaleString()}</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Eye size={24} />
                  <span className="text-lg font-semibold">{views.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="comments-section">
              <h3 className="text-xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Comments</h3>

              {/* Add Comment Section */}
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="mt-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                >
                  Comment
                </button>
              </div>

              {/* Edit Comment Section */}
              {editingComment && (
                <div className="mb-4">
                  <textarea
                    value={updatedCommentText}
                    onChange={(e) => setUpdatedCommentText(e.target.value)}
                    placeholder="Update your comment..."
                    className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleUpdateComment(editingComment)}
                      className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Display Comments */}
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="flex items-start mt-4 p-3 bg-gray-800 rounded-lg">
                    {comment.owner.avatar && (
                      <img
                        src={comment.owner.avatar}
                        alt={`${comment.owner.username}'s avatar`}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm lg:text-base break-words">
                        <strong>{comment.owner.username}</strong>: {comment.content}
                      </p>
                      {comment.isOwner && (
                        <div className="mt-2 flex space-x-3">
                          <Edit
                            size={16}
                            onClick={() => {
                              setEditingComment(comment._id);
                              setUpdatedCommentText(comment.content);
                            }}
                            className="text-blue-500 cursor-pointer hover:text-blue-600 transition"
                          />
                          <Trash
                            size={16}
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500 cursor-pointer hover:text-red-600 transition"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VideoDetail;
