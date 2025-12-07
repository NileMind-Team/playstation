import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import axiosInstance from "../../api/axiosInstance";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const apiFormData = new FormData();
      apiFormData.append("UserName", formData.userName);
      apiFormData.append("Password", formData.password);

      const res = await axiosInstance.post("/api/Auth/Login", apiFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    isLoading: false,
    isLogged: !!localStorage.getItem("token"),
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.isLogged = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      Swal.fire({
        icon: "info",
        title: "Logged out successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        if (data?.token) {
          state.isLogged = true;
          state.token = data.token;
          state.user = {
            id: data.id,
            name: data.name,
            userName: data.userName,
          };

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(state.user));

          Swal.fire({
            icon: "success",
            title: "Login successful",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Invalid credentials",
            text: "Please check your username and password",
          });
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "An error occurred",
          text:
            action.payload?.message ||
            "Please check your connection or try again later",
        });
      });
  },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer;
