import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users as UsersIcon,
  UserPlus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Shield,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Key,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const UsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    roles: ["User"],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const checkAdminPermissions = async () => {
      try {
        setLoadingProfile(true);
        const response = await axiosInstance.get("/api/Account/Profile");

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
        background: "#0f172a",
        color: "#e2e8f0",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
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
      });

      setShowAddModal(false);
      setFormData({ userName: "", password: "", roles: ["User"] });
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في إضافة المستخدم",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleDeleteUser = (userName) => {
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
          });

          fetchUsers();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المستخدم",
            background: "#0f172a",
            color: "#e2e8f0",
          });
        }
      }
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles.some((role) =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-2xl border border-red-700/50 mb-6">
            <Shield size={64} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-300 mb-2">
              غير مصرح لك
            </h2>
            <p className="text-gray-400">
              ليس لديك صلاحيات للوصول إلى هذه الصفحة
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  إدارة المستخدمين
                </h1>
                <p className="text-gray-400 mt-2">
                  إدارة حسابات المستخدمين والأذونات في النظام
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ✅ حقل البحث */}
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="بحث باسم المستخدم أو الدور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                <span>إضافة مستخدم</span>
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
                      <CheckCircle size={16} />
                      الحالة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Edit size={16} />
                      الإجراءات
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-10 h-10 border-3 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-400 mt-4">
                        جاري تحميل بيانات المستخدمين...
                      </p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <UsersIcon size={48} className="text-gray-600" />
                        <p className="text-gray-400">لا توجد مستخدمين</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg">
                            <UserIcon size={18} className="text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.userName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user.id.substring(0, 8)}...
                            </p>
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
                                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              }`}
                            >
                              {role === "Admin" ? "مدير النظام" : "مستخدم عادي"}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm">نشط</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.userName)}
                            className="p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-lg border border-red-600/30 text-red-400 hover:text-red-300 hover:border-red-500/50 transition-all duration-300"
                            title="حذف المستخدم"
                            disabled={user.userName === "admin"}
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

          <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield size={16} />
                <span className="text-sm">
                  {filteredUsers.length} مستخدم •{" "}
                  {
                    filteredUsers.filter((u) => u.roles.includes("Admin"))
                      .length
                  }{" "}
                  مدير
                </span>
              </div>
              <div className="text-sm text-gray-500">آخر تحديث: الآن</div>
            </div>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-md">
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
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    <p className="text-gray-500 text-xs mt-2">
                      يجب أن تكون كلمة المرور 6 أحرف على الأقل
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield size={16} />
                        الدور
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, roles: ["Admin"] })
                        }
                        className={`p-4 rounded-xl border transition-all ${
                          formData.roles.includes("Admin")
                            ? "bg-red-500/20 border-red-500/50 text-red-300"
                            : "bg-gray-800/60 border-gray-600 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Shield size={20} />
                          <span className="font-medium">مدير النظام</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, roles: ["User"] })
                        }
                        className={`p-4 rounded-xl border transition-all ${
                          formData.roles.includes("User")
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                            : "bg-gray-800/60 border-gray-600 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <UserIcon size={20} />
                          <span className="font-medium">مستخدم عادي</span>
                        </div>
                      </button>
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
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
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
