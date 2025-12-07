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

const translateErrorMessage = (errorData, useHTML = true) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (Array.isArray(errorData.errors)) {
    const error = errorData.errors[0];
    switch (error.code) {
      case "User.InvalidCredentials":
        return "اسم المستخدم أو كلمة المرور غير صحيحة";
      default:
        return error.description || "حدث خطأ في المصادقة";
    }
  }

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.UserName) {
      errorData.errors.UserName.forEach((msg) => {
        if (msg.includes("letters, numbers, and underscores")) {
          errorMessages.push(
            "اسم المستخدم يجب أن يحتوي فقط على أحرف و أرقام وشرطة سفلية"
          );
        } else if (msg.includes("required")) {
          errorMessages.push("اسم المستخدم مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.Password) {
      errorData.errors.Password.forEach((msg) => {
        if (msg.includes("at least 6 characters")) {
          errorMessages.push("كلمة المرور يجب أن تحتوي على الأقل 6 أحرف");
        } else if (msg.includes("required")) {
          errorMessages.push("كلمة المرور مطلوبة");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (key !== "UserName" && key !== "Password") {
        errorData.errors[key].forEach((msg) => {
          errorMessages.push(msg);
        });
      }
    });

    if (errorMessages.length > 1) {
      if (useHTML) {
        const htmlMessages = errorMessages.map(
          (msg) =>
            `<div style="direction: rtl; text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;">-</span>
           </div>`
        );
        return htmlMessages.join("");
      } else {
        return errorMessages.map((msg) => `${msg} -`).join("<br>");
      }
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("invalid") || msg.includes("credentials")) {
      return "اسم المستخدم أو كلمة المرور غير صحيحة";
    }
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    if (msg.includes("timeout") || msg.includes("time out")) {
      return "انتهت المهلة، يرجى المحاولة مرة أخرى";
    }
    return errorData.message;
  }

  return "حدث خطأ غير متوقع";
};

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
        title: "تم تسجيل الخروج",
        text: "تم تسجيل خروجك بنجاح",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        background: "#0f172a",
        color: "#e2e8f0",
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
            title: "تم تسجيل الدخول بنجاح",
            text: "مرحباً بك في النظام",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            background: "#0f172a",
            color: "#e2e8f0",
          });
        } else {
          Swal.fire({
            title: "بيانات الدخول غير صحيحة",
            text: "يرجى التحقق من اسم المستخدم وكلمة المرور",
            icon: "error",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "حاول مرة أخرى",
            background: "#0f172a",
            color: "#e2e8f0",
            reverseButtons: true,
          });
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        const translatedMessage = translateErrorMessage(action.payload, true);

        Swal.fire({
          title: "حدث خطأ",
          html: translatedMessage,
          icon: "error",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "حاول مرة أخرى",
          background: "#0f172a",
          color: "#e2e8f0",
          reverseButtons: true,
        });
      });
  },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer;
