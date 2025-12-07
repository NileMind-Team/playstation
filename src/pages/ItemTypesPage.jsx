import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PlusCircle,
  Tag,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  XCircle,
  Save,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const ItemTypesPage = () => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const editModalRef = useRef(null);

  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    notes: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  const isAddFormValid = () => {
    return formData.name.trim() !== "";
  };

  const isEditFormValid = () => {
    return editFormData.name.trim() !== "";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddModal(false);
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setShowEditModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const fetchItemTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/ItemTypes/GetAll");
      setItemTypes(response.data);
    } catch (error) {
      console.error("خطأ في جلب أنواع المنتجات:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات أنواع المنتجات",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchItemTypes();
    }
  }, [isAdmin]);

  const handleAddItemType = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "اسم النوع مطلوب";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axiosInstance.post("/api/ItemTypes/Add", formData);

      Swal.fire({
        icon: "success",
        title: "تمت الإضافة",
        text: "تم إضافة نوع المنتج بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
      });

      setShowAddModal(false);
      setFormData({ name: "", notes: "" });
      setFormErrors({});
      fetchItemTypes();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في إضافة نوع المنتج",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleEditItemType = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!editFormData.name.trim()) errors.name = "اسم النوع مطلوب";

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      await axiosInstance.put(
        `/api/ItemTypes/Update/${editingItem.id}`,
        editFormData
      );

      Swal.fire({
        icon: "success",
        title: "تم التحديث",
        text: "تم تحديث نوع المنتج بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
      });

      setShowEditModal(false);
      setEditingItem(null);
      setEditFormData({ name: "", notes: "" });
      setEditFormErrors({});
      fetchItemTypes();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في تحديث نوع المنتج",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleDeleteItemType = (id, name) => {
    Swal.fire({
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف نوع المنتج "${name}"؟`,
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
          await axiosInstance.delete(`/api/ItemTypes/Delete/${id}`);

          Swal.fire({
            icon: "success",
            title: "تم الحذف",
            text: "تم حذف نوع المنتج بنجاح",
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
          });

          fetchItemTypes();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف نوع المنتج",
            background: "#0f172a",
            color: "#e2e8f0",
          });
        }
      }
    });
  };

  const openEditModal = (itemType) => {
    setEditingItem(itemType);
    setEditFormData({
      name: itemType.name,
      notes: itemType.notes || "",
    });
    setShowEditModal(true);
  };

  const filteredItemTypes = itemTypes.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
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
        className="fixed md:absolute top-4 md:top-6 left-4 md:left-6 z-10 group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-emerald-500 transition-all duration-300 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <ArrowLeft
          size={20}
          className="text-gray-300 group-hover:text-emerald-300 transition-colors"
        />
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <Package size={32} className="text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent pb-1">
                  إدارة أنواع المنتجات
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  إدارة أنواع المنتجات والخدمات في النظام
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
                  placeholder="بحث باسم نوع المنتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={fetchItemTypes}
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-emerald-500 hover:bg-gray-700 transition-all duration-300"
                title="تحديث القائمة"
              >
                <RefreshCw size={20} className="text-gray-300" />
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
              >
                <PlusCircle size={18} />
                <span>إضافة نوع جديد</span>
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
                      <Tag size={16} />
                      اسم النوع
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Package size={16} />
                      الملاحظات
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
                    <td colSpan="3" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-gray-700/30 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Package size={20} className="text-emerald-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-32 bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="h-2 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredItemTypes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package size={48} className="text-gray-600" />
                        <p className="text-gray-400">لا توجد أنواع منتجات</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItemTypes.map((itemType) => (
                    <tr
                      key={itemType.id}
                      className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600/20 to-teal-600/20">
                            <Tag size={18} className="text-emerald-400" />
                          </div>
                          <p className="font-medium text-white">
                            {itemType.name}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="max-w-md">
                          <p className="text-gray-300">
                            {itemType.notes || "لا توجد ملاحظات"}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(itemType)}
                            className="p-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/30 text-amber-400 hover:text-amber-300 hover:border-amber-500/50 rounded-lg transition-all duration-300"
                            title="تعديل النوع"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItemType(itemType.id, itemType.name)
                            }
                            className="p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-600/30 text-red-400 hover:text-red-300 hover:border-red-500/50 rounded-lg transition-all duration-300"
                            title="حذف النوع"
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
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-lg">
                        <PlusCircle size={20} className="text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        إضافة نوع منتج جديد
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
                    املأ البيانات لإضافة نوع منتج جديد للنظام
                  </p>
                </div>

                <form onSubmit={handleAddItemType} className="p-6 space-y-5">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag size={16} />
                        اسم النوع *
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
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="أدخل اسم نوع المنتج"
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
                        <Package size={16} />
                        الملاحظات (اختياري)
                      </div>
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                      placeholder="أدخل أي ملاحظات إضافية"
                    />
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
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                          : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Save size={18} />
                      إضافة النوع
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
                        تعديل نوع المنتج
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                        setEditFormErrors({});
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    تعديل بيانات نوع المنتج
                  </p>
                </div>

                <form onSubmit={handleEditItemType} className="p-6 space-y-5">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag size={16} />
                        اسم النوع *
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
                        <Package size={16} />
                        الملاحظات (اختياري)
                      </div>
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
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

export default ItemTypesPage;
