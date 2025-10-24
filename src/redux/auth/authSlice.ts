import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";
import { RootState } from "../store";

interface UserState {
  currentUser: User | null;
  profile: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.profile = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
// export const selectUser = (state: RootState) => state.user.currentUser;
export default userSlice.reducer;
