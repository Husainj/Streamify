import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { PlusCircle } from 'lucide-react';
import VideoCardStudio from '../components/VideoCardStudio/VideoCardStudio'; // Import the VideoCard component
import api from '../services/api'; // Adjust the path as necessary
import Loading from '../components/Loading/Loading'; // Import the Loading component
import axios from 'axios';

const Studio = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    // Fetch user's videos when the component mounts
    const fetchVideos = async () => {
      try {
        const response = await api.get('/dashboard/videos'); // Adjust the endpoint as necessary
        console.log('Fetched Videos:', response.data.data);
        setVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  const toggleUploadModal = () => setShowUploadModal(!showUploadModal);

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('description', description);

    try {
     const result =  await axios.post('http://localhost:8000/api/v1/videos/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          });// Adjust the endpoint as necessary
          console.log(result)
      const response = await api.get('/dashboard/videos');
      setVideos(response.data.data);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleEdit = (videoId) => {
    // Implement edit functionality here
    console.log('Edit video:', videoId);
  };

  const handleDelete = async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`); // Adjust the endpoint as necessary
      setVideos(videos.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.closest('.modal-content') === null) {
      setShowUploadModal(false);
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen"> {/* Ensures the full height of the viewport */}
      <Sidebar />
      <div className="flex-1 md:ml-40 p-6 bg-gray-900 text-white min-h-screen"> {/* Extends the content to fill the screen */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Studio</h1>
          <button
            onClick={toggleUploadModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusCircle size={24} className="mr-2" />
            Upload Video
          </button>
        </div>

        {/* Display videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCardStudio
                key={video._id}
                video={video}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

        {/* Loading Spinner */}
      
      </div>
    </div>
  );
};

export default Studio;
