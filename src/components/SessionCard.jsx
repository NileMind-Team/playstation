import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  DoorOpen,
  UserCircle,
  Phone,
  Trash2,
  ShoppingCart,
} from "lucide-react";

export default function SessionCard({
  session,
  timerValue,
  handleDeleteSession,
  onOpenCashier,
}) {
  const [localTimer, setLocalTimer] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    type: "countup",
  });

  useEffect(() => {
    if (timerValue) {
      setLocalTimer({
        hours: timerValue.hours || 0,
        minutes: timerValue.minutes || 0,
        seconds: timerValue.seconds || 0,
        type: timerValue.type || "countup",
      });
    }
  }, [timerValue]);

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  const toArabicNumbers = (num) => {
    return num.toString().replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[digit]);
  };

  const getTimerColor = () => {
    if (localTimer.type === "finished") {
      return {
        text: "text-red-400",
        bg: "bg-gradient-to-r from-red-500/20 to-red-600/20",
        border: "border-red-500/30",
        glow: "shadow-red-500/30",
        animate: "animate-pulse",
      };
    }

    if (localTimer.type === "countdown") {
      if (localTimer.hours === 0 && localTimer.minutes < 30) {
        return {
          text: "text-yellow-400",
          bg: "bg-gradient-to-r from-yellow-500/20 to-amber-600/20",
          border: "border-yellow-500/30",
          glow: "shadow-yellow-500/30",
          animate: "animate-pulse",
        };
      } else if (localTimer.hours === 0 && localTimer.minutes < 10) {
        return {
          text: "text-red-400",
          bg: "bg-gradient-to-r from-red-500/20 to-red-600/20",
          border: "border-red-500/30",
          glow: "shadow-red-500/30",
          animate: "animate-pulse",
        };
      } else {
        return {
          text: "text-green-400",
          bg: "bg-gradient-to-r from-green-500/20 to-emerald-600/20",
          border: "border-green-500/30",
          glow: "shadow-green-500/30",
        };
      }
    }

    return {
      text: "text-blue-400",
      bg: "bg-gradient-to-r from-blue-500/20 to-indigo-600/20",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/30",
    };
  };

  const displayTimer = () => {
    const timerColor = getTimerColor();

    return (
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          timerColor.bg
        } ${
          timerColor.border
        } border backdrop-blur-sm rounded-full px-6 py-3 flex items-center justify-center z-20 ${
          timerColor.glow
        } shadow-xl ${timerColor.animate || ""}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-10 rounded-full"></div>

        <div className="absolute -inset-2 bg-gradient-to-r from-current via-transparent to-current opacity-5 blur rounded-full"></div>

        <div
          className={`relative text-2xl font-bold ${timerColor.text} tracking-wider`}
        >
          <span className="drop-shadow-lg">
            {toArabicNumbers(formatTime(localTimer.hours))}:
            {toArabicNumbers(formatTime(localTimer.minutes))}:
            {toArabicNumbers(formatTime(localTimer.seconds))}
          </span>
        </div>

        <div className="absolute -top-1 -left-1 w-2 h-2 bg-current rounded-full opacity-30"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full opacity-30"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-current rounded-full opacity-30"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-current rounded-full opacity-30"></div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] group relative">
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-green-500 via-emerald-400 to-green-600"></div>

      <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <UserCircle size={24} className="ml-2 text-blue-400" />
              <span>{session.customerName}</span>
            </h3>
            <p className="text-gray-400 text-sm mt-1 flex items-center">
              <Phone size={16} className="ml-1" />
              <span>{session.phone}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="inline-block w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-300 text-sm font-medium">نشطة</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl">
          <div className="flex items-center">
            <DoorOpen size={20} className="ml-2 text-purple-400" />
            <span className="font-medium">رقم الغرفة</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {session.roomNumber}
          </span>
        </div>
      </div>

      <div className="relative h-16 border-t border-b border-gray-700/50 bg-gradient-to-r from-gray-800/30 via-gray-900/30 to-gray-800/30">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent transform -translate-y-1/2"></div>

        <div className="absolute top-1/2 left-1/4 w-8 h-px bg-gradient-to-r from-transparent to-blue-500/30 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-px bg-gradient-to-l from-transparent to-purple-500/30 transform -translate-y-1/2"></div>

        {displayTimer()}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/30 p-4 rounded-xl">
            <div className="flex items-center mb-2">
              <Clock size={18} className="ml-2 text-blue-400" />
              <span className="text-gray-400">وقت البدء</span>
            </div>
            <p className="text-lg font-bold">{session.startTime}</p>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-xl">
            <div className="flex items-center mb-2">
              <Clock size={18} className="ml-2 text-red-400" />
              <span className="text-gray-400">وقت الانتهاء</span>
            </div>
            <p className="text-lg font-bold">{session.endTime || "غير محدد"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/30 p-4 rounded-xl">
            <div className="flex items-center mb-2">
              <Clock size={18} className="ml-2 text-green-400" />
              <span className="text-gray-400">المدة</span>
            </div>
            <p className="text-lg font-bold">{session.duration}</p>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-xl">
            <div className="flex items-center mb-2">
              <Calendar size={18} className="ml-2 text-yellow-400" />
              <span className="text-gray-400">التاريخ</span>
            </div>
            <p className="text-lg font-bold">{session.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onOpenCashier(session)}
            className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl transition hover:scale-105"
          >
            <ShoppingCart size={18} className="ml-2" />
            <span>فتح الكاشير</span>
          </button>

          <button
            onClick={() => handleDeleteSession(session.id, session.roomNumber)}
            className="flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-3 rounded-xl transition hover:scale-105"
          >
            <Trash2 size={18} className="ml-2" />
            <span>حذف الجلسة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
