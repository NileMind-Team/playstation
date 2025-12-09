import { useState, useEffect, useCallback, useRef } from "react";
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
  arabicTimeToMinutes,
  formatApiTimeToArabic,
  formatApiDate,
  toEnglishNumbers,
  toArabicNumbers,
  getSessionStatusText,
  shouldDisplaySession,
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
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
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
    originalEndTimeISO: null,
  });

  const [activeTab, setActiveTab] = useState("sessions");
  const [timerValues, setTimerValues] = useState({});
  const printFrameRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchRooms();
    fetchClients();

    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    printFrame.style.position = "absolute";
    printFrame.style.top = "-9999px";
    printFrame.style.left = "-9999px";
    document.body.appendChild(printFrame);
    printFrameRef.current = printFrame;

    return () => {
      if (printFrameRef.current) {
        document.body.removeChild(printFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAllTimers = useCallback(() => {
    const newTimerValues = {};

    sessions.forEach((session) => {
      if (shouldDisplaySession(session)) {
        const timerValue = calculateTimerValue(session);
        newTimerValues[session.id] = timerValue;

        if (timerValue.type === "countup" || timerValue.type === "countdown") {
          console.log(`الجلسة ${session.id} أصبحت نشطة في الـ UI`);
        } else if (timerValue.type === "finished") {
          console.log(`الجلسة ${session.id} أصبحت منتهية في الـ UI`);
        }
      }
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
        statusText: getSessionStatusText(session.status),
        date: formatApiDate(session.startTime),
        arabicDate: formatApiDate(session.startTime),
        originalData: session,
      }));

      const filteredSessions = formattedSessions.filter(shouldDisplaySession);

      setSessions(filteredSessions);

      const initialTimerValues = {};
      filteredSessions.forEach((session) => {
        initialTimerValues[session.id] = calculateTimerValue(session);
      });
      setTimerValues(initialTimerValues);

      await fetchRooms();
    } catch (error) {
      console.error("خطأ في جلب الجلسات:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get("/api/Rooms/GetAll");

      const formattedRooms = response.data
        .filter((room) => room.isActive)
        .map((room) => ({
          id: room.id,
          name: room.name,
          isAvailable: room.isAvailable,
          hourCost: room.hourCost,
          notes: room.notes || "",
        }));

      setAvailableRooms(formattedRooms);
    } catch (error) {
      console.error("خطأ في جلب الغرف:", error);
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
        originalEndTimeISO: sessionData.endTime || null,
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

      let endTimeISO = originalEndTimeISO;

      if (endTime !== originalEndTime) {
        if (endTime) {
          const arabicTimeWithPeriod = convert24HourToArabicTime(endTime);
          endTimeISO = convertArabicTimeToISO(
            arabicTimeWithPeriod,
            editModal.session.date
          );
        } else {
          endTimeISO = null;
        }
      }

      const discountToSend =
        discount !== originalDiscount ? discount : originalDiscount;
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
      await fetchRooms();

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

        await fetchRooms();

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

  const handleCompleteSession = async (session) => {
    try {
      const addCurrentTimeResult = await Swal.fire({
        title: "إضافة السعر حتى الوقت الحالي؟",
        html: `
        <div style="text-align: right;">
          <p><strong>العميل:</strong> ${session.customerName}</p>
          <p><strong>الغرفة:</strong> ${session.roomNumber}</p>
        </div>
      `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#d33",
        confirmButtonText: "نعم، أضف حتى الآن",
        cancelButtonText: "لا، حسب وقت الانتهاء",
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
        reverseButtons: true,
        customClass: {
          cancelButton: "cancel-button",
        },
      });

      if (addCurrentTimeResult.isDismissed) {
        return;
      }

      const paymentForTimeNow = addCurrentTimeResult.isConfirmed;

      const confirmResult = await Swal.fire({
        title: "تأكيد إتمام الجلسة",
        html: `
        <div style="text-align: right;">
          <p>هل أنت متأكد من إتمام الجلسة وطباعة الفاتورة؟</p>
          <p><strong>العميل:</strong> ${session.customerName}</p>
          <p><strong>الغرفة:</strong> ${session.roomNumber}</p>
          <p><strong>حساب السعر:</strong> ${
            paymentForTimeNow ? "حتى الوقت الحالي" : "حسب وقت الانتهاء"
          }</p>
        </div>
      `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "نعم، إتمام وطباعة",
        cancelButtonText: "إلغاء",
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
        reverseButtons: true,
      });

      if (confirmResult.isConfirmed) {
        try {
          Swal.fire({
            title: "جاري إتمام الجلسة...",
            text: "يرجى الانتظار",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });

          await axiosInstance.put(
            `/api/Sessions/Payment/${session.id}?paymentForTimeNow=${paymentForTimeNow}`
          );

          const sessionResponse = await axiosInstance.get(
            `/api/Sessions/Get/${session.id}`
          );
          const sessionData = sessionResponse.data;

          const receiptData = {
            id: session.id,
            customerName: session.customerName,
            customerPhone: session.phone,
            roomNumber: session.roomNumber,
            sessionPrice: sessionData.sessionPrice || 0,
            itemsPrice: sessionData.itemsPrice || 0,
            discount: sessionData.discount || 0,
            finalPrice: sessionData.finalPrice || 0,
            items: sessionData.items || [],
            date: new Date().toLocaleString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            orderNumber: `SESS-${session.id}`,
            sessionCode: sessionData.sessionCode || "",
            startTime: formatApiTimeToArabic(sessionData.startTime),
            endTime: sessionData.endTime
              ? formatApiTimeToArabic(sessionData.endTime)
              : "",
            totalHours: sessionData.totalHours || 0,
          };

          Swal.close();

          await printSessionReceipt(receiptData);

          await fetchSessions();
          await fetchRooms();

          Swal.fire({
            icon: "success",
            title: "تم إتمام الجلسة بنجاح",
            html: `
            <div style="text-align: right;">
              <p>تم تسجيل الدفع بنجاح</p>
              <p>تمت طباعة الفاتورة للعميل ${session.customerName}</p>
              <p><strong>طريقة الحساب:</strong> ${
                paymentForTimeNow ? "حتى الوقت الحالي" : "حسب وقت الانتهاء"
              }</p>
              <p><strong>المبلغ الإجمالي:</strong> ${
                sessionData.finalPrice || 0
              } ج.م</p>
            </div>
          `,
            timer: 3000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });
        } catch (error) {
          console.error("Error completing session:", error);
          Swal.close();

          Swal.fire({
            icon: "error",
            title: "خطأ في إتمام الجلسة",
            text: `حدث خطأ أثناء إتمام الجلسة: ${
              error.response?.data?.message || error.message
            }`,
            timer: 3000,
            showConfirmButton: true,
            confirmButtonText: "حاول مرة أخرى",
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });
        }
      }
    } catch (error) {
      console.error("Error in handleCompleteSession:", error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ",
        text: "حدث خطأ غير متوقع",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  const printSessionReceipt = async (receiptData) => {
    return new Promise((resolve, reject) => {
      try {
        const receiptContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>فاتورة جلسة</title>
<style>
  @media print {
    @page { margin: 0; size: 80mm auto; }
    body {
      margin: 0; padding: 0;
      font-family: 'Arial', sans-serif;
      font-size: 13px;
      font-weight: bold;
      width: 70mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  body {
    margin: 0; padding: 10px; 
    font-family: 'Arial', sans-serif;
    font-size: 13px; 
    font-weight: bold; 
    width: 70mm; background: white; color: black;
  }
  .header { text-align: center; margin-bottom: 12px; border-bottom: 1px dashed #000; padding: 12px 0; }
  .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
  .header h2 { margin: 3px 0; font-size: 16px; font-weight: bold; }
  
  .customer-info { 
    width: 100%; 
    margin: 12px 0; 
    padding: 8px; 
    background: #f5f5f5; 
    border-radius: 4px; 
    text-align: right; 
    font-size: 12px; 
    border: 1px dashed #ccc;
  }
  .customer-info div { margin: 6px 0; }
  
  .session-info { width: 100%; margin: 12px 0; text-align: right; font-size: 12px; }
  .session-info div { margin: 6px 0; }

  .items-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; table-layout: fixed; }
  .items-table th, .items-table td {
    border-bottom: 1px dashed #ccc;
    padding: 6px 3px; 
    font-size: 12px;
    font-weight: bold;
  }
  .items-table th { border-bottom: 1px solid #000; }

  .items-table th:nth-child(1), .items-table td:nth-child(1) { width: 5%; text-align: center; }
  .items-table th:nth-child(2), .items-table td:nth-child(2) { width: 12%; text-align: center; }
  .items-table th:nth-child(3), .items-table td:nth-child(3) { width: 28%; text-align: center; }
  .items-table th:nth-child(4), .items-table td:nth-child(4) { width: 20%; text-align: center; }
  .items-table th:nth-child(5), .items-table td:nth-child(5) { width: 20%; text-align: center; }

  .total-section { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #000; text-align: right; font-size: 12px; }
  .total-row {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
    font-weight: bold;
    font-size: 14px;
  }

  .total-row span:first-child {
  }

  .total-row span:last-child {
    margin-left: 10px;
  }
  
  .final-total { 
    font-size: 16px; 
    margin-top: 8px; 
    padding-top: 8px;
    border-top: 2px solid #000;
    color: #000; 
    font-weight: bold;
  }
  
  .footer { margin-top: 12px; padding-top: 8px; border-top: 1px dashed #000; text-align: center; font-size: 10px; }
  .thank-you { font-size: 14px; font-weight: bold; margin: 6px 0; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>Workspace</h1>
  <h2>فاتورة جلسة</h2>
</div>

<div class="customer-info">
  <div><strong>اسم العميل:</strong> ${receiptData.customerName}</div>
  <div><strong>رقم الهاتف:</strong> ${receiptData.customerPhone}</div>
  <div><strong>رقم الغرفة:</strong> ${receiptData.roomNumber}</div>
</div>

<div class="session-info">
  <div>رقم الفاتورة: ${receiptData.id}</div>
  <div>التاريخ: ${receiptData.date}</div>
  <div>وقت البدء: ${receiptData.startTime}</div>
  ${
    receiptData.endTime ? `<div>وقت الانتهاء: ${receiptData.endTime}</div>` : ""
  }
  <div>المدة: ${receiptData.totalHours} ساعة</div>
</div>

${
  receiptData.items && receiptData.items.length > 0
    ? `
<table class="items-table">
  <thead>
    <tr>
      <th>#</th>
      <th>الكمية</th>
      <th>الصنف</th>
      <th>السعر</th>
      <th>الإجمالي</th>
    </tr>
  </thead>
  <tbody>
    ${receiptData.items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.quantity}</td>
          <td>${item.product.name || "منتج"}</td>
          <td>${item.unitPrice || 0} ج.م</td>
          <td>${item.totalPrice || 0} ج.م</td>
        </tr>
      `
      )
      .join("")}
  </tbody>
</table>
`
    : '<div style="text-align: center; margin: 12px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">لا توجد مشتريات إضافية</div>'
}

<div class="total-section">
  ${
    receiptData.sessionPrice
      ? `
    <div class="total-row"><span>سعر الجلسة:</span><span>${receiptData.sessionPrice} ج.م</span></div>
  `
      : ""
  }
  ${
    receiptData.itemsPrice
      ? `
    <div class="total-row"><span>المشتريات الإضافية:</span><span>${receiptData.itemsPrice} ج.م</span></div>
  `
      : ""
  }
  ${
    receiptData.discount
      ? `
    <div class="total-row"><span>الخصم:</span><span>-${receiptData.discount} ج.م</span></div>
  `
      : ""
  }
  <div class="total-row final-total"><span>المبلغ الإجمالي:</span><span>${
    receiptData.finalPrice
  } ج.م</span></div>
</div>

<div class="thank-you">شكراً لزيارتكم</div>

<div class="footer">
  <div>للاستفسار: 0123456789</div>
  <div>تاريخ الطباعة: ${new Date().toLocaleString("ar-EG")}</div>
</div>

</body>
</html>
`;

        if (printFrameRef.current) {
          const printFrame = printFrameRef.current;
          const printWindow = printFrame.contentWindow;

          printWindow.document.open();
          printWindow.document.write(receiptContent);
          printWindow.document.close();

          printWindow.onload = () => {
            try {
              setTimeout(() => {
                printWindow.focus();

                printWindow.onbeforeprint = null;
                printWindow.onafterprint = null;

                printWindow.print();

                setTimeout(() => {
                  resolve();
                }, 1000);
              }, 500);
            } catch (err) {
              reject(err);
            }
          };
        } else {
          reject(new Error("Print frame not available"));
        }
      } catch (error) {
        reject(error);
      }
    });
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

  const convertArabicTimeToISO = (arabicTime, arabicDate) => {
    if (!arabicTime || !arabicDate) {
      console.error("الوقت أو التاريخ فارغ:", { arabicTime, arabicDate });
      return null;
    }

    try {
      const englishTime = toEnglishNumbers(arabicTime);
      const englishDate = toEnglishNumbers(arabicDate);

      console.log("تاريخ مدخل:", arabicDate);
      console.log("تاريخ محول:", englishDate);
      console.log("وقت مدخل:", arabicTime);
      console.log("وقت محول:", englishTime);

      let day, month, year;

      if (englishDate.includes("-")) {
        [day, month, year] = englishDate.split("-").map(Number);
      } else if (englishDate.includes("/")) {
        [day, month, year] = englishDate.split("/").map(Number);
      } else {
        console.error("صيغة التاريخ غير مدعومة:", englishDate);
        return null;
      }

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        console.error("تاريخ غير صالح:", { day, month, year });
        return null;
      }

      let timeParts = englishTime.split(" ");
      let time = timeParts[0];
      let period = timeParts[1] || "";

      let [hours, minutes] = time.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) {
        console.error("وقت غير صالح:", { hours, minutes });
        return null;
      }

      if (period.includes("مساءً") || period.includes("ظهراً")) {
        if (hours < 12) hours += 12;
      } else if (period.includes("صباحاً") && hours === 12) {
        hours = 0;
      }

      const date = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(date.getTime())) {
        console.error("تاريخ غير صالح بعد الإنشاء:", date);
        return null;
      }

      console.log("تاريخ ISO النهائي:", date.toISOString());
      return date.toISOString();
    } catch (error) {
      console.error("خطأ في تحويل التاريخ والوقت:", error);
      return null;
    }
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

      const startDateArabic = sessionData.startDate;
      const startTimeArabic = sessionData.startTime;

      console.log("تاريخ البدء العربي:", startDateArabic);
      console.log("وقت البدء العربي:", startTimeArabic);

      const startTimeISO = convertArabicTimeToISO(
        startTimeArabic,
        startDateArabic
      );

      if (!startTimeISO) {
        Swal.fire({
          title: "خطأ في التاريخ أو الوقت",
          text: "التاريخ أو الوقت غير صالح. يرجى التحقق من البيانات المدخلة.",
          icon: "error",
          confirmButtonColor: "#d33",
          background: "#0f172a",
          color: "#e2e8f0",
        });
        return;
      }

      console.log("وقت البدء ISO:", startTimeISO);

      let endTimeISO = null;
      if (sessionData.endTime) {
        const endDateArabic = sessionData.endDate || sessionData.startDate;
        const endTimeArabic = sessionData.endTime;

        console.log("تاريخ الانتهاء العربي:", endDateArabic);
        console.log("وقت الانتهاء العربي:", endTimeArabic);

        endTimeISO = convertArabicTimeToISO(endTimeArabic, endDateArabic);

        if (!endTimeISO) {
          console.warn("وقت الانتهاء غير صالح، سيتم تجاهله");
          endTimeISO = null;
        } else {
          console.log("وقت الانتهاء ISO:", endTimeISO);
        }
      }

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
      await fetchRooms();

      setNewSession({
        customerName: "",
        phone: "",
        clientId: null,
        roomNumber: "",
        startTime: "",
        endTime: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
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
    (session) => session.status === "Active"
  ).length;

  const todaySessions = sessions.filter(
    (session) =>
      toEnglishNumbers(session.date) === toEnglishNumbers(getCurrentDate())
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
          <div className="flex flex-col lg:flex-row gap-28 mb-8">
            <SearchBar />
            <StatsCards stats={{ activeSessionsCount, todaySessions }} />
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
                    onCompleteSession={handleCompleteSession}
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

          <RoomsStatus
            availableRooms={availableRooms}
            sessions={sessions}
            timerValues={timerValues}
          />

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
