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

  return (
<>
<h1>Hello</h1>
<button onClick={handleSubmit}>Get channel profile</button>


</>    

)
}

export default Dashboard