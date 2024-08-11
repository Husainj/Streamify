import React from 'react'
import { useSelector } from 'react-redux';
function Testing() {
    const User = useSelector((state) => state.user.currentUser);
  
    return <div className="user-name bg-black text-white">Welcome, {User}!</div>;

}

export default Testing