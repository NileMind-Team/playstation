import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
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
  toArabicNumbers,
  arabicTimeToMinutes,
  formatApiTimeToArabic,
  formatApiDate,
  toEnglishNumbers,
} from "../utils/arabicNumbers";

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    customerName: "",
    phone: "",
    roomNumber: "",
    startTime: "",
    endTime: "",
  });

  const [cashierState, setCashierState] = useState({
    isOpen: false,
    currentSession: null,
  });

  const [activeTab, setActiveTab] = useState("sessions");
  const [timerValues, setTimerValues] = useState({});

  useEffect(() => {
    fetchSessions();
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      updateAllTimers();
    }, 1000);

    return () => clearInterval(timerInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  const updateAllTimers = () => {
    const newTimerValues = {};

    sessions.forEach((session) => {
      const timerValue = calculateTimerValue(session);
      newTimerValues[session.id] = timerValue;
    });

    setTimerValues(newTimerValues);
  };

  const calculateTimerValue = (session) => {
    const now = new Date();

    const startTimeInMinutes = arabicTimeToMinutes(session.startTime);

    const startDate = new Date();
    startDate.setHours(Math.floor(startTimeInMinutes / 60));
    startDate.setMinutes(startTimeInMinutes % 60);
    startDate.setSeconds(0);

    const diffFromStart = Math.floor((now - startDate) / 1000);

    if (session.endTime && session.endTime !== "٠٠:٠٠") {
      const endTimeInMinutes = arabicTimeToMinutes(session.endTime);

      const endDate = new Date();
      endDate.setHours(Math.floor(endTimeInMinutes / 60));
      endDate.setMinutes(endTimeInMinutes % 60);
      endDate.setSeconds(0);

      const timeRemaining = Math.floor((endDate - now) / 1000);

      if (timeRemaining > 0) {
        return {
          type: "countdown",
          value: timeRemaining,
          hours: Math.floor(timeRemaining / 3600),
          minutes: Math.floor((timeRemaining % 3600) / 60),
          seconds: timeRemaining % 60,
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
        value: diffFromStart > 0 ? diffFromStart : 0,
        hours: Math.floor(diffFromStart / 3600),
        minutes: Math.floor((diffFromStart % 3600) / 60),
        seconds: diffFromStart % 60,
      };
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
        status: session.status === "Finished" ? "منتهية" : "نشطة",
        date: formatApiDate(session.startTime),
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
      }));

      setAvailableRooms(formattedRooms);
    } catch (error) {
      console.error("خطأ في جلب الغرف:", error);
      setAvailableRooms([
        { id: 1, name: "غرفة ١", status: "متاحة" },
        { id: 2, name: "غرفة ٢", status: "متاحة" },
        { id: 3, name: "غرفة ٣", status: "متاحة" },
        { id: 4, name: "غرفة ٤", status: "متاحة" },
        { id: 5, name: "غرفة ٥", status: "قيد الصيانة" },
        { id: 6, name: "غرفة ٦", status: "متاحة" },
      ]);
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

  const handleAddSession = (e) => {
    e.preventDefault();

    if (
      !newSession.customerName ||
      !newSession.phone ||
      !newSession.roomNumber ||
      !newSession.startTime ||
      !newSession.endTime
    ) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const calculateDuration = () => {
      const startMinutes = arabicTimeToMinutes(newSession.startTime);
      const endMinutes = arabicTimeToMinutes(newSession.endTime);

      const totalMinutes = endMinutes - startMinutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return `${toArabicNumbers(hours)} ساعة و ${toArabicNumbers(
          minutes
        )} دقيقة`;
      } else if (hours > 0) {
        return `${toArabicNumbers(hours)} ساعة`;
      } else {
        return `${toArabicNumbers(minutes)} دقيقة`;
      }
    };

    const today = new Date();
    const currentHour = today.getHours();

    let startHours = 0;
    if (newSession.startTime.includes("صباحاً")) {
      const timeStr = newSession.startTime.replace("صباحاً", "").trim();
      const englishTime = toEnglishNumbers(timeStr);
      startHours = parseInt(englishTime.split(":")[0]);
    } else if (newSession.startTime.includes("ظهراً")) {
      const timeStr = newSession.startTime.replace("ظهراً", "").trim();
      const englishTime = toEnglishNumbers(timeStr);
      startHours = parseInt(englishTime.split(":")[0]) + 12;
      if (startHours === 24) startHours = 12;
    } else if (newSession.startTime.includes("مساءً")) {
      const timeStr = newSession.startTime.replace("مساءً", "").trim();
      const englishTime = toEnglishNumbers(timeStr);
      startHours = parseInt(englishTime.split(":")[0]) + 12;
      if (startHours === 24) startHours = 12;
    }

    let sessionDate;
    if (startHours < currentHour) {
      sessionDate = getTomorrowDate();
    } else {
      sessionDate = getCurrentDate();
    }

    const newSessionObj = {
      id: sessions.length + 1,
      customerName: newSession.customerName,
      phone: newSession.phone,
      roomNumber: newSession.roomNumber,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      duration: calculateDuration(),
      status: "active",
      date: sessionDate,
    };

    const updatedRooms = availableRooms.map((room) => {
      if (room.name === newSession.roomNumber) {
        return { ...room, status: "مشغولة" };
      }
      return room;
    });

    setSessions([newSessionObj, ...sessions]);
    setAvailableRooms(updatedRooms);

    const newTimerValue = calculateTimerValue(newSessionObj);
    setTimerValues((prev) => ({
      ...prev,
      [newSessionObj.id]: newTimerValue,
    }));

    setNewSession({
      customerName: "",
      phone: "",
      roomNumber: "",
      startTime: "",
      endTime: "",
    });

    setShowAddForm(false);

    alert(
      `تمت إضافة جلسة جديدة للعميل ${newSessionObj.customerName} في ${newSessionObj.roomNumber} بنجاح!`
    );
  };

  const handleDeleteSession = (id, roomNumber) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الجلسة؟")) {
      setSessions(sessions.filter((session) => session.id !== id));

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
      alert("تم حذف الجلسة بنجاح!");
    }
  };

  const activeSessionsCount = sessions.filter(
    (session) => session.status === "active" || session.status === "نشطة"
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
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6"
    >
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
                    getCurrentDate={getCurrentDate}
                    onOpenCashier={handleOpenCashier}
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
