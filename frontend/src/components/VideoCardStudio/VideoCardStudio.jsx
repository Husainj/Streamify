import React from 'react';
import { Edit, Trash } from 'lucide-react';

const VideoCardStudio = ({ video, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="relative">
        <img
          src={video.thumbnail} // Use video thumbnail URL
          alt="Thumbnail"
          className="w-full h-56 object-cover rounded-lg"
        />
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
      <h3 className="text-xl font-semibold mt-2">{video.title}</h3>
      <p className="text-gray-400 mt-1">{video.description}</p>
    </div>
  );
};

export default VideoCardStudio;
