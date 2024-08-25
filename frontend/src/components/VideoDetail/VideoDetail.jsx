import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '../Sidebar/Sidebar';
import { Edit, Menu, Trash, Heart } from "lucide-react";
import 'react-toastify/dist/ReactToastify.css';

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [updatedCommentText, setUpdatedCommentText] = useState('');

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isSubscribed , setIsSubscribed] = useState(false)
  const [channelAvatar , setChannelAvatar] = useState(null)
  const [subscriberCount , SetSubscriberCount] = useState(0)



  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        console.log("Video details : " , response.data.data)
        setVideo(response.data.data);
      } catch (error) {
        toast.error(error.response.data);
      }
    };

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
        const response = await api.get(`likes/getLikes/${id}`);
        setIsLiked(response.data.data.isLiked);
        setLikes(response.data.data.likeCount);
      } catch (error) {
        toast.error(error.response.data);
      }
    };

   const fetchChannelDetails = async () => {
    try {
      const response = await api.get(`/users/c/${video.owner.username}`)
        setChannelAvatar(response.data.data.avatar)
       SetSubscriberCount(response.data.data.subscribersCount)
       setIsSubscribed(response.data.data.isSubscribed)
      console.log("Channel details : " , response.data.data)
    } catch (error) {
      toast.error(error)
    }
   }

    fetchVideoDetails();
    fetchComments();
    fetchLikes();
    fetchChannelDetails();
  }, [id, user._id ,  video && video.owner.username]);

  const handleAddComment = async () => {
    try {
      const response = await api.post(`/comments/${id}`, { content: newComment });
      const newCommentData = {
        content: response.data.data.content,
        owner: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
        isOwner: true,
      };
      setComments([newCommentData, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.response.data);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const response = await api.patch(`/comments/c/${commentId}`, { content: updatedCommentText });
      setComments(
        comments.map((comment) =>
          comment._id === commentId ? { ...response.data.data, isOwner: true } : comment
        )
      );
      setEditingComment(null);
      setUpdatedCommentText('');
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
        setIsLiked(updatedLikes.data.data.isLiked);
        setLikes(updatedLikes.data.data.likeCount);
      }
    } catch (error) {
      toast.error(error.response.data);
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
      toast.error(error)
    }
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading video...</div>;
  }

  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 md:ml-40 p-6 text-white transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Mobile Hamburger Menu */}
        <button className="lg:hidden mb-4" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={24} />
        </button>
        {isMenuOpen && (
          <div className="lg:hidden mb-4">
            <nav>
              <a href="/" className="block py-2">Home</a>
              <a href="#" className="block py-2">Convo</a>
              <a href="#" className="block py-2">Subscriptions</a>
              <a href="#" className="block py-2">You</a>
            </nav>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Video Player and Info */}
          <div className="lg:w-2/3">
            <div className="video-container mb-6">
              <video
                src={video.videoFile}
                controls
                className="w-full rounded-lg shadow-lg mb-4"
                style={{ aspectRatio: '16/9' }}
              ></video>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">{video.title}</h2>
              <div className="flex items-center justify-between mb-4">
  {/* Channel Info */}
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

  {/* Subscribe Button */}
  <button
    onClick={toggleSubscription}
    className={`px-4 py-2 rounded-lg font-semibold ${isSubscribed ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'}`}
  >
    {isSubscribed ? 'Subscribed' : 'Subscribe'}
  </button>
</div>

              <p className="text-sm lg:text-base mb-4 leading-relaxed">{video.description}</p>
            </div>
          </div>

          {/* Like & Comments Section */}
          <div className="lg:w-1/3">
            <div className="mb-6">
              <button
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                onClick={toggleLike}
              >
                {isLiked ? "❤️" : "🤍"}  <span> {likes} Likes</span>
              </button>
            </div>

            <div className="comments-section">
              <h3 className="text-xl font-semibold mb-4">Comments</h3>

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
