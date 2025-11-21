import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, provider } from "../../firebase";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const signWithEmailPassword = createAsyncThunk(
  "auth/sign-in-with-email-password",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );
      const user = userCredential.user;
      return user;
    } catch (error: any) {
      console.error("Sign-in error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  "auth/sign-in-with-google",
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      return user;
    } catch (error: any) {
      console.error("Google sign-in error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const signUpWithEmailPassword = createAsyncThunk(
  "auth/sign-up-with-email-password",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );
      const user = userCredential.user;
      return user;
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);
