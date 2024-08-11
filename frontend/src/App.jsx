import { useState } from 'react'

import './App.css'
import Header from './components/Header/Header'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import {Route , Routes} from 'react-router-dom'
function App() {


  return (
   <>
   {/* <LandingPage /> */}
  <Routes>
        <Route path='/' element={<LandingPage/>} />
        <Route path='/dashboard' element={<Dashboard />} />
  </Routes>
   </>
  )
}

export default App
