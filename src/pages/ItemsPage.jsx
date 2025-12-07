import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Search,
  RefreshCw,
  Tag,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  X,
  Check,
  ShoppingBag,
  DollarSign,
  Sparkles,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const ItemsPage = () => {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    notes: "",
    itemTypeId: "",
    isAvailable: true,
    isActive: true,
    selectableInSession: true,
  });
  const [formErrors, setFormErrors] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const BASE_URL = "https://cyberplay.runasp.net/";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddModal(false);
        setShowEditModal(false);
      }
    };

    if (showAddModal || showEditModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [showAddModal, showEditModal]);

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

  const fetchItemTypes = async () => {
    try {
      const response = await axiosInstance.get("/api/ItemTypes/GetAll");
      setItemTypes(response.data);
    } catch (error) {
      console.error("خطأ في جلب أنواع المنتجات:", error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Items/GetAll");
      setItems(response.data);
    } catch (error) {
      console.error("خطأ في جلب المنتجات:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات المنتجات",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchItems();
      fetchItemTypes();
    }
  }, [isAdmin]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "اسم المنتج مطلوب";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "السعر يجب أن يكون أكبر من صفر";
    }

    if (!formData.itemTypeId) {
      errors.itemTypeId = "نوع المنتج مطلوب";
    }

    return errors;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ItemTypeId", formData.itemTypeId);
      formDataToSend.append("Name", formData.name);
      formDataToSend.append("Price", formData.price);
      formDataToSend.append("Notes", formData.notes || "");
      formDataToSend.append("IsAvailable", formData.isAvailable);
      formDataToSend.append("IsActive", formData.isActive);
      formDataToSend.append(
        "SelectableInSession",
        formData.selectableInSession
      );

      if (imageFile) {
        formDataToSend.append("Image", imageFile);
      }

      await axiosInstance.post("/api/Items/Add", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "تمت الإضافة",
        text: "تم إضافة المنتج بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
      });

      setShowAddModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في إضافة المنتج",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ItemTypeId", formData.itemTypeId);
      formDataToSend.append("Name", formData.name);
      formDataToSend.append("Price", formData.price);
      formDataToSend.append("Notes", formData.notes || "");
      formDataToSend.append("IsAvailable", formData.isAvailable);
      formDataToSend.append("IsActive", formData.isActive);
      formDataToSend.append(
        "SelectableInSession",
        formData.selectableInSession
      );

      if (imageFile) {
        formDataToSend.append("Image", imageFile);
      } else if (currentImageUrl && !imageFile) {
        try {
          const imageResponse = await fetch(currentImageUrl);
          const imageBlob = await imageResponse.blob();

          const fileName =
            currentImageUrl.split("/").pop() || "current_image.jpg";
          const file = new File([imageBlob], fileName, {
            type: imageBlob.type,
          });
          formDataToSend.append("Image", file);
        } catch (fetchError) {
          console.error("Error fetching current image:", fetchError);
          formDataToSend.append(
            "Image",
            new File([], "empty", { type: "image/jpeg" })
          );
        }
      }

      await axiosInstance.put(
        `/api/Items/Update/${selectedItem.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "تم التحديث",
        text: "تم تحديث المنتج بنجاح",
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
      });

      setShowEditModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
      let errorMessage = "فشل في تحديث المنتج";

      if (error.response?.data?.errors?.Image) {
        errorMessage = error.response.data.errors.Image.join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: errorMessage,
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleDeleteItem = (itemId, itemName) => {
    Swal.fire({
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف المنتج "${itemName}"؟`,
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
          await axiosInstance.delete(`/api/Items/Delete/${itemId}`);

          Swal.fire({
            icon: "success",
            title: "تم الحذف",
            text: "تم حذف المنتج بنجاح",
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
          });

          fetchItems();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المنتج",
            background: "#0f172a",
            color: "#e2e8f0",
          });
        }
      }
    });
  };

  const handleToggleActiveStatus = async (itemId, currentStatus, itemName) => {
    Swal.fire({
      title: "تغيير الحالة",
      text: `هل أنت متأكد من ${
        currentStatus ? "تعطيل" : "تفعيل"
      } المنتج "${itemName}"؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: currentStatus ? "نعم، عطّل" : "نعم، فعّل",
      cancelButtonText: "إلغاء",
      background: "#0f172a",
      color: "#e2e8f0",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.put(`/api/Items/ChangeActiveStatus/${itemId}`);

          Swal.fire({
            icon: "success",
            title: "تم التحديث",
            text: `تم ${currentStatus ? "تعطيل" : "تفعيل"} المنتج بنجاح`,
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
          });

          fetchItems();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في تغيير حالة المنتج",
            background: "#0f172a",
            color: "#e2e8f0",
          });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      notes: "",
      itemTypeId: "",
      isAvailable: true,
      isActive: true,
      selectableInSession: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
    setFormErrors({});
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      notes: item.notes || "",
      itemTypeId: item.itemType.id.toString(),
      isAvailable: item.isAvailable,
      isActive: item.isActive,
      selectableInSession: item.selectableInSession,
    });
    if (item.imageUrl) {
      const fullImageUrl = `${BASE_URL}${item.imageUrl}`;
      setImagePreview(fullImageUrl);
      setCurrentImageUrl(fullImageUrl);
    } else {
      setImagePreview(null);
      setCurrentImageUrl(null);
    }
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCurrentImageUrl(null);
    }
  };

  const sortedAndFilteredItems = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6 overflow-x-hidden"
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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <Package size={32} className="text-amber-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent pb-1">
                  إدارة المنتجات
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  إدارة جميع المنتجات والعروض في النظام
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
                  placeholder="بحث باسم المنتج أو النوع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={fetchItems}
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-amber-500 hover:bg-gray-700 transition-all duration-300"
                title="تحديث القائمة"
              >
                <RefreshCw size={20} className="text-gray-300" />
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-semibold text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]"
              >
                <Plus size={18} />
                <span>إضافة منتج</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl p-6 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div className="h-24 w-24 bg-gray-700 rounded-lg"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : sortedAndFilteredItems.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl p-12 text-center">
                <Package size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  لا توجد منتجات
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "لم يتم العثور على منتجات مطابقة للبحث"
                    : "لم يتم إضافة أي منتجات بعد"}
                </p>
              </div>
            </div>
          ) : (
            sortedAndFilteredItems.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-500 hover:-translate-y-1 ${
                  !item.notes ? "flex flex-col" : ""
                }`}
              >
                {/* تأثير الخلفية المتوهجة */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* علامة المنتج */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-1">
                    {item.isActive ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-sm"></div>
                        <span className="relative px-3 py-1 bg-emerald-600 text-emerald-50 text-xs rounded-full font-medium border border-emerald-400/30 shadow-lg">
                          <Sparkles size={10} className="inline ml-1" />
                          نشط
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-sm"></div>
                        <span className="relative px-3 py-1 bg-red-600 text-red-50 text-xs rounded-full font-medium border border-red-400/30 shadow-lg">
                          غير نشط
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`p-5 relative z-0 ${
                    !item.notes ? "flex-1 flex flex-col" : ""
                  }`}
                >
                  <div className="relative mb-5">
                    <div className="absolute -inset-2 bg-gradient-to-r rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    {item.imageUrl ? (
                      <div className="relative overflow-hidden rounded-xl border border-gray-600/50">
                        <img
                          src={`${BASE_URL}${item.imageUrl}`}
                          alt={item.name}
                          className="w-full h-48 object-contain transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-600 flex items-center justify-center">
                        <ShoppingBag size={48} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* محتوى البطاقة */}
                  <div
                    className={`space-y-4 ${
                      !item.notes ? "flex-1 flex flex-col justify-between" : ""
                    }`}
                  >
                    {/* العنوان والسعر */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="text-xl font-bold text-white mb-2 line-clamp-1"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Tag size={14} className="text-amber-400" />
                          <span>{item.itemType.name}</span>
                        </div>
                      </div>

                      {/* السعر مع تصميم مميز */}
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 shadow-lg">
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} className="text-amber-300" />
                            <span className="text-2xl font-bold text-amber-300">
                              {item.price}
                            </span>
                            <span className="text-sm text-amber-200">ج.م</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الملاحظات - المسافة متساوية من الجانبين */}
                    {item.notes ? (
                      <div className="relative mx-3">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-4/5 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                        <p className="text-sm text-gray-300 pr-3 pl-3 line-clamp-2 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                          {item.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1"></div>
                    )}

                    {/* معلومات الحالة */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          item.isAvailable
                            ? "bg-emerald-900/20 border-emerald-700/30"
                            : "bg-gray-800/30 border-gray-700/50"
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-300">
                          التوفر
                        </span>
                        <div
                          className={`flex items-center gap-2 ${
                            item.isAvailable
                              ? "text-emerald-400"
                              : "text-gray-400"
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                              <span className="text-xs">متاح</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span className="text-xs">غير متاح</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          item.selectableInSession
                            ? "bg-indigo-900/20 border-indigo-700/30"
                            : "bg-gray-800/30 border-gray-700/50"
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-300">
                          قابل للجلسة
                        </span>
                        <div
                          className={`flex items-center gap-2 ${
                            item.selectableInSession
                              ? "text-indigo-400"
                              : "text-gray-400"
                          }`}
                        >
                          {item.selectableInSession ? (
                            <>
                              <Check size={14} />
                              <span className="text-xs">قابل</span>
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              <span className="text-xs">غير قابل</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="pt-4 border-t border-gray-700/50 mt-auto">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            handleToggleActiveStatus(
                              item.id,
                              item.isActive,
                              item.name
                            )
                          }
                          className={`relative overflow-hidden px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                            item.isActive
                              ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-300 border border-amber-500/30 hover:from-amber-600/30 hover:to-orange-600/30"
                              : "bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-300 border border-emerald-500/30 hover:from-emerald-600/30 hover:to-green-600/30"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative flex items-center gap-2">
                            {item.isActive ? (
                              <>
                                <X size={14} />
                                تعطيل
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                تفعيل
                              </>
                            )}
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="relative overflow-hidden p-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-500/50 transition-all duration-300 group/btn"
                            title="تعديل المنتج"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <Edit2 size={16} className="relative" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="relative overflow-hidden p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-lg border border-red-600/30 text-red-400 hover:text-red-300 hover:border-red-500/50 transition-all duration-300 group/btn"
                            title="حذف المنتج"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <Trash2 size={16} className="relative" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* تأثير زاوية مميزة */}
                <div className="absolute top-0 left-0 w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent rounded-br-2xl"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal لإضافة/تعديل المنتج */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
            <div
              ref={modalRef}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden"
            >
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                {/* Header مع تأثير متحرك */}
                <div className="relative overflow-hidden p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-2xl"></div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg blur"></div>
                        <div className="relative p-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700/50">
                          <Package size={20} className="text-amber-400" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {showAddModal ? "إضافة منتج جديد" : "تعديل المنتج"}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {showAddModal
                            ? "املأ البيانات لإضافة منتج جديد للنظام"
                            : "قم بتعديل بيانات المنتج"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={showAddModal ? handleAddItem : handleEditItem}
                  className="p-5 space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-amber-400" />
                          اسم المنتج
                        </div>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name)
                            setFormErrors({ ...formErrors, name: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="أدخل اسم المنتج"
                      />
                      {formErrors.name && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-2">
                          <AlertCircle size={12} />
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-emerald-400" />
                          <span>السعر (ج.م)</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value });
                          if (formErrors.price)
                            setFormErrors({ ...formErrors, price: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="أدخل السعر"
                      />
                      {formErrors.price && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-2">
                          <AlertCircle size={12} />
                          {formErrors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-blue-400" />
                          نوع المنتج
                        </div>
                      </label>
                      <select
                        value={formData.itemTypeId}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            itemTypeId: e.target.value,
                          });
                          if (formErrors.itemTypeId)
                            setFormErrors({ ...formErrors, itemTypeId: "" });
                        }}
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all backdrop-blur-sm"
                      >
                        <option value="">اختر نوع المنتج</option>
                        {itemTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.itemTypeId && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-2">
                          <AlertCircle size={12} />
                          {formErrors.itemTypeId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="text-purple-400" />
                          صورة المنتج
                        </div>
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer group/image">
                          <div className="relative overflow-hidden bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white hover:bg-gray-700/60 transition-all flex items-center justify-center gap-2 group-hover/image:border-amber-500/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 opacity-0 group-hover/image:opacity-100 transition-opacity"></div>
                            <Upload
                              size={16}
                              className="relative text-gray-300 group-hover/image:text-amber-300"
                            />
                            <span className="relative text-gray-300 group-hover/image:text-white">
                              اختر صورة
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="relative w-16 h-16 object-cover rounded-lg border border-gray-600 group-hover:border-amber-500/50 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                if (showEditModal && currentImageUrl) {
                                  setImagePreview(currentImageUrl);
                                }
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">
                        JPG, PNG, GIF - الحد الأقصى: 5MB
                      </p>
                      {showEditModal && currentImageUrl && !imageFile && (
                        <p className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                          <Check size={12} />
                          سيتم إرسال الصورة الحالية تلقائياً
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Edit2 size={16} className="text-indigo-400" />
                        ملاحظات (اختياري)
                      </div>
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all min-h-[100px] backdrop-blur-sm"
                      placeholder="أدخل أي ملاحظات إضافية عن المنتج"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-600 hover:border-emerald-500/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                          <Check size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-gray-300 text-sm font-medium">
                            متاح
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isAvailable: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-600 hover:border-amber-500/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                          <Package size={16} className="text-amber-400" />
                        </div>
                        <div>
                          <span className="text-gray-300 text-sm font-medium">
                            نشط
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-600 hover:border-indigo-500/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                          <Edit2 size={16} className="text-indigo-400" />
                        </div>
                        <div>
                          <span className="text-gray-300 text-sm font-medium">
                            قابل للاختيار
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectableInSession}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              selectableInSession: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-semibold text-white hover:from-gray-600 hover:to-gray-500 transition-all text-sm active:scale-[0.98]"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-semibold text-white hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] shadow-lg hover:shadow-amber-500/25"
                    >
                      {showAddModal ? (
                        <>
                          <Plus size={16} />
                          إضافة المنتج
                        </>
                      ) : (
                        <>
                          <Edit2 size={16} />
                          حفظ التعديلات
                        </>
                      )}
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

export default ItemsPage;
