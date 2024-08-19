import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      fullname: null,
     username : null,
      email: null,
      avatar: null,
      coverImage: null,
    },
    isLoggedIn: false,
  },
  reducers: {
    setUser: (state, action) => {
      const { fullname, username , email, avatar, coverImage } = action.payload;
      state.user = { fullname, username ,email, avatar, coverImage };
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.user = {
        fullname: null,
        username: null,
        email: null,
        avatar: null,
        coverImage: null,
      };
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
