import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '../Sidebar/Sidebar';
import {Edit, Menu, Trash} from "lucide-react"
const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [updatedCommentText, setUpdatedCommentText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        console.log("Videosssssss: " , response.data.data)
        setVideo(response.data.data);
      } catch (error) {
        toast.error(error.response.data);
        console.error('Error fetching video details:', error);
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
        console.error('Error fetching comments:', error);
      }
    };

    fetchVideoDetails();
    fetchComments();
  }, [id, user._id]);

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
      console.error('Error adding comment:', error);
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
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await api.delete(`/comments/c/${commentId}`);
      toast.success(response.data.message);
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      toast.error(error.response.data);
      console.error('Error deleting comment:', error);
    }
  };

  if (!user || !comments) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex bg-gray-900">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
     
      {/* Main Content */}
      <div className={`flex-1 md:ml-40 p-4 bg-gray-900 text-white transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Hamburger Menu for Mobile */}
        <button className="mr-4 lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
          {isMenuOpen && (
        <div className="mt-4 lg:hidden">
          <nav>
            <a href="/" className="block py-2">Home</a>
            <a href="#" className="block py-2">Convo</a>
            <a href="#" className="block py-2">Subscriptions</a>
            <a href="#" className="block py-2">You</a>
          </nav>
        </div>
      )}

        {video ? (
          <>
            <div className="video-container mb-4">
              <video src={video.videoFile} controls className="w-full rounded-lg shadow-lg"></video>
            </div>
            <h2 className="text-3xl font-bold mb-2">{video.title}</h2>
            <h3 className="text-2xl font-bold mb-2">{video.owner.fullname}</h3>
            <p className="mb-4">{video.description}</p>
            <div className="mb-4 flex items-center">
              <button
                className={`like-button ${isLiked ? 'text-blue-500' : 'text-white'}`}
                disabled={isLiked}
              >
                👍 {likes} Likes
              </button>
            </div>

            {/* Add Comment Section */}
            <div className="comments-section mb-6">
              <h3 className="text-xl font-semibold">Add a Comment</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 mt-2 bg-gray-800 rounded-lg mb-2"
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-500 px-4 py-2 rounded-lg mb-4"
              >
                Add Comment
              </button>

              {/* Edit Comment Section */}
              {editingComment && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold">Edit Comment</h4>
                  <textarea
                    value={updatedCommentText}
                    onChange={(e) => setUpdatedCommentText(e.target.value)}
                    placeholder="Update your comment..."
                    className="w-full p-2 mt-2 bg-gray-800 rounded-lg"
                  />
                  <button
                    onClick={() => handleUpdateComment(editingComment)}
                    className="bg-blue-500 px-4 py-2 rounded-lg mt-2"
                  >
                    Update Comment
                  </button>
                  <button
                    onClick={() => setEditingComment(null)}
                    className="bg-red-500 px-4 py-2 rounded-lg mt-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Display Comments */}
            <div className="comments-section">
              <h3 className="text-xl font-semibold">Comments</h3>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="comment mt-2 p-2 bg-gray-800 rounded-lg flex items-start">
                    {comment.owner.avatar && (
                      <img
                        src={comment.owner.avatar}
                        alt={`${comment.owner.username}'s avatar`}
                        className="w-10 h-10 rounded-full mr-2"
                      />
                    )}
                    <div className="comment-content">
                      <p className='break-words'>
                        <strong>{comment.owner.username}</strong>: {comment.content}
                      </p>
                      {comment.isOwner && (
                        <div className="mt-2 flex space-x-2">
                          <Edit size={15} 
                            onClick={() => {
                              setEditingComment(comment._id);
                              setUpdatedCommentText(comment.content);
                            }}
                            className="text-blue-500"
                          >
                            Edit
                          </Edit>
                          <Trash size={15}
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500"
                          >
                            Delete
                          </Trash>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
          </>
        ) : (
          <p>Loading video...</p>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default VideoDetail;
