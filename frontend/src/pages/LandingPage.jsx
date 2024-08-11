import React from 'react'
import Header from '../components/Header/Header'
import VideoFeed from '../components/VideoFeed/VideoFeed'
import Sidebar from '../components/Sidebar/Sidebar'
import user from '../redux/slices/userSlice'
import Testing from '../components/Testing/Testing'

function LandingPage() {
  return (
    <>
   <Header />
   <VideoFeed />
    </>
  )
}

export default LandingPage