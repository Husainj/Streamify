// src/components/Studio/VideoUploadModal.js
import React, { useState } from 'react';
import api from '../../services/api';

const VideoUploadModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('video', videoFile);

    try {
      await api.post('/videos', formData);
      onClose();
      // Refresh the video list after upload
    } catch (error) {
      console.error('Failed to upload video:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Upload Video</h2>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
};

export default VideoUploadModal;
