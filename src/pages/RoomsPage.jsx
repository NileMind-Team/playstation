import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home as RoomIcon,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  XCircle,
  Save,
  X,
  AlertCircle,
  Banknote,
  Power,
  PowerOff,
  CheckCircle,
  XCircle as XCircleIcon,
  Info,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const RoomsPage = () => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const editModalRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hourCost: "",
    notes: "",
    isAvailable: true,
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    hourCost: "",
    notes: "",
    isAvailable: true,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  const isAddFormValid = () => {
    return formData.name.trim() !== "" && formData.hourCost > 0;
  };

  const isEditFormValid = () => {
    return editFormData.name.trim() !== "" && editFormData.hourCost > 0;
  };

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

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Rooms/GetAll");
      setRooms(response.data);
    } catch (error) {
      console.error("خطأ في جلب الغرف:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات الغرف",
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
      fetchRooms();
    }
  }, [isAdmin]);

  const handleAddRoom = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "اسم الغرفة مطلوب";
    if (!formData.hourCost || formData.hourCost <= 0)
      errors.hourCost = "سعر الساعة يجب أن يكون أكبر من 0";
    if (formData.notes.length > 200)
      errors.notes = "الملاحظات يجب أن لا تتجاوز 200 حرف";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axiosInstance.post("/api/Rooms/Add", formData);

      Swal.fire({
        icon: "success",
        title: "تمت الإضافة",
        text: "تم إضافة الغرفة بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      setShowAddModal(false);
      setFormData({
        name: "",
        hourCost: "",
        notes: "",
        isAvailable: true,
        isActive: true,
      });
      setFormErrors({});
      fetchRooms();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في إضافة الغرفة",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
        willClose: () => {},
      });
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!editFormData.name.trim()) errors.name = "اسم الغرفة مطلوب";
    if (!editFormData.hourCost || editFormData.hourCost <= 0)
      errors.hourCost = "سعر الساعة يجب أن يكون أكبر من 0";
    if (editFormData.notes.length > 200)
      errors.notes = "الملاحظات يجب أن لا تتجاوز 200 حرف";

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      await axiosInstance.put(
        `/api/Rooms/Update/${editingRoom.id}`,
        editFormData
      );

      Swal.fire({
        icon: "success",
        title: "تم التحديث",
        text: "تم تحديث الغرفة بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      setShowEditModal(false);
      setEditingRoom(null);
      setEditFormData({
        name: "",
        hourCost: "",
        notes: "",
        isAvailable: true,
        isActive: true,
      });
      setEditFormErrors({});
      fetchRooms();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في تحديث الغرفة",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
        willClose: () => {},
      });
    }
  };

  const handleDeleteRoom = (id, name) => {
    Swal.fire({
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف الغرفة "${name}"؟`,
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
          await axiosInstance.delete(`/api/Rooms/Delete/${id}`);

          Swal.fire({
            icon: "success",
            title: "تم الحذف",
            text: "تم حذف الغرفة بنجاح",
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });

          fetchRooms();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف الغرفة",
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

  const handleToggleActiveStatus = async (id, currentStatus, name) => {
    try {
      await axiosInstance.put(`/api/Rooms/ChangeActiveStatus/${id}`);

      Swal.fire({
        icon: "success",
        title: "تم التغيير",
        text: `تم ${currentStatus ? "تعطيل" : "تفعيل"} الغرفة "${name}" بنجاح`,
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      fetchRooms();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تغيير حالة الغرفة",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setEditFormData({
      name: room.name,
      hourCost: room.hourCost,
      notes: room.notes || "",
      isAvailable: room.isAvailable,
      isActive: room.isActive,
    });
    setShowEditModal(true);
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.isAvailable).length,
    activeRooms: rooms.filter((r) => r.isActive).length,
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
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
        className="fixed md:absolute top-4 md:top-6 left-4 md:left-6 z-10 group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-violet-500 transition-all duration-300 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <ArrowLeft
          size={20}
          className="text-gray-300 group-hover:text-violet-300 transition-colors"
        />
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <RoomIcon size={32} className="text-violet-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-1">
                  إدارة الغرف
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  إدارة غرف والتكاليف والجلسات
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
                  placeholder="بحث باسم الغرفة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={fetchRooms}
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-violet-500 hover:bg-gray-700 transition-all duration-300"
                title="تحديث القائمة"
              >
                <RefreshCw size={20} className="text-gray-300" />
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
              >
                <PlusCircle size={18} />
                <span>إضافة غرفة جديدة</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الغرف</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalRooms}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-lg">
                  <RoomIcon size={20} className="text-violet-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">غرف متاحة</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.availableRooms}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-lg">
                  <CheckCircle size={20} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">غرف مفعلة</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {stats.activeRooms}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg">
                  <Power size={20} className="text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900/50">
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold min-w-[350px]">
                    <div className="flex items-center gap-2">
                      <RoomIcon size={16} />
                      اسم الغرفة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Banknote size={16} />
                      سعر الساعة (ج.م)
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Info size={16} />
                      الحالة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Edit2 size={16} />
                      الإجراءات
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-gray-700/30 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <RoomIcon size={20} className="text-violet-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-32 bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="h-2 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RoomIcon size={48} className="text-gray-600" />
                        <p className="text-gray-400">لا توجد غرف</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 min-w-[350px]">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex-shrink-0">
                            <RoomIcon size={18} className="text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white mb-1">
                              {room.name}
                            </p>
                            {room.notes && (
                              <p className="text-xs text-gray-400 mt-1 max-w-full truncate">
                                {room.notes.length > 50
                                  ? `${room.notes.substring(0, 50)}...`
                                  : room.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 rounded-full text-sm font-medium border border-cyan-600/30">
                            {room.hourCost} ج.م
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              room.isAvailable
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {room.isAvailable ? (
                              <>
                                <CheckCircle size={12} />
                                متاحة
                              </>
                            ) : (
                              <>
                                <XCircleIcon size={12} />
                                غير متاحة
                              </>
                            )}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              room.isActive
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            }`}
                          >
                            {room.isActive ? (
                              <>
                                <Power size={12} />
                                مفعلة
                              </>
                            ) : (
                              <>
                                <PowerOff size={12} />
                                معطلة
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(room)}
                            className="p-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/30 text-amber-400 hover:text-amber-300 hover:border-amber-500/50 rounded-lg transition-all duration-300"
                            title="تعديل الغرفة"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleActiveStatus(
                                room.id,
                                room.isActive,
                                room.name
                              )
                            }
                            className={`p-2 border rounded-lg transition-all duration-300 ${
                              room.isActive
                                ? "bg-gradient-to-r from-gray-600/20 to-gray-700/20 border-gray-600/30 text-gray-400 hover:text-gray-300 hover:border-gray-500/50"
                                : "bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-600/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50"
                            }`}
                            title={
                              room.isActive ? "تعطيل الغرفة" : "تفعيل الغرفة"
                            }
                          >
                            {room.isActive ? (
                              <PowerOff size={18} />
                            ) : (
                              <Power size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id, room.name)}
                            className="p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-600/30 text-red-400 hover:text-red-300 hover:border-red-500/50 rounded-lg transition-all duration-300"
                            title="حذف الغرفة"
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
              <div className="absolute -inset-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-lg">
                        <PlusCircle size={20} className="text-violet-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        إضافة غرفة جديدة
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setFormErrors({});
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    املأ البيانات لإضافة غرفة جديدة للنظام
                  </p>
                </div>

                <form onSubmit={handleAddRoom} className="p-6 space-y-5">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <RoomIcon size={16} />
                        اسم الغرفة *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name)
                            setFormErrors({ ...formErrors, name: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="أدخل اسم الغرفة"
                      />
                      {formErrors.name && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} />
                        سعر الساعة (ج.م) *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.hourCost}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            hourCost: Number(e.target.value) || "",
                          });
                          if (formErrors.hourCost)
                            setFormErrors({ ...formErrors, hourCost: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="أدخل سعر الساعة"
                      />
                      {formErrors.hourCost && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.hourCost}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Info size={16} />
                        الملاحظات (اختياري)
                      </div>
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.notes}
                        onChange={(e) => {
                          setFormData({ ...formData, notes: e.target.value });
                          if (formErrors.notes)
                            setFormErrors({ ...formErrors, notes: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                        placeholder="أدخل أي ملاحظات إضافية (200 حرف كحد أقصى)"
                        maxLength={200}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {formErrors.notes && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {formErrors.notes}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs text-left">
                          {formData.notes.length}/200
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isAvailable: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span>متاحة للاستخدام</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500"
                        />
                        <span>مفعلة في النظام</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setFormErrors({});
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-semibold text-white hover:from-gray-600 hover:to-gray-500 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={!isAddFormValid()}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isAddFormValid()
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                          : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Save size={18} />
                      إضافة الغرفة
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div ref={editModalRef} className="relative w-full max-w-md">
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg">
                        <Edit2 size={20} className="text-amber-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        تعديل الغرفة
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingRoom(null);
                        setEditFormErrors({});
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    تعديل بيانات الغرفة
                  </p>
                </div>

                <form onSubmit={handleEditRoom} className="p-6 space-y-5">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <RoomIcon size={16} />
                        اسم الغرفة *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => {
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          });
                          if (editFormErrors.name)
                            setEditFormErrors({ ...editFormErrors, name: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                      {editFormErrors.name && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {editFormErrors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} />
                        سعر الساعة (ج.م) *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={editFormData.hourCost}
                        onChange={(e) => {
                          setEditFormData({
                            ...editFormData,
                            hourCost: Number(e.target.value) || "",
                          });
                          if (editFormErrors.hourCost)
                            setEditFormErrors({
                              ...editFormErrors,
                              hourCost: "",
                            });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                      {editFormErrors.hourCost && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {editFormErrors.hourCost}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Info size={16} />
                        الملاحظات (اختياري)
                      </div>
                    </label>
                    <div className="relative">
                      <textarea
                        value={editFormData.notes}
                        onChange={(e) => {
                          setEditFormData({
                            ...editFormData,
                            notes: e.target.value,
                          });
                          if (editFormErrors.notes)
                            setEditFormErrors({ ...editFormErrors, notes: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                        maxLength={200}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {editFormErrors.notes && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {editFormErrors.notes}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs text-left">
                          {editFormData.notes.length}/200
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editFormData.isAvailable}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              isAvailable: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                        />
                        <span>متاحة للاستخدام</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editFormData.isActive}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                        />
                        <span>مفعلة في النظام</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingRoom(null);
                        setEditFormErrors({});
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-semibold text-white hover:from-gray-600 hover:to-gray-500 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={!isEditFormValid()}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isEditFormValid()
                          ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                          : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Save size={18} />
                      حفظ التغييرات
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

export default RoomsPage;
