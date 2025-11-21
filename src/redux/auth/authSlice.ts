import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  signInWithGoogle,
  signUpWithEmailPassword,
  signWithEmailPassword,
} from "../../services/auth.service";

export interface CurrentUserInfo {
  user_id: string;
  email: string;
  display_name: string;
  photoURL: string;
  emailVerified: boolean;
}

export interface UserState {
  currentUser: CurrentUserInfo;
  loading: boolean;
  error: string | undefined;
}

const initialState: UserState = {
  currentUser: {
    user_id: "",
    email: "",
    display_name: "",
    photoURL: "",
    emailVerified: false,
  },
  loading: true,
  error: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<CurrentUserInfo>) => {
      state.currentUser = action.payload;
    },
    clearUserInfo: (state) => {
      state.currentUser = initialState.currentUser;
    },
    setInfoLoader: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signInWithGoogle.fulfilled, (state, action) => {
      const user = action.payload;
      state.currentUser = {
        user_id: user.uid,
        email: user.email!,
        display_name: user.displayName!,
        photoURL: user.photoURL!,
        emailVerified: user.emailVerified,
      };
      state.loading = false;
    });
    builder.addCase(signInWithGoogle.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signInWithGoogle.rejected, (state, action) => {
      state.error = action.error.message;
    });
    builder.addCase(signWithEmailPassword.fulfilled, (state, action) => {
      const user = action.payload;
      state.currentUser = {
        user_id: user.uid,
        email: user.email!,
        display_name: user.displayName!,
        photoURL: user.photoURL!,
        emailVerified: user.emailVerified,
      };
      state.loading = false;
    });
    builder.addCase(signWithEmailPassword.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signWithEmailPassword.rejected, (state, action) => {
      state.error = action.error.message;
    });
  },
});

export const { setUserInfo, clearUserInfo, setInfoLoader } = authSlice.actions;
export default authSlice.reducer;
