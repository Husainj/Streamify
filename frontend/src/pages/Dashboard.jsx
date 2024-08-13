import React from 'react'
import api from '../services/api'

function Dashboard() {

    const handleSubmit = async(e) =>{
        try {
            const response = await api.get('/users/c/mohd')

            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }
    const handleLogout = async() =>{
        try {
     const response = await api.post('/users/logout')
         // localStorage.removeItem("accesstoken")
         // localStorage.removeItem("refreshtoken")
     console.log(response)
        } catch (error) {
         console.log(error)
        }
       }
  return (
<>
<h1>Hello</h1>
<button onClick={handleSubmit}>Get channel profile</button>
<button onClick={handleLogout}>Logout</button>

</>    

)
}

export default Dashboard