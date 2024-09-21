import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
const VideoCardStudio = ({ video, onEdit, onDelete }) => {
  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return '00:00';
  
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
  
    // If duration is more than or equal to 1 hour, show HH:MM:SS
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    // Otherwise, show MM:SS
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };
  
  return (
  
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="relative">
      <Link to={`/videos/${video._id}`}> 
        <img
          src={video.thumbnail} // Use video thumbnail URL
          alt="Thumbnail"
          className="w-full h-56 object-cover rounded-lg"
        />
         <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-1.5 py-0.5 rounded">
         {formatDuration(video.duration)}
        </span>
        </Link>
        <div className="absolute top-0 right-0 m-2 flex space-x-2">
          <button
            onClick={() => onEdit(video.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(video.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      <Link to={`/videos/${video._id}`}> 
      <h3 className="text-xl font-semibold mt-2">{video.title}</h3>
      <p className="text-gray-400 mt-1">{video.description}</p>
      </Link>
    </div>
  
  );
};

export default VideoCardStudio;
