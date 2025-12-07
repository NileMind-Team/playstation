import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users as UsersIcon,
  UserPlus,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Search,
  RefreshCw,
  XCircle,
  User as UserIcon,
  Key,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const UsersPage = () => {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    roles: ["Cashier"],
  });
  const [formErrors, setFormErrors] = useState({});
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const isAddButtonDisabled = () => {
    return (
      !formData.userName.trim() ||
      !formData.password.trim() ||
      formData.password.length < 6 ||
      formData.roles.length === 0
    );
  };

  useEffect(() => {
    const checkAdminPermissions = async () => {
      try {
        setLoadingProfile(true);
        const response = await axiosInstance.get("/api/Account/Profile");

        setCurrentUserProfile(response.data);

        if (response.data?.roles?.includes("Admin")) {
          setIsAdmin(true);
        } else {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الملف الشخصي:", error);
        navigate("/");
        return;
      } finally {
        setLoadingProfile(false);
      }
    };

    checkAdminPermissions();
  }, [navigate]);

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/api/Roles/GetAll");
      setRoles(response.data);
    } catch (error) {
      console.error("خطأ في جلب الأدوار:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Users/GetAll");
      setUsers(response.data);
    } catch (error) {
      console.error("خطأ في جلب المستخدمين:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات المستخدمين",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAdmin]);

  const handleAddUser = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.userName.trim()) errors.userName = "اسم المستخدم مطلوب";
    if (!formData.password.trim()) errors.password = "كلمة المرور مطلوبة";
    if (formData.password.length < 6)
      errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axiosInstance.post("/api/Users/Add", formData);

      Swal.fire({
        icon: "success",
        title: "تمت الإضافة",
        text: "تم إضافة المستخدم بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      setShowAddModal(false);
      setFormData({ userName: "", password: "", roles: ["Cashier"] });
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في إضافة المستخدم",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
        willClose: () => {
        },
      });
    }
  };

  const handleDeleteUser = (userName) => {
    if (userName === currentUserProfile?.userName) {
      Swal.fire({
        icon: "warning",
        title: "غير مسموح",
        text: "لا يمكنك حذف حسابك الخاص",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
      return;
    }

    if (userName.toLowerCase() === "admin") {
      Swal.fire({
        icon: "warning",
        title: "غير مسموح",
        text: "لا يمكن حذف حساب Admin الرئيسي",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
      return;
    }

    Swal.fire({
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف المستخدم "${userName}"؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      background: "#0f172a",
      color: "#e2e8f0",
      backdrop: "rgba(0, 0, 0, 0.7)",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(
            `/api/Users/Delete/${encodeURIComponent(userName)}`
          );

          Swal.fire({
            icon: "success",
            title: "تم الحذف",
            text: "تم حذف المستخدم بنجاح",
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });

          fetchUsers();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المستخدم",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });
        }
      }
    });
  };

  const sortedAndFilteredUsers = users
    .filter(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some((role) =>
          role.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .sort((a, b) => {
      if (a.userName === currentUserProfile?.userName) return -1;
      if (b.userName === currentUserProfile?.userName) return 1;
      return 0;
    });

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6"
    >
      <button
        onClick={() => navigate("/")}
        className="fixed md:absolute top-4 md:top-6 left-4 md:left-6 z-10 group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-indigo-500 transition-all duration-300 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <ArrowLeft
          size={20}
          className="text-gray-300 group-hover:text-indigo-300 transition-colors"
        />
        <div className="absolute -right-14 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"></div>
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        {" "}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <UsersIcon size={32} className="text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-1">
                  {" "}
                  إدارة المستخدمين
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  {" "}
                  إدارة حسابات المستخدمين والأذونات في النظام
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="بحث باسم المستخدم أو الدور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={fetchUsers}
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300"
                title="تحديث القائمة"
              >
                <RefreshCw size={20} className="text-gray-300" />
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
              >
                <UserPlus size={18} />
                <span>إضافة مستخدم جديد</span>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900/50">
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      اسم المستخدم
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Shield size={16} />
                      الدور/الصلاحيات
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Trash2 size={16} />
                      الإجراءات
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-gray-700/30 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <UsersIcon size={20} className="text-indigo-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-32 bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="h-2 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : sortedAndFilteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <UsersIcon size={48} className="text-gray-600" />
                        <p className="text-gray-400">لا توجد مستخدمين</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors ${
                        user.userName === currentUserProfile?.userName
                          ? "bg-gradient-to-r from-indigo-900/20 to-purple-900/20"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              user.userName === currentUserProfile?.userName
                                ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30"
                                : user.userName.toLowerCase() === "admin"
                                ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30"
                                : "bg-gradient-to-br from-indigo-600/20 to-purple-600/20"
                            }`}
                          >
                            <UserIcon
                              size={18}
                              className={
                                user.userName === currentUserProfile?.userName
                                  ? "text-indigo-300"
                                  : user.userName.toLowerCase() === "admin"
                                  ? "text-amber-400"
                                  : "text-indigo-400"
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">
                              {user.userName}
                            </p>
                            {user.userName === currentUserProfile?.userName && (
                              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                                المستخدم الحالي
                              </span>
                            )}
                            {user.userName.toLowerCase() === "admin" && (
                              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                                حساب رئيسي
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                role === "Admin"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {role === "Admin" ? "مدير النظام" : "كاشير"}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.userName)}
                            className={`p-2 rounded-lg border transition-all duration-300 ${
                              user.userName === currentUserProfile?.userName ||
                              user.userName.toLowerCase() === "admin"
                                ? "bg-gray-700/20 border-gray-600/30 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-red-600/20 to-red-700/20 border-red-600/30 text-red-400 hover:text-red-300 hover:border-red-500/50"
                            }`}
                            title={
                              user.userName === currentUserProfile?.userName
                                ? "لا يمكن حذف حسابك الخاص"
                                : user.userName.toLowerCase() === "admin"
                                ? "لا يمكن حذف حساب Admin الرئيسي"
                                : "حذف المستخدم"
                            }
                            disabled={
                              user.userName === currentUserProfile?.userName ||
                              user.userName.toLowerCase() === "admin"
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="relative w-full max-w-md">
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg">
                        <UserPlus size={20} className="text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        إضافة مستخدم جديد
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    املأ البيانات لإضافة مستخدم جديد للنظام
                  </p>
                </div>

                <form onSubmit={handleAddUser} className="p-6 space-y-5">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon size={16} />
                        اسم المستخدم
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.userName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            userName: e.target.value,
                          });
                          if (formErrors.userName)
                            setFormErrors({ ...formErrors, userName: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="أدخل اسم المستخدم"
                      />
                      {formErrors.userName && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.userName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Key size={16} />
                        كلمة المرور
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          });
                          if (formErrors.password)
                            setFormErrors({ ...formErrors, password: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="أدخل كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                      {formErrors.password && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield size={16} />
                        الدور
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, roles: [role.name] })
                          }
                          className={`p-4 rounded-xl border transition-all ${
                            formData.roles.includes(role.name)
                              ? role.name === "Admin"
                                ? "bg-red-500/20 border-red-500/50 text-red-300"
                                : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-gray-800/60 border-gray-600 text-gray-400 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {role.name === "Admin" ? (
                              <Shield size={20} />
                            ) : (
                              <DollarSign size={20} />
                            )}
                            <span className="font-medium">
                              {role.name === "Admin" ? "مدير النظام" : "كاشير"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-semibold text-white hover:from-gray-600 hover:to-gray-500 transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isAddButtonDisabled()}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isAddButtonDisabled()
                          ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                      }`}
                    >
                      <UserPlus size={18} />
                      إضافة المستخدم
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
