import { useState } from "react";
import { PlusCircle } from "lucide-react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import StatsCards from "../components/StatsCards";
import AddSessionForm from "../components/AddSessionForm";
import SessionCard from "../components/SessionCard";
import RoomsStatus from "../components/RoomsStatus";

import {
  getCurrentDate,
  getTomorrowDate,
  toArabicNumbers,
  arabicTimeToMinutes,
} from "../utils/arabicNumbers";

export default function Home() {

  const [sessions, setSessions] = useState([
    {
      id: 1,
      customerName: "أحمد محمد",
      phone: "٠١٢٣٤٥٦٧٨٩٠",
      roomNumber: "غرفة ١",
      startTime: "١٠:٠٠ صباحاً",
      endTime: "١٢:٠٠ ظهراً",
      duration: "٢ ساعة",
      status: "active",
      date: getCurrentDate(),
    },
    {
      id: 2,
      customerName: "محمد علي",
      phone: "٠١١١٢٢٢٣٣٤٤",
      roomNumber: "غرفة ٣",
      startTime: "١:٠٠ مساءً",
      endTime: "٤:٠٠ مساءً",
      duration: "٣ ساعات",
      status: "active",
      date: getCurrentDate(),
    },
    {
      id: 3,
      customerName: "سارة خالد",
      phone: "٠١٠٥٥٥٥٦٦٧٧",
      roomNumber: "غرفة ٢",
      startTime: "٥:٠٠ مساءً",
      endTime: "٧:٠٠ مساءً",
      duration: "٢ ساعة",
      status: "active",
      date: getCurrentDate(),
    },
    {
      id: 4,
      customerName: "خالد محمود",
      phone: "٠١٢٨٨٨٨٩٩٩٩",
      roomNumber: "غرفة ٤",
      startTime: "٨:٠٠ مساءً",
      endTime: "١١:٠٠ مساءً",
      duration: "٣ ساعات",
      status: "active",
      date: getCurrentDate(),
    },
    {
      id: 5,
      customerName: "ياسمين فتحي",
      phone: "٠١٥٤٤٤٤٣٣٢٢",
      roomNumber: "غرفة ١",
      startTime: "٦:٠٠ مساءً",
      endTime: "٩:٠٠ مساءً",
      duration: "٣ ساعات",
      status: "active",
      date: getTomorrowDate(),
    },
    {
      id: 6,
      customerName: "مصطفى حامد",
      phone: "٠١٠١١١١٢٢٢٢",
      roomNumber: "غرفة ٣",
      startTime: "٣:٠٠ مساءً",
      endTime: "٦:٠٠ مساءً",
      duration: "٣ ساعات",
      status: "active",
      date: getTomorrowDate(),
    },
  ]);

  const [availableRooms, setAvailableRooms] = useState([
    { id: 1, name: "غرفة ١", status: "متاحة" },
    { id: 2, name: "غرفة ٢", status: "متاحة" },
    { id: 3, name: "غرفة ٣", status: "متاحة" },
    { id: 4, name: "غرفة ٤", status: "متاحة" },
    { id: 5, name: "غرفة ٥", status: "قيد الصيانة" },
    { id: 6, name: "غرفة ٦", status: "متاحة" },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    customerName: "",
    phone: "",
    roomNumber: "",
    startTime: "",
    endTime: "",
  });

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
      const englishTime = timeStr.replace(/[٠-٩]/g, (digit) => {
        const arabicToEnglish = {
          "٠": "0",
          "١": "1",
          "٢": "2",
          "٣": "3",
          "٤": "4",
          "٥": "5",
          "٦": "6",
          "٧": "7",
          "٨": "8",
          "٩": "9",
        };
        return arabicToEnglish[digit];
      });
      startHours = parseInt(englishTime.split(":")[0]);
    } else if (newSession.startTime.includes("ظهراً")) {
      const timeStr = newSession.startTime.replace("ظهراً", "").trim();
      const englishTime = timeStr.replace(/[٠-٩]/g, (digit) => {
        const arabicToEnglish = {
          "٠": "0",
          "١": "1",
          "٢": "2",
          "٣": "3",
          "٤": "4",
          "٥": "5",
          "٦": "6",
          "٧": "7",
          "٨": "8",
          "٩": "9",
        };
        return arabicToEnglish[digit];
      });
      startHours = parseInt(englishTime.split(":")[0]) + 12;
      if (startHours === 24) startHours = 12;
    } else if (newSession.startTime.includes("مساءً")) {
      const timeStr = newSession.startTime.replace("مساءً", "").trim();
      const englishTime = timeStr.replace(/[٠-٩]/g, (digit) => {
        const arabicToEnglish = {
          "٠": "0",
          "١": "1",
          "٢": "2",
          "٣": "3",
          "٤": "4",
          "٥": "5",
          "٦": "6",
          "٧": "7",
          "٨": "8",
          "٩": "9",
        };
        return arabicToEnglish[digit];
      });
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
    (session) => session.status === "active"
  ).length;

  const todaySessions = sessions.filter(
    (session) => session.date === getCurrentDate()
  ).length;

  const tomorrowSessions = sessions.filter(
    (session) => session.date === getTomorrowDate()
  ).length;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6"
    >
      <Header />

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            handleDeleteSession={handleDeleteSession}
            getCurrentDate={getCurrentDate}
          />
        ))}
      </div>

      <RoomsStatus availableRooms={availableRooms} />

    </div>
  );
}
