import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn : false,
}

export const authSlice = createSlice({
    name: 'auth' ,
    initialState ,
    reducers : {
        toggleIsLogin : (state) =>{
            state.isLoggedIn = !state.isLoggedIn
        }
    }
})

export const {toggleIsLogin} = authSlice.actions  

export default authSlice.reducer