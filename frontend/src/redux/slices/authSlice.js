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
      _id: null
    },
    isLoggedIn: false,
  },
  reducers: {
    setUser: (state, action) => {
      const { fullname, username , email, avatar, coverImage , _id} = action.payload;

      state.user = { fullname, username ,email, avatar, coverImage , _id };

      console.log('setUser payload:', action.payload);
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.user = {
        fullname: null,
        username: null,
        email: null,
        avatar: null,
        coverImage: null,
        _id: null
      };
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
