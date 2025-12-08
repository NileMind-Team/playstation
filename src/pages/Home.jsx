import { useState, useEffect, useCallback } from "react";
import { PlusCircle, X } from "lucide-react";
import Swal from "sweetalert2";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import StatsCards from "../components/StatsCards";
import AddSessionForm from "../components/AddSessionForm";
import SessionCard from "../components/SessionCard";
import RoomsStatus from "../components/RoomsStatus";
import CashierModal from "../components/CashierModal";
import DrinksCashier from "../components/DrinksCashier";
import axiosInstance from "../api/axiosInstance";
import {
  getCurrentDate,
  getTomorrowDate,
  arabicTimeToMinutes,
  formatApiTimeToArabic,
  formatApiDate,
  toEnglishNumbers,
  toArabicNumbers,
} from "../utils/arabicNumbers";

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    customerName: "",
    phone: "",
    clientId: null,
    roomNumber: "",
    startTime: "",
    endTime: "",
    notes: "",
    clientNotes: "",
    discount: 0,
    selectedClientType: "new",
  });

  const [cashierState, setCashierState] = useState({
    isOpen: false,
    currentSession: null,
  });

  const [editModal, setEditModal] = useState({
    isOpen: false,
    session: null,
    loading: false,
    endTime: "",
    discount: 0,
    notes: "",
    originalEndTime: "",
    originalDiscount: 0,
    originalNotes: "",
    originalEndTimeISO: null, // إضافة جديدة لحفظ الوقت الأصلي كـ ISO
  });

  const [activeTab, setActiveTab] = useState("sessions");
  const [timerValues, setTimerValues] = useState({});

  useEffect(() => {
    fetchSessions();
    fetchRooms();
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAllTimers = useCallback(() => {
    const newTimerValues = {};

    sessions.forEach((session) => {
      const timerValue = calculateTimerValue(session);
      newTimerValues[session.id] = timerValue;
    });

    setTimerValues(newTimerValues);
  }, [sessions]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      updateAllTimers();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [updateAllTimers]);

  const calculateTimerValue = (session) => {
    const now = new Date();
    const today = new Date();

    const sessionDateStr = session.arabicDate || session.date;
    const englishDate = toEnglishNumbers(sessionDateStr);

    let day, month, year;

    if (englishDate.includes("-")) {
      [day, month, year] = englishDate.split("-").map(Number);
    } else if (englishDate.includes("/")) {
      [day, month, year] = englishDate.split("/").map(Number);
    } else {
      return {
        type: "upcoming",
        value: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const sessionDate = new Date(year, month - 1, day);

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const sessionDateOnly = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );

    const startTimeInMinutes = arabicTimeToMinutes(session.startTime);
    const hasEndTime =
      session.endTime && session.endTime !== "٠٠:٠٠" && session.endTime !== "";
    const endTimeInMinutes = hasEndTime
      ? arabicTimeToMinutes(session.endTime)
      : null;

    const startDateTime = new Date(sessionDate);
    startDateTime.setHours(Math.floor(startTimeInMinutes / 60));
    startDateTime.setMinutes(startTimeInMinutes % 60);
    startDateTime.setSeconds(0);

    let endDateTime = null;
    if (hasEndTime) {
      endDateTime = new Date(sessionDate);
      if (endTimeInMinutes < startTimeInMinutes) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      endDateTime.setHours(Math.floor(endTimeInMinutes / 60));
      endDateTime.setMinutes(endTimeInMinutes % 60);
      endDateTime.setSeconds(0);
    }

    if (sessionDateOnly > todayDate) {
      if (hasEndTime) {
        const timeUntilStart = Math.floor((startDateTime - now) / 1000);
        const totalDuration = Math.floor((endDateTime - startDateTime) / 1000);

        if (timeUntilStart > 0) {
          return {
            type: "upcoming",
            value: totalDuration,
            hours: Math.floor(totalDuration / 3600),
            minutes: Math.floor((totalDuration % 3600) / 60),
            seconds: totalDuration % 60,
          };
        }
      } else {
        return {
          type: "upcoming",
          value: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }
    }

    if (sessionDateOnly.getTime() === todayDate.getTime()) {
      const timeUntilStart = Math.floor((startDateTime - now) / 1000);

      if (timeUntilStart > 0) {
        if (hasEndTime) {
          const totalDuration = Math.floor(
            (endDateTime - startDateTime) / 1000
          );
          return {
            type: "upcoming",
            value: totalDuration,
            hours: Math.floor(totalDuration / 3600),
            minutes: Math.floor((totalDuration % 3600) / 60),
            seconds: totalDuration % 60,
          };
        } else {
          return {
            type: "upcoming",
            value: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }
      }

      const timeSinceStart = Math.floor((now - startDateTime) / 1000);

      if (hasEndTime) {
        const timeUntilEnd = Math.floor((endDateTime - now) / 1000);

        if (timeUntilEnd > 0) {
          return {
            type: "countdown",
            value: timeUntilEnd,
            hours: Math.floor(timeUntilEnd / 3600),
            minutes: Math.floor((timeUntilEnd % 3600) / 60),
            seconds: timeUntilEnd % 60,
          };
        } else {
          return {
            type: "finished",
            value: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }
      } else {
        return {
          type: "countup",
          value: timeSinceStart > 0 ? timeSinceStart : 0,
          hours: Math.floor(timeSinceStart / 3600),
          minutes: Math.floor((timeSinceStart % 3600) / 60),
          seconds: timeSinceStart % 60,
        };
      }
    }

    if (sessionDateOnly < todayDate) {
      if (hasEndTime) {
        if (now > endDateTime) {
          return {
            type: "finished",
            value: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }
      } else {
        const timeSinceStart = Math.floor((now - startDateTime) / 1000);
        return {
          type: "countup",
          value: timeSinceStart > 0 ? timeSinceStart : 0,
          hours: Math.floor(timeSinceStart / 3600),
          minutes: Math.floor((timeSinceStart % 3600) / 60),
          seconds: timeSinceStart % 60,
        };
      }
    }

    return {
      type: "upcoming",
      value: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  };

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await axiosInstance.get("/api/Clients/GetAll");

      const formattedClients = response.data.map((client) => ({
        id: client.id,
        name: client.name,
        phoneNumber: client.phoneNumber,
        notes: client.notes || "",
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error("خطأ في جلب العملاء:", error);
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/Sessions/GetAll");

      const formattedSessions = response.data.map((session) => ({
        id: session.id,
        customerName: session.client?.name || "بدون اسم",
        phone: session.client?.phoneNumber || "بدون رقم",
        roomNumber: session.room?.name || "بدون غرفة",
        startTime: formatApiTimeToArabic(session.startTime),
        endTime: session.endTime ? formatApiTimeToArabic(session.endTime) : "",
        duration: `${session.totalHours || 0} ساعة`,
        status: session.status,
        date: formatApiDate(session.startTime),
        arabicDate: formatApiDate(session.startTime),
        originalData: session,
      }));

      setSessions(formattedSessions);

      const initialTimerValues = {};
      formattedSessions.forEach((session) => {
        initialTimerValues[session.id] = calculateTimerValue(session);
      });
      setTimerValues(initialTimerValues);
    } catch (error) {
      console.error("خطأ في جلب الجلسات:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get("/api/Rooms/GetAll");

      const formattedRooms = response.data.map((room) => ({
        id: room.id,
        name: room.name,
        status: room.isAvailable ? "متاحة" : "مشغولة",
        hourCost: room.hourCost,
      }));

      setAvailableRooms(formattedRooms);
    } catch (error) {
      console.error("خطأ في جلب الغرف:", error);
      setAvailableRooms([
        { id: 1, name: "غرفة ١", status: "متاحة", hourCost: 40 },
        { id: 2, name: "غرفة ٢", status: "متاحة", hourCost: 190 },
        { id: 3, name: "غرفة ٣", status: "متاحة", hourCost: 50 },
        { id: 4, name: "غرفة ٤", status: "متاحة", hourCost: 60 },
        { id: 5, name: "غرفة ٥", status: "قيد الصيانة", hourCost: 70 },
        { id: 6, name: "غرفة ٦", status: "متاحة", hourCost: 80 },
      ]);
    }
  };

  const handleOpenEditModal = async (session) => {
    try {
      setEditModal({
        ...editModal,
        isOpen: true,
        loading: true,
        session: session,
      });

      const response = await axiosInstance.get(
        `/api/Sessions/Get/${session.id}`
      );
      const sessionData = response.data;

      const endTime24Format = sessionData.endTime
        ? convertTo24HourFormat(formatApiTimeToArabic(sessionData.endTime))
        : "";

      setEditModal({
        isOpen: true,
        loading: false,
        session: session,
        endTime: endTime24Format,
        discount: sessionData.discount || 0,
        notes: sessionData.notes || "",
        originalEndTime: endTime24Format,
        originalDiscount: sessionData.discount || 0,
        originalNotes: sessionData.notes || "",
        originalEndTimeISO: sessionData.endTime || null, // حفظ الـ ISO الأصلي
      });
    } catch (error) {
      console.error("خطأ في فتح نموذج التعديل:", error);

      Swal.fire({
        title: "حدث خطأ",
        text: "تعذر تحميل بيانات الجلسة",
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      session: null,
      loading: false,
      endTime: "",
      discount: 0,
      notes: "",
      originalEndTime: "",
      originalDiscount: 0,
      originalNotes: "",
      originalEndTimeISO: null,
    });
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();

    if (!editModal.session) return;

    try {
      const {
        endTime,
        discount,
        notes,
        originalEndTime,
        originalDiscount,
        originalNotes,
        originalEndTimeISO,
      } = editModal;

      if (
        endTime === originalEndTime &&
        discount === originalDiscount &&
        notes === originalNotes
      ) {
        Swal.fire({
          title: "لا توجد تغييرات",
          text: "لم تقم بإجراء أي تغييرات",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          background: "#0f172a",
          color: "#e2e8f0",
        });
        return;
      }

      // تحديد الـ endTime المناسب لإرساله
      let endTimeISO = originalEndTimeISO; // الافتراضي: الوقت الأصلي

      if (endTime !== originalEndTime) {
        // إذا كان هناك تغيير في وقت الانتهاء
        if (endTime) {
          // تحويل الوقت الجديد إلى ISO
          const arabicTimeWithPeriod = convert24HourToArabicTime(endTime);
          endTimeISO = convertArabicTimeToISO(
            arabicTimeWithPeriod,
            editModal.session.date
          );
        } else {
          // إذا حذفنا الوقت (أصبح فارغ)
          endTimeISO = null;
        }
      }
      // إذا لم يتغير وقت الانتهاء، endTimeISO سيبقى القيمة الأصلية

      // تحديد الخصم المناسب
      const discountToSend =
        discount !== originalDiscount ? discount : originalDiscount;

      // تحديد الملاحظات المناسبة
      const notesToSend = notes !== originalNotes ? notes : originalNotes;

      const requestData = {
        endTime: endTimeISO,
        discount: discountToSend,
        notes: notesToSend,
        items: [],
      };

      Swal.fire({
        title: "جاري التحديث...",
        text: "يرجى الانتظار",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#0f172a",
        color: "#e2e8f0",
      });

      await axiosInstance.put(
        `/api/Sessions/Update/${editModal.session.id}`,
        requestData
      );

      await fetchSessions();

      handleCloseEditModal();

      Swal.fire({
        title: "تم التعديل بنجاح",
        text: "تم تحديث بيانات الجلسة بنجاح",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        background: "#0f172a",
        color: "#e2e8f0",
      });
    } catch (error) {
      console.error("خطأ في تحديث الجلسة:", error);

      Swal.fire({
        title: "حدث خطأ",
        text: `خطأ في تحديث الجلسة: ${
          error.response?.data?.message || error.message
        }`,
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleDeleteSession = async (id, roomNumber) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لن تتمكن من استعادة هذه الجلسة بعد الحذف!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء",
        background: "#0f172a",
        color: "#e2e8f0",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "جاري الحذف...",
          text: "يرجى الانتظار",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: "#0f172a",
          color: "#e2e8f0",
        });

        await axiosInstance.delete(`/api/Sessions/Delete/${id}`);

        setSessions((prev) => prev.filter((session) => session.id !== id));

        setTimerValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });

        const updatedRooms = availableRooms.map((room) => {
          if (room.name === roomNumber) {
            return { ...room, status: "متاحة" };
          }
          return room;
        });

        setAvailableRooms(updatedRooms);

        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف الجلسة بنجاح.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          background: "#0f172a",
          color: "#e2e8f0",
        });
      }
    } catch (error) {
      console.error("Error deleting session:", error);

      Swal.fire({
        title: "خطأ!",
        text: `خطأ في حذف الجلسة: ${
          error.response?.data?.message || error.message
        }`,
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const handleOpenCashier = (session) => {
    setCashierState({
      isOpen: true,
      currentSession: session,
    });
  };

  const handleCloseCashier = () => {
    setCashierState({
      isOpen: false,
      currentSession: null,
    });
  };

  const handleConfirmOrder = (sessionId, cartItems, totalAmount) => {
    console.log("Order confirmed:", {
      sessionId,
      cartItems,
      totalAmount,
      timestamp: new Date().toISOString(),
    });

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              hasOrder: true,
              orderTotal: totalAmount,
            }
          : session
      )
    );
  };

  const handleAddSession = async (sessionData) => {
    try {
      const selectedRoom = availableRooms.find(
        (room) => room.name === sessionData.roomNumber
      );

      if (!selectedRoom) {
        Swal.fire({
          title: "خطأ",
          text: "الغرفة المحددة غير موجودة",
          icon: "error",
          confirmButtonColor: "#d33",
          background: "#0f172a",
          color: "#e2e8f0",
        });
        return;
      }

      const startTimeISO = convertArabicTimeToISO(
        sessionData.startTime,
        sessionData.date
      );
      const endTimeISO = convertArabicTimeToISO(
        sessionData.endTime,
        sessionData.date
      );

      const requestData = {
        roomId: selectedRoom.id,
        startTime: startTimeISO,
        endTime: endTimeISO,
        discount: sessionData.discount || 0,
        notes: sessionData.notes || "",
      };

      if (
        sessionData.selectedClientType === "existing" &&
        sessionData.clientId
      ) {
        requestData.clientId = sessionData.clientId;
      } else {
        requestData.client = {
          name: sessionData.customerName,
          phoneNumber: sessionData.phone,
          notes: sessionData.clientNotes || "",
        };
      }

      Swal.fire({
        title: "جاري الإضافة...",
        text: "يرجى الانتظار",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#0f172a",
        color: "#e2e8f0",
      });

      await axiosInstance.post("/api/Sessions/Add", requestData);

      await fetchSessions();

      const updatedRooms = availableRooms.map((room) => {
        if (room.name === sessionData.roomNumber) {
          return { ...room, status: "مشغولة" };
        }
        return room;
      });

      setAvailableRooms(updatedRooms);

      setNewSession({
        customerName: "",
        phone: "",
        clientId: null,
        roomNumber: "",
        startTime: "",
        endTime: "",
        notes: "",
        clientNotes: "",
        discount: 0,
        selectedClientType: "new",
      });

      setShowAddForm(false);

      Swal.fire({
        title: "تم الإضافة بنجاح!",
        text: `تمت إضافة جلسة جديدة للعميل ${sessionData.customerName} في ${sessionData.roomNumber}`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        background: "#0f172a",
        color: "#e2e8f0",
      });
    } catch (error) {
      console.error("Error adding session:", error);

      Swal.fire({
        title: "خطأ!",
        text: `خطأ في إضافة الجلسة: ${
          error.response?.data?.message || error.message
        }`,
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const convertArabicTimeToISO = (arabicTime, arabicDate) => {
    const englishTime = toEnglishNumbers(arabicTime);
    const englishDate = toEnglishNumbers(arabicDate);

    let [day, month, year] = englishDate.split("-").map(Number);
    let [time, period] = englishTime.split(" ");

    let [hours, minutes] = time.split(":").map(Number);

    if (period === "مساءً" && hours < 12) {
      hours += 12;
    } else if (period === "ظهراً" && hours < 12) {
      hours += 12;
    } else if (period === "صباحاً" && hours === 12) {
      hours = 0;
    }

    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toISOString();
  };

  const convertTo24HourFormat = (arabicTime) => {
    if (!arabicTime) return "";

    const englishTime = toEnglishNumbers(arabicTime);
    const [time, period] = englishTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "مساءً" || period === "ظهراً") {
      if (hours !== 12) hours += 12;
    } else if (period === "صباحاً" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const convert24HourToArabicTime = (time24) => {
    if (!time24) return "";

    let [hours, minutes] = time24.split(":").map(Number);
    let period = "صباحاً";

    if (hours >= 12) {
      period = "مساءً";
      if (hours > 12) hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${toArabicNumbers(hours)}:${toArabicNumbers(
      minutes.toString().padStart(2, "0")
    )} ${period}`;
  };

  const activeSessionsCount = sessions.filter(
    (session) => session.status === "Active" || session.status === "Pending"
  ).length;

  const todaySessions = sessions.filter(
    (session) =>
      toEnglishNumbers(session.date) === toEnglishNumbers(getCurrentDate())
  ).length;

  const tomorrowSessions = sessions.filter(
    (session) =>
      toEnglishNumbers(session.date) === toEnglishNumbers(getTomorrowDate())
  ).length;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6 relative"
    >
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseEditModal}
          />

          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold">تعديل الجلسة</h2>
                {editModal.session && (
                  <p className="text-gray-400 text-sm mt-1">
                    {editModal.session.customerName} -{" "}
                    {editModal.session.roomNumber}
                  </p>
                )}
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {editModal.loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 mt-4">
                      جاري تحميل بيانات الجلسة...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateSession}>
                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2">
                      وقت الانتهاء
                    </label>
                    <input
                      type="time"
                      value={editModal.endTime}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2">
                      الخصم (بالجنيه)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editModal.discount}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          discount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-8">
                    <label className="block text-gray-400 text-sm mb-2">
                      الملاحظات
                    </label>
                    <textarea
                      value={editModal.notes}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                      placeholder="أدخل الملاحظات..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={
                        editModal.endTime === editModal.originalEndTime &&
                        editModal.discount === editModal.originalDiscount &&
                        editModal.notes === editModal.originalNotes
                      }
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        editModal.endTime === editModal.originalEndTime &&
                        editModal.discount === editModal.originalDiscount &&
                        editModal.notes === editModal.originalNotes
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95"
                      }`}
                    >
                      حفظ التعديلات
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "sessions" ? (
        <>
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <SearchBar />
            <StatsCards
              stats={{ activeSessionsCount, todaySessions, tomorrowSessions }}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">الجلسات النشطة حالياً</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-reverse space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle size={20} />
              <span>إضافة جلسة جديدة</span>
            </button>
          </div>

          <AddSessionForm
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            newSession={newSession}
            setNewSession={setNewSession}
            availableRooms={availableRooms}
            clients={clients}
            clientsLoading={clientsLoading}
            handleAddSession={handleAddSession}
          />

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 mt-4">جاري تحميل الجلسات...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    timerValue={timerValues[session.id]}
                    handleDeleteSession={handleDeleteSession}
                    onOpenCashier={handleOpenCashier}
                    onOpenEditModal={handleOpenEditModal}
                  />
                ))}
              </div>

              {sessions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">لا توجد جلسات حالياً</p>
                </div>
              )}
            </>
          )}

          <RoomsStatus availableRooms={availableRooms} />

          <CashierModal
            isOpen={cashierState.isOpen}
            onClose={handleCloseCashier}
            session={cashierState.currentSession}
            onConfirmOrder={handleConfirmOrder}
          />
        </>
      ) : (
        <>
          <DrinksCashier />
        </>
      )}
    </div>
  );
}
