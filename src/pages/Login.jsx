import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Lock, User, Gamepad2 } from "lucide-react";
import { loginUser } from "../redux/slices/loginSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isLogged, error } = useSelector((state) => state.login);

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isLogged) {
      navigate("/");
    }
  }, [isLogged, navigate]);

  const validateForm = () => {
    const errors = {};

    if (formData.userName.trim() === "") {
      errors.userName = "اسم المستخدم مطلوب";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    return formData.userName.trim() !== "" && formData.password !== "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !isFormValid()) return;

    try {
      const result = await dispatch(loginUser(formData));

      if (result.meta.requestStatus === "fulfilled") {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden relative"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>

            <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="relative p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
                      <Gamepad2 size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      تسجيل الدخول
                    </h2>
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-2">
                    أدخل بيانات حسابك للوصول إلى النظام
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm text-right">
                    اسم المستخدم
                  </label>
                  <div className="relative group">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="flex items-center bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                      <User size={18} className="text-gray-400 ml-2" />{" "}
                      <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm text-right"
                        placeholder="أدخل اسم المستخدم"
                        dir="rtl"
                      />
                    </div>
                    {validationErrors.userName && (
                      <p className="text-red-400 text-xs mt-1 text-right">
                        {validationErrors.userName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm text-right">
                    كلمة المرور
                  </label>
                  <div className="relative group">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="flex items-center bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                      <Lock size={18} className="text-gray-400 ml-2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm text-right"
                        placeholder="أدخل كلمة المرور"
                        dir="rtl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-white transition-colors mr-2"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-400 text-xs mt-1 text-right">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                    <div className="text-red-400 text-sm text-right">
                      {error.message || "حدث خطأ أثناء تسجيل الدخول"}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-300 relative overflow-hidden ${
                    isLoading || !isFormValid()
                      ? "bg-gray-700 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>جاري تسجيل الدخول...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Gamepad2 size={18} />
                      <span>تسجيل الدخول</span>
                    </div>
                  )}
                  {!isLoading && isFormValid() && (
                    <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-rtl"></div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer-rtl {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-shimmer-rtl {
          animation: shimmer-rtl 2s infinite;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #e2e8f0;
          -webkit-box-shadow: 0 0 0px 1000px #1f2937 inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        input[dir="rtl"] {
          text-align: right;
          font-family: "Segoe UI", "Tahoma", sans-serif;
        }

        ::placeholder {
          text-align: right;
          direction: rtl;
        }
      `}</style>
    </div>
  );
};

export default Login;
