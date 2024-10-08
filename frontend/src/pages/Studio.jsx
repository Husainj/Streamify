import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import Sidebar from '../components/Sidebar/Sidebar';
import VideoCardStudio from '../components/VideoCardStudio/VideoCardStudio';
import Loading from '../components/Loading/Loading';
import MobileMenu from '../components/MobileMenu/MobileMenu';
import api from '../services/api';

const Studio = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get(`/dashboard/videos/${user._id}`);
        console.log('Fetched Videos:', response.data.data);
        setVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to fetch videos');
      }
    };

    fetchVideos();
  }, [user._id]);

  const toggleUploadModal = () => setShowUploadModal(!showUploadModal);

  const toggleEditModal = (video) => {
    setTitle(video.title);
    setDescription(video.description);
    setThumbnail(video.thumbnail);
    setCurrentVideoId(video._id);
    setShowEditModal(!showEditModal);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return false;
    }
    return true;
  };

  const uploadToCloudinary = async (file, resourceType) => {
    const cloudName = `${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}`; // Replace with your Cloudinary cloud name
    const uploadPreset = `${import.meta.env.VITE_UPLOAD_PRESET}`; // Replace with your upload preset

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
      throw error;
    }
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload video to Cloudinary
      const videoData = await uploadToCloudinary(videoFile, 'video');
      
      // Step 2: Upload thumbnail to Cloudinary
      const thumbnailData = await uploadToCloudinary(thumbnail, 'image');

      // Step 3: Save video details to your backend
      const videoDetails = {
        title,
        description,
        videoUrl: videoData.secure_url,
        thumbnailUrl: thumbnailData.secure_url,
        duration: videoData.duration
        // Add any other necessary fields
      };

      const response = await api.post('/videos', videoDetails);

      if (response) {
        toast.success('Video Uploaded Successfully');
        const vids = await api.get(`/dashboard/videos/${user._id}`);
        setVideos(vids.data.data);
        setShowUploadModal(false);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleEditVideo = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formData = new FormData();
    if (thumbnail instanceof File) formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${currentVideoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setVideos(prevVideos => prevVideos.map(video => 
        video._id === currentVideoId ? { ...video, ...response.data.data } : video
      ));

      setShowEditModal(false);
      toast.success('Video updated successfully');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    setVideoToDelete(videoId);
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    
    try {
      await api.delete(`/videos/${videoToDelete}`);
      setVideos(videos.filter(video => video._id !== videoToDelete));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setVideoToDelete(null);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.closest('.modal-content') === null) {
      setShowUploadModal(false);
      setShowEditModal(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-40 p-6 bg-gray-900 text-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="md:hidden fixed top-0 left-0 z-50 p-4">
              <button
                onClick={toggleMobileMenu}
                className="text-white focus:outline-none"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold">My Studio</h1>
          <button
            onClick={toggleUploadModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusCircle size={24} className="mr-2" />
            Upload Video
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCardStudio
                key={video._id}
                video={video}
                onEdit={() => toggleEditModal(video)}
                onDelete={() => handleDelete(video._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center">No videos found.</div>
          )}
        </div>

        {/* Upload Video Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
            onClick={handleClickOutside}
          >
            <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md modal-content">
              <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
              <form onSubmit={handleUploadVideo}>
                <div className="mb-4">
                  <label className="block mb-2">Video File</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full bg-gray-700 px-4 py-2 rounded-lg border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full bg-gray-700 px-4 py-2 rounded-lg border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600"
                    rows="4"
                  ></textarea>
                </div>
                {uploadProgress > 0 && (
  <div className="mb-4">
    <div className="relative w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-800 animate-pulse transition-all duration-500 ease-out"
        style={{ width: `${uploadProgress}%` }}
      ></div>
    </div>
    <div className="flex justify-between mt-1 text-sm font-medium text-gray-700">
      <p>Uploading...</p>
      <p className="text-blue-700">{uploadProgress}%</p>
    </div>
  </div>
)}

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={toggleUploadModal}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-4"
                >
                  Close
                </button>
              </form>
              {loading && <Loading />}
            </div>
          </div>
        )}

        {/* Edit Video Modal */}
        {showEditModal && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
            onClick={handleClickOutside}
          >
            <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md modal-content">
              <h2 className="text-2xl font-bold mb-4">Edit Video</h2>
              <form onSubmit={handleEditVideo}>
                <div className="mb-4">
                  <label className="block mb-2">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full bg-gray-700 px-4 py-2 rounded-lg border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600"
                    rows="4"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-4"
                >
                  Close
                </button>
              </form>
              {loading && <Loading />} 
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {videoToDelete && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete this video?</p>
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setVideoToDelete(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <MobileMenu
            onClose={() => setIsMobileMenuOpen(false)}
            onNavigate={handleNavigation}
          />
        )}

        {/* Loading Spinner */}
       
      </div>
      <ToastContainer />
    </div>
  );
};

export default Studio;