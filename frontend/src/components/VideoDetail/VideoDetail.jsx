import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Importing useSelector to access Redux state
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';

const VideoDetail = () => {
  const { id } = useParams(); // Get the video ID from the URL params
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [updatedCommentText, setUpdatedCommentText] = useState('');

  // Access the user data from Redux
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        setVideo(response.data.data);
      } catch (error) {
        toast.error(error.response.data);
        console.error('Error fetching video details:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/${id}`);
        const commentsWithOwnership = response.data.data.comments.map(comment => ({
          ...comment,
          isOwner: comment.owner._id === user._id,
          
        }));
       
        console.log(commentsWithOwnership)
        setComments(commentsWithOwnership);
      } catch (error) {
        toast.error(error.response.data);
        console.error('Error fetching comments:', error);
      }
    };

    fetchVideoDetails();
    fetchComments();
  }, [id , user._id]);

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
      setComments([...comments, newCommentData]);
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
          comment._id === commentId ? { ...response.data.data ,  isOwner: true  }: comment
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
     const response =  await api.delete(`/comments/c/${commentId}`);
     console.log(response)
     toast.success(response.data.message)
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
    <div className="p-4 bg-gray-900 text-white">
      {video ? (
        <>
          <div className="video-container">
            <video src={video.videoFile} controls className="w-full"></video>
          </div>
          <h2 className="text-2xl font-bold mt-4">{video.title}</h2>
          <p>{video.description}</p>
          <div className="mt-4 flex items-center">
            <button
              className={`like-button ${isLiked ? 'text-blue-500' : 'text-white'}`}
              disabled={isLiked}
            >
              👍 {likes} Likes
            </button>
          </div>
          <div className="comments-section mt-6">
            <h3 className="text-xl font-semibold">Comments</h3>
            {(comments.length > 0) ? (
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
                    <p>
                      <strong>{comment.owner.username}</strong>: {comment.content}
                    </p>
                    {comment.isOwner && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingComment(comment._id);
                            setUpdatedCommentText(comment.content);
                          }}
                          className="text-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Add a Comment</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 mt-2 bg-gray-800 rounded-lg"
              />
              <button
                onClick={handleAddComment}
                className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
              >
                Add Comment
              </button>
            </div>
            {editingComment && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold">Edit Comment</h4>
                <textarea
                  value={updatedCommentText}
                  onChange={(e) => setUpdatedCommentText(e.target.value)}
                  placeholder="Update your comment..."
                  className="w-full p-2 mt-2 bg-gray-800 rounded-lg"
                />
                <button
                  onClick={() => handleUpdateComment(editingComment)}
                  className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
                >
                  Update Comment
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  className="mt-2 bg-red-500 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <p>Loading video...</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default VideoDetail;
