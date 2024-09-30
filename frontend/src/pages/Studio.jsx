import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit , Menu} from 'lucide-react'; // Import Edit icon
import VideoCardStudio from '../components/VideoCardStudio/VideoCardStudio'; // Import the VideoCard component
import api from '../services/api'; // Adjust the path as necessary
import Loading from '../components/Loading/Loading'; // Import the Loading component
import axios from 'axios';
import { useSelector } from 'react-redux';
import MobileMenu from '../components/MobileMenu/MobileMenu';
import { ToastContainer , toast } from 'react-toastify';
const Studio = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Add state for edit modal
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null); // State for current video ID
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const user = useSelector((state)=>state.auth.user)
const navigate = useNavigate();
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get(`/dashboard/videos/${user._id}`);
        console.log('Fetched Videos:', response.data.data);
        setVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [user , user._id]);

  const toggleUploadModal = () => setShowUploadModal(!showUploadModal);

  const toggleEditModal = (video) => {
    setTitle(video.title);
    setDescription(video.description);
    setThumbnail(video.thumbnail); // Assuming `thumbnail` is available in the video object
    setCurrentVideoId(video._id);
    setShowEditModal(!showEditModal);
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('description', description);

    try {
     const response =  await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
      if(response){
        toast.success("Video Uploaded Successfully")
      
        const vids = await api.get(`/dashboard/videos/${user._id}`);
      setVideos(vids.data.data);
      setShowUploadModal(false);
    }
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (videoFile) formData.append('videoFile', videoFile);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('description', description);

    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${currentVideoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      const response = await api.get('/dashboard/videos');
      setVideos(response.data.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos(videos.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.closest('.modal-content') === null) {
      setShowUploadModal(false);
      setShowEditModal(false); // Close the edit modal if clicking outside
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

        {isMobileMenuOpen && (
        <MobileMenu
          onClose={() => setIsMobileMenuOpen(false)}
          onNavigate={handleNavigation}
        />
      )}
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
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={toggleUploadModal}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-4"
                >
                  Close
                </button>
                {loading && <Loading />}
              </form>
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
                {loading && <Loading />}
              </form>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <Loading />}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Studio;
