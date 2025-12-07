import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../redux/slices/loginSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
  },
});