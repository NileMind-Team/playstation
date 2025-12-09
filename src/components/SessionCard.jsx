import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  DoorOpen,
  UserCircle,
  Phone,
  Trash2,
  ShoppingCart,
  Edit,
  CheckCircle,
} from "lucide-react";

export default function SessionCard({
  session,
  timerValue,
  handleDeleteSession,
  onOpenCashier,
  onOpenEditModal,
  onCompleteSession,
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

  const formatDuration = (durationStr) => {
    if (!durationStr) return "٠ ساعة";

    const match = durationStr.match(/([\d.]+)\s*ساعة/);
    if (!match) return durationStr;

    const number = parseFloat(match[1]);
    if (isNaN(number)) return durationStr;

    if (number % 1 !== 0) {
      const decimalPart = number.toString().split(".")[1] || "";
      const roundedDecimal = decimalPart.slice(0, 3);
      const formattedNumber = `${Math.floor(number)}.${roundedDecimal}`;
      return `${toArabicNumbers(formattedNumber)} ساعة`;
    }

    return `${toArabicNumbers(number)} ساعة`;
  };

  const truncateName = (name, maxLength = 20) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  const getSessionStatusInfo = (status) => {
    const statusMap = {
      Pending: {
        text: "قيد الانتظار",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        dotColor: "bg-yellow-400",
        borderColor: "from-yellow-500 via-yellow-400 to-yellow-600",
      },
      Active: {
        text: "نشطة",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        dotColor: "bg-green-400",
        borderColor: "from-green-500 via-emerald-400 to-green-600",
      },
      Finished: {
        text: "منتهية",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        dotColor: "bg-red-400",
        borderColor: "from-red-500 via-red-400 to-red-600",
      },
      Cancelled: {
        text: "ملغية",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        dotColor: "bg-gray-400",
        borderColor: "from-gray-500 via-gray-400 to-gray-600",
      },
      Payed: {
        text: "مدفوعة",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        dotColor: "bg-blue-400",
        borderColor: "from-blue-500 via-blue-400 to-blue-600",
      },
    };

    return statusMap[status] || statusMap["Pending"];
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

    if (localTimer.type === "upcoming") {
      return {
        text: "text-blue-400",
        bg: "bg-gradient-to-r from-blue-500/20 to-indigo-600/20",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/30",
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
      text: "text-purple-400",
      bg: "bg-gradient-to-r from-purple-500/20 to-violet-600/20",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/30",
    };
  };

  const displayTimer = () => {
    const timerColor = getTimerColor();

    let timerText = "";
    if (localTimer.type === "upcoming") {
      if (
        localTimer.hours === 0 &&
        localTimer.minutes === 0 &&
        localTimer.seconds === 0
      ) {
        timerText = "٠٠:٠٠:٠٠";
      } else {
        timerText = `${toArabicNumbers(
          formatTime(localTimer.hours)
        )}:${toArabicNumbers(formatTime(localTimer.minutes))}:${toArabicNumbers(
          formatTime(localTimer.seconds)
        )}`;
      }
    } else if (localTimer.type === "finished") {
      timerText = "٠٠:٠٠:٠٠";
    } else {
      timerText = `${toArabicNumbers(
        formatTime(localTimer.hours)
      )}:${toArabicNumbers(formatTime(localTimer.minutes))}:${toArabicNumbers(
        formatTime(localTimer.seconds)
      )}`;
    }

    return (
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          timerColor.bg
        } ${
          timerColor.border
        } border backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-center z-20 ${
          timerColor.glow
        } shadow-lg ${timerColor.animate || ""}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-10 rounded-lg"></div>

        <div
          className={`relative text-lg font-bold ${timerColor.text} tracking-wider`}
        >
          <span className="drop-shadow-lg">{timerText}</span>
        </div>

        <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-current rounded-full opacity-30"></div>
        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-current rounded-full opacity-30"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-current rounded-full opacity-30"></div>
        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-current rounded-full opacity-30"></div>
      </div>
    );
  };

  const statusInfo = getSessionStatusInfo(session.status);

  const isPending = session.status === "Pending";

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] group relative">
      <div
        className={`absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b ${statusInfo.borderColor}`}
      ></div>

      <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold flex items-center">
              <UserCircle
                size={20}
                className="ml-2 text-blue-400 flex-shrink-0"
              />
              <span className="truncate" title={session.customerName}>
                {truncateName(session.customerName)}
              </span>
            </h3>
            <p className="text-gray-400 text-xs mt-1 flex items-center">
              <Phone size={14} className="ml-1 flex-shrink-0" />
              <span>{session.phone}</span>
            </p>
          </div>

          <div
            className={`flex items-center gap-2 ${statusInfo.bgColor} backdrop-blur-sm px-3 py-1 rounded-full flex-shrink-0`}
          >
            <span
              className={`inline-block w-2 h-2 ${statusInfo.dotColor} rounded-full animate-pulse`}
            ></span>
            <span className={`${statusInfo.color} text-xs font-medium`}>
              {session.statusText || statusInfo.text}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg mt-2">
          <div className="flex items-center">
            <DoorOpen size={16} className="ml-2 text-purple-400" />
            <span className="font-medium text-sm">رقم الغرفة</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {session.roomNumber}
          </span>
        </div>
      </div>

      <div className="relative h-10 border-t border-b border-gray-700/50 bg-gradient-to-r from-gray-800/30 via-gray-900/30 to-gray-800/30">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent transform -translate-y-1/2"></div>

        <div className="absolute top-1/2 left-1/4 w-6 h-px bg-gradient-to-r from-transparent to-blue-500/30 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-6 h-px bg-gradient-to-l from-transparent to-purple-500/30 transform -translate-y-1/2"></div>

        {displayTimer()}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Clock size={16} className="ml-2 text-blue-400" />
              <span className="text-gray-400 text-sm">وقت البدء</span>
            </div>
            <p className="font-bold">{session.startTime}</p>
          </div>

          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Clock size={16} className="ml-2 text-red-400" />
              <span className="text-gray-400 text-sm">وقت الانتهاء</span>
            </div>
            <p className="font-bold">{session.endTime || "غير محدد"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Clock size={16} className="ml-2 text-green-400" />
              <span className="text-gray-400 text-sm">المدة</span>
            </div>
            <p className="font-bold">{formatDuration(session.duration)}</p>
          </div>

          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Calendar size={16} className="ml-2 text-yellow-400" />
              <span className="text-gray-400 text-sm">التاريخ</span>
            </div>
            <p className="font-bold">{session.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => onOpenCashier(session)}
            className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-2 rounded-lg transition hover:scale-105 text-sm"
          >
            <ShoppingCart size={16} className="ml-1" />
            <span>الكاشير</span>
          </button>

          <button
            onClick={() => !isPending && onCompleteSession(session)}
            disabled={isPending}
            className={`flex items-center justify-center py-2 rounded-lg transition text-sm ${
              isPending
                ? "bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105"
            }`}
          >
            <CheckCircle size={16} className="ml-1" />
            <span>إتمام الجلسة</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenEditModal(session)}
            className="flex items-center justify-center bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 py-2 rounded-lg transition hover:scale-105 text-sm"
          >
            <Edit size={16} className="ml-1" />
            <span>تعديل الجلسة</span>
          </button>

          <button
            onClick={() => handleDeleteSession(session.id, session.roomNumber)}
            className="flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-2 rounded-lg transition hover:scale-105 text-sm"
          >
            <Trash2 size={16} className="ml-1" />
            <span>حذف الجلسة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
