import {
  Gamepad2,
  User,
  ChevronDown,
  LogOut,
  Users as UsersIcon,
  Tag,
  Package,
  Home,
  Users as ClientsIcon,
  Coffee,
  Sparkles,
  FileText,
  Calendar,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/loginSlice";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function Header({ activeTab, onTabChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.login?.user) || null;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/Account/Profile");
        setUserProfile(response.data);

        if (response.data?.roles?.includes("Admin")) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الملف الشخصي:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        setCheckingAdmin(false);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    closeDropdown();

    Swal.fire({
      title: "تأكيد تسجيل الخروج",
      text: "هل أنت متأكد من تسجيل الخروج؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، سجل الخروج",
      cancelButtonText: "إلغاء",
      background: "#0f172a",
      color: "#e2e8f0",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/login");

        Swal.fire({
          title: "تم تسجيل الخروج",
          text: "تم تسجيل خروجك بنجاح",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#0f172a",
          color: "#e2e8f0",
        });
      }
    });
  };

  const getDisplayName = () => {
    if (userProfile?.userName) {
      return userProfile.userName;
    }
    if (user?.userName) {
      return user.userName;
    }
    return "مدير النظام";
  };

  const getUserRole = () => {
    if (userProfile?.roles?.length > 0) {
      return userProfile.roles.includes("Admin") ? "مدير النظام" : "مستخدم";
    }

    if (user?.roles?.includes("Admin")) {
      return "مدير النظام";
    }

    return "مستخدم";
  };

  const goToHome = () => {
    closeDropdown();
    navigate("/");
  };

  const goToUsersPage = () => {
    closeDropdown();
    navigate("/users");
  };

  const goToItemTypesPage = () => {
    closeDropdown();
    navigate("/item-types");
  };

  const goToItemsPage = () => {
    closeDropdown();
    navigate("/items");
  };

  const goToRoomsPage = () => {
    closeDropdown();
    navigate("/rooms");
  };

  const goToClientsPage = () => {
    closeDropdown();
    navigate("/clients");
  };

  const goToDrinkReportsPage = () => {
    closeDropdown();
    navigate("/drink-reports");
  };

  const goToSessionsReportsPage = () => {
    closeDropdown();
    navigate("/sessions-reports");
  };

  const goToClientSessionsPage = () => {
    closeDropdown();
    navigate("/client-sessions");
  };

  return (
    <header className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => onTabChange("sessions")}
            className="group relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                activeTab === "sessions"
                  ? "bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 blur-xl"
                  : "bg-gradient-to-r from-gray-800/20 to-gray-700/20"
              }`}
            ></div>

            <div
              className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                activeTab === "sessions"
                  ? "border border-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-border"
                  : "border border-gray-700/50"
              }`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-900 to-black"></div>
            </div>

            <div
              className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeTab === "sessions"
                  ? "bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-purple-900/30 text-white shadow-lg"
                  : "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <div className="relative">
                <div
                  className={`absolute -inset-3 rounded-full blur-md transition-all duration-300 ${
                    activeTab === "sessions"
                      ? "bg-gradient-to-r from-blue-500/40 to-purple-500/40"
                      : "bg-gradient-to-r from-gray-700/20 to-gray-600/20 group-hover:from-blue-500/20 group-hover:to-purple-500/20"
                  }`}
                ></div>
                <div
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    activeTab === "sessions"
                      ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30"
                      : "bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 group-hover:border-blue-500/30"
                  }`}
                >
                  <Gamepad2
                    size={24}
                    className={`transition-all duration-300 ${
                      activeTab === "sessions"
                        ? "text-blue-300"
                        : "text-gray-400 group-hover:text-blue-300"
                    }`}
                  />
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    نظام حجز جلسات
                  </span>
                  {activeTab === "sessions" && (
                    <Sparkles
                      size={16}
                      className="text-cyan-300 animate-pulse"
                    />
                  )}
                </div>
                <p
                  className={`text-sm transition-all duration-300 ${
                    activeTab === "sessions"
                      ? "text-cyan-300/80"
                      : "text-gray-400 group-hover:text-cyan-300/80"
                  }`}
                >
                  إدارة الجلسات والحجوزات
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onTabChange("drinks")}
            className="group relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                activeTab === "drinks"
                  ? "bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 blur-xl"
                  : "bg-gradient-to-r from-gray-800/20 to-gray-700/20"
              }`}
            ></div>

            <div
              className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                activeTab === "drinks"
                  ? "border border-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-border"
                  : "border border-gray-700/50"
              }`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-900 to-black"></div>
            </div>

            <div
              className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeTab === "drinks"
                  ? "bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-teal-900/30 text-white shadow-lg"
                  : "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <div className="relative">
                <div
                  className={`absolute -inset-3 rounded-full blur-md transition-all duration-300 ${
                    activeTab === "drinks"
                      ? "bg-gradient-to-r from-emerald-500/40 to-teal-500/40"
                      : "bg-gradient-to-r from-gray-700/20 to-gray-600/20 group-hover:from-emerald-500/20 group-hover:to-teal-500/20"
                  }`}
                ></div>
                <div
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    activeTab === "drinks"
                      ? "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30"
                      : "bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 group-hover:border-emerald-500/30"
                  }`}
                >
                  <Coffee
                    size={24}
                    className={`transition-all duration-300 ${
                      activeTab === "drinks"
                        ? "text-emerald-300"
                        : "text-gray-400 group-hover:text-emerald-300"
                    }`}
                  />
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    المشروبات
                  </span>
                  {activeTab === "drinks" && (
                    <Sparkles
                      size={16}
                      className="text-green-300 animate-pulse"
                    />
                  )}
                </div>
                <p
                  className={`text-sm transition-all duration-300 ${
                    activeTab === "drinks"
                      ? "text-green-300/80"
                      : "text-gray-400 group-hover:text-green-300/80"
                  }`}
                >
                  كاشير الطلبات النقدية
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="relative">
          <button
            onClick={toggleDropdown}
            onBlur={() => setTimeout(closeDropdown, 200)}
            className="flex items-center gap-3 bg-gradient-to-r from-gray-900/90 to-gray-800/90 px-6 py-3 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] group"
          >
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-md"></div>
              <div className="relative p-2 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 rounded-full border border-blue-500/30">
                <User size={20} className="text-blue-300" />
              </div>
            </div>
            <div className="text-left">
              {loading ? (
                <>
                  <p className="font-semibold text-white animate-pulse">
                    جاري التحميل...
                  </p>
                  <p className="text-xs text-gray-400/70 animate-pulse">
                    Loading
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-white">{getDisplayName()}</p>
                  <p className="text-xs text-gray-400/70">{getUserRole()}</p>
                </>
              )}
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-all duration-300 transform ${
                isDropdownOpen
                  ? "rotate-180 text-blue-300"
                  : "group-hover:text-blue-300"
              }`}
            />
          </button>

          <div
            className={`absolute right-0 top-full mt-2 w-56 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl shadow-black/30 transition-all duration-300 z-50 ${
              isDropdownOpen
                ? "opacity-100 visible transform translate-y-0"
                : "opacity-0 invisible transform translate-y-2"
            }`}
          >
            <div className="p-2">
              <button
                onClick={goToHome}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
              >
                <div className="p-1.5 bg-blue-500/10 rounded-md">
                  <Home size={16} className="text-blue-400" />
                </div>
                <span>الصفحة الرئيسية</span>
              </button>

              <button
                onClick={goToClientsPage}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
              >
                <div className="p-1.5 bg-cyan-500/10 rounded-md">
                  <ClientsIcon size={16} className="text-cyan-400" />
                </div>
                <span>العملاء</span>
              </button>

              {isAdmin && !loading && (
                <>
                  <button
                    onClick={goToSessionsReportsPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                      <Calendar size={16} className="text-blue-400" />
                    </div>
                    <span>تقارير الجلسات</span>
                  </button>

                  <button
                    onClick={goToDrinkReportsPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-teal-500/10 rounded-md">
                      <FileText size={16} className="text-teal-400" />
                    </div>
                    <span>تقارير المشروبات</span>
                  </button>

                  <button
                    onClick={goToClientSessionsPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-indigo-500/10 rounded-md">
                      <History size={16} className="text-indigo-400" />
                    </div>
                    <span>جلسات العملاء</span>
                  </button>

                  <button
                    onClick={goToUsersPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-indigo-500/10 rounded-md">
                      <UsersIcon size={16} className="text-indigo-400" />
                    </div>
                    <span>إدارة المستخدمين</span>
                  </button>

                  <button
                    onClick={goToItemTypesPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-emerald-500/10 rounded-md">
                      <Tag size={16} className="text-emerald-400" />
                    </div>
                    <span>أنواع المنتجات</span>
                  </button>

                  <button
                    onClick={goToItemsPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-amber-500/10 rounded-md">
                      <Package size={16} className="text-amber-400" />
                    </div>
                    <span>إدارة المنتجات</span>
                  </button>

                  <button
                    onClick={goToRoomsPage}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors w-full text-left"
                  >
                    <div className="p-1.5 bg-violet-500/10 rounded-md">
                      <Home size={16} className="text-violet-400" />
                    </div>
                    <span>إدارة الغرف</span>
                  </button>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2"></div>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
              >
                <div className="p-1.5 bg-red-500/10 rounded-md">
                  <LogOut size={16} className="text-red-400" />
                </div>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
