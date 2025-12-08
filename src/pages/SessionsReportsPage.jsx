import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Printer,
  DollarSign,
  Clock,
  Users,
  DoorOpen,
  Gamepad2,
  X,
  Sparkles,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const SessionsReportsPage = () => {
  const navigate = useNavigate();
  const printFrameRef = useRef(null);

  // eslint-disable-next-line no-unused-vars
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalRevenue: 0,
    totalHours: 0,
    activeSessions: 0,
    finishedSessions: 0,
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

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
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      let params = {};
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        startDate.setHours(0, 0, 0, 0);
        params.startRange = startDate.toISOString();
      }
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        params.endRange = endDate.toISOString();
      }

      const response = await axiosInstance.get("/api/Sessions/GetAll", {
        params,
      });

      const sessionsData = response.data;
      setSessions(sessionsData);
      setFilteredSessions(sessionsData);

      calculateStats(sessionsData);
      setIsFilterApplied(false);
    } catch (error) {
      console.error("خطأ في جلب الجلسات:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات الجلسات",
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
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const calculateStats = (sessionsData) => {
    const totalSessions = sessionsData.length;
    const totalRevenue = sessionsData.reduce(
      (sum, session) => sum + session.finalPrice,
      0
    );
    const totalHours = sessionsData.reduce(
      (sum, session) => sum + session.totalHours,
      0
    );
    const activeSessions = sessionsData.filter(
      (session) => session.status === "Active"
    ).length;
    const finishedSessions = sessionsData.filter(
      (session) => session.status === "Finished"
    ).length;

    setStats({
      totalSessions,
      totalRevenue,
      totalHours: parseFloat(totalHours.toFixed(2)),
      activeSessions,
      finishedSessions,
    });
  };

  const handleManualFilter = () => {
    fetchSessions();
    Swal.fire({
      title: "تم التصفية",
      text: "تم تطبيق الفلاتر بنجاح",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e2e8f0",
      backdrop: "rgba(0, 0, 0, 0.7)",
    });
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString("ar-EG")} ج.م`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "yyyy/MM/dd", { locale: ar });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "yyyy/MM/dd hh:mm a", { locale: ar });
  };

  const formatHours = (hours) => {
    const totalMinutes = hours * 60;
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = Math.floor(totalMinutes % 60);
    return `${hoursPart}س ${minutesPart}د`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "from-emerald-600/20 to-green-600/20 text-emerald-300 border-emerald-600/30";
      case "Finished":
        return "from-blue-600/20 to-cyan-600/20 text-blue-300 border-blue-600/30";
      case "Pending":
        return "from-amber-600/20 to-orange-600/20 text-amber-300 border-amber-600/30";
      case "Cancelled":
        return "from-red-600/20 to-pink-600/20 text-red-300 border-red-600/30";
      default:
        return "from-gray-600/20 to-gray-700/20 text-gray-300 border-gray-600/30";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Active":
        return "نشطة";
      case "Finished":
        return "مكتملة";
      case "Pending":
        return "قيد الانتظار";
      case "Cancelled":
        return "ملغية";
      default:
        return status;
    }
  };

  const handlePrint = async () => {
    return new Promise((resolve, reject) => {
      try {
        setIsPrinting(true);

        Swal.fire({
          title: "جاري الطباعة",
          text: "يتم تحضير التقرير للطباعة...",
          icon: "info",
          timer: 500,
          showConfirmButton: false,
          background: "#0f172a",
          color: "#e2e8f0",
          backdrop: "rgba(0, 0, 0, 0.7)",
        }).then(() => {
          const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير جلسات الألعاب</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    body {
      margin: 0; padding: 15px;
      font-family: 'Arial', sans-serif;
      background: white !important;
      color: black !important;
      direction: rtl;
      font-size: 15px;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  
  body {
    margin: 0; padding: 15px;
    font-family: 'Arial', sans-serif;
    background: white !important;
    color: black !important;
    direction: rtl;
    font-size: 11px;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }
  
  .print-header h1 {
    color: black !important;
    margin: 0 0 5px 0;
    font-size: 22px;
    font-weight: bold;
  }
  
  .print-header p {
    color: #666 !important;
    margin: 0;
    font-size: 14px;
  }
  
  .print-info {
    margin: 15px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: #f9f9f9;
  }
  
  .print-info div {
    margin: 5px 0;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin: 15px 0;
    text-align: center;
  }
  
  .stat-card {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    border-radius: 5px;
    padding: 8px;
  }
  
  .stat-card h3 {
    color: #666 !important;
    margin: 0 0 6px 0;
    font-size: 10px;
    font-weight: normal;
  }
  
  .stat-card p {
    color: black !important;
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 9px;
    table-layout: fixed;
  }
  
  .print-table th {
    background-color: #f0f0f0 !important;
    color: black !important;
    padding: 6px 3px;
    text-align: right;
    border: 1px solid #ccc !important;
    font-weight: bold;
    font-size: 9px;
  }
  
  .print-table td {
    padding: 5px 3px;
    border: 1px solid #ddd !important;
    text-align: right;
    color: black !important;
    font-size: 8px;
  }
  
  .print-table tr:nth-child(even) {
    background-color: #f9f9f9 !important;
  }
  
  .session-code {
    font-weight: bold;
  }
  
  .client-name {
    color: black !important;
  }
  
  .room-name {
    color: black !important;
  }
  
  .status-badge {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: bold;
  }
  
  .status-active {
    background: #d1fae5 !important;
    color: #065f46 !important;
  }
  
  .status-finished {
    background: #dbeafe !important;
    color: #1e40af !important;
  }
  
  .status-pending {
    background: #fef3c7 !important;
    color: #92400e !important;
  }
  
  .total-amount {
    font-weight: bold;
  }
  
  .print-footer {
    margin-top: 20px;
    text-align: center;
    color: #666 !important;
    font-size: 9px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #666 !important;
  }
</style>
</head>
<body>

<div class="print-header">
  <h1>تقرير جلسات الألعاب</h1>
  <p>نظام حجز جلسات الألعاب</p>
</div>

<div class="print-info">
  <div>تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</div>
  ${
    dateRange.startDate
      ? `<div>من: ${new Date(dateRange.startDate).toLocaleDateString(
          "ar-EG"
        )}</div>`
      : ""
  }
  ${
    dateRange.endDate
      ? `<div>إلى: ${new Date(dateRange.endDate).toLocaleDateString(
          "ar-EG"
        )}</div>`
      : ""
  }
  <div>عدد السجلات: ${filteredSessions.length}</div>
</div>

<div class="stats-container">
  <div class="stat-card">
    <h3>إجمالي الجلسات</h3>
    <p>${stats.totalSessions}</p>
  </div>
  <div class="stat-card">
    <h3>إجمالي الإيرادات</h3>
    <p>${formatCurrency(stats.totalRevenue)}</p>
  </div>
  <div class="stat-card">
    <h3>إجمالي الساعات</h3>
    <p>${stats.totalHours}</p>
  </div>
  <div class="stat-card">
    <h3>الجلسات النشطة</h3>
    <p>${stats.activeSessions}</p>
  </div>
  <div class="stat-card">
    <h3>الجلسات المكتملة</h3>
    <p>${stats.FinishedSessions}</p>
  </div>
</div>

${
  filteredSessions.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد جلسات في الفترة المحددة</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="12%">العميل</th>
        <th width="10%">الغرفة</th>
        <th width="8%">الحالة</th>
        <th width="10%">تاريخ البدء</th>
        <th width="10%">تاريخ الانتهاء</th>
        <th width="8%">المدة</th>
        <th width="8%">سعر الساعة</th>
        <th width="8%">سعر الجلسة</th>
        <th width="8%">خصم</th>
        <th width="8%">السعر النهائي</th>
      </tr>
    </thead>
    <tbody>
      ${filteredSessions
        .map((session) => {
          const statusClass = `status-${session.status.toLowerCase()}`;
          return `
          <tr>
            <td class="client-name">${session.client.name}</td>
            <td class="room-name">${session.room.name}</td>
            <td><span class="status-badge ${statusClass}">${getStatusLabel(
            session.status
          )}</span></td>
            <td>${formatDateTime(session.startTime)}</td>
            <td>${formatDateTime(session.endTime)}</td>
            <td>${formatHours(session.totalHours)}</td>
            <td>${formatCurrency(session.room.hourCost)}</td>
            <td>${formatCurrency(session.sessionPrice)}</td>
            <td>${formatCurrency(session.discount)}</td>
            <td class="total-amount">${formatCurrency(session.finalPrice)}</td>
          </tr>
        `;
        })
        .join("")}
    </tbody>
  </table>
`
}

</body>
</html>
          `;

          if (printFrameRef.current) {
            const printFrame = printFrameRef.current;
            const printWindow = printFrame.contentWindow;

            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();

            printWindow.onload = () => {
              try {
                setTimeout(() => {
                  printWindow.focus();
                  printWindow.print();

                  setTimeout(() => {
                    setIsPrinting(false);
                    resolve();
                  }, 1000);
                }, 500);
              } catch (err) {
                setIsPrinting(false);
                reject(err);
              }
            };
          } else {
            setIsPrinting(false);
            reject(new Error("Print frame not available"));
          }
        });
      } catch (error) {
        setIsPrinting(false);
        reject(error);
      }
    });
  };

  const clearFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    setShowFilters(false);
    setIsFilterApplied(false);
    fetchSessions();
  };

  const handleStartDateChange = (date) => {
    setDateRange({ ...dateRange, startDate: date });

    if (dateRange.endDate && date > dateRange.endDate) {
      setDateRange({ startDate: date, endDate: null });
    }
  };

  const handleEndDateChange = (date) => {
    if (dateRange.startDate && date < dateRange.startDate) {
      Swal.fire({
        icon: "warning",
        title: "تاريخ غير صحيح",
        text: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
      return;
    }
    setDateRange({ ...dateRange, endDate: date });
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
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
        className="fixed md:absolute top-4 md:top-6 left-4 md:left-6 z-10 group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <ArrowLeft
          size={20}
          className="text-gray-300 group-hover:text-blue-300 transition-colors"
        />
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <Gamepad2 size={32} className="text-blue-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent pb-1">
                  تقارير جلسات 
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  عرض وتحليل إحصائيات جلسات والحجوزات
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
                  placeholder="بحث بالعميل أو الغرفة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-all duration-300"
              >
                <Filter size={18} className="text-blue-300" />
                <span className="hidden md:inline text-blue-300 font-medium">
                  فلاتر
                </span>
              </button>

              <button
                onClick={fetchSessions}
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-all duration-300"
                title="تحديث البيانات"
              >
                <RefreshCw size={20} className="text-gray-300" />
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                {isPrinting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span className="hidden md:inline">جاري الطباعة...</span>
                  </>
                ) : (
                  <>
                    <Printer size={18} />
                    <span className="hidden md:inline">طباعة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Filter size={20} className="text-blue-400" />
                  <h3 className="text-lg font-bold text-white">فلاتر البحث</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    مسح الفلاتر
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <DatePicker
                        selected={dateRange.startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        placeholderText="تاريخ البدء"
                        dateFormat="yyyy/MM/dd"
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        locale={ar}
                        portalId="root-portal"
                        popperClassName="react-datepicker-popper-custom"
                        popperPlacement="bottom-start"
                        showPopperArrow={false}
                        calendarClassName="custom-calendar"
                        maxDate={dateRange.endDate || new Date()}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Calendar size={18} className="text-gray-500" />
                      </div>
                    </div>
                    <div className="relative">
                      <DatePicker
                        selected={dateRange.endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        minDate={dateRange.startDate}
                        placeholderText="تاريخ الانتهاء"
                        dateFormat="yyyy/MM/dd"
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        locale={ar}
                        portalId="root-portal"
                        popperClassName="react-datepicker-popper-custom"
                        popperPlacement="bottom-start"
                        showPopperArrow={false}
                        calendarClassName="custom-calendar"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Calendar size={18} className="text-gray-500" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={handleManualFilter}
                        className="w-full h-full flex items-center justify-center gap-2 text-white font-medium rounded-xl py-3 px-4 transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/25"
                      >
                        <Search size={18} />
                        تصفية النتائج
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الجلسات</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalSessions}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl">
                  <Gamepad2 size={24} className="text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl">
                  <DollarSign size={24} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الساعات</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.totalHours}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl">
                  <Clock size={24} className="text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">الجلسات النشطة</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.activeSessions}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl">
                  <Sparkles size={24} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">الجلسات المكتملة</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.finishedSessions}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl">
                  <Calendar size={24} className="text-blue-400" />
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
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      العميل
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <DoorOpen size={16} />
                      الغرفة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      الحالة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      تاريخ البدء
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      تاريخ الانتهاء
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      المدة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      السعر النهائي
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-gray-700/30 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Gamepad2 size={20} className="text-blue-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-32 bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="h-2 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Gamepad2 size={48} className="text-gray-600" />
                        <p className="text-gray-400">
                          لا توجد جلسات في الفترة المحددة
                        </p>
                        {isFilterApplied && (
                          <button
                            onClick={clearFilters}
                            className="mt-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-lg transition-colors"
                          >
                            مسح الفلاتر لعرض جميع النتائج
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => viewSessionDetails(session)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {session.client.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {session.client.phoneNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {session.room.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatCurrency(session.room.hourCost)}/ساعة
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(
                            session.status
                          )} rounded-full text-sm font-medium`}
                        >
                          {getStatusLabel(session.status)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-300">
                          {formatDateTime(session.startTime)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-300">
                          {formatDateTime(session.endTime)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm text-cyan-300 font-medium">
                          {formatHours(session.totalHours)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-300 rounded-full text-sm font-bold border border-emerald-600/30">
                            {formatCurrency(session.finalPrice)}
                          </span>
                          {session.discount > 0 && (
                            <span className="text-xs text-amber-400 line-through">
                              {formatCurrency(
                                session.sessionPrice + session.discount
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showSessionDetails && selectedSession && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-4xl">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg">
                        <Gamepad2 size={20} className="text-blue-400" />
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSessionDetails(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3">
                          معلومات العميل
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">الاسم:</span>
                            <span className="font-bold text-white">
                              {selectedSession.client.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">رقم الهاتف:</span>
                            <span className="font-bold text-white">
                              {selectedSession.client.phoneNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              تاريخ الانضمام:
                            </span>
                            <span className="font-bold text-white">
                              {formatDate(selectedSession.client.dateJoined)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3">
                          معلومات الغرفة
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">اسم الغرفة:</span>
                            <span className="font-bold text-white">
                              {selectedSession.room.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">سعر الساعة:</span>
                            <span className="font-bold text-emerald-400">
                              {formatCurrency(selectedSession.room.hourCost)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">الحالة:</span>
                            <span
                              className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(
                                selectedSession.status
                              )} rounded-full text-sm font-medium`}
                            >
                              {getStatusLabel(selectedSession.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3">
                          تفاصيل الجلسة
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">الكاشير:</span>
                            <span className="font-bold text-white">
                              {selectedSession.cashierUserName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">تاريخ البدء:</span>
                            <span className="font-bold text-white">
                              {formatDateTime(selectedSession.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              تاريخ الانتهاء:
                            </span>
                            <span className="font-bold text-white">
                              {formatDateTime(selectedSession.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              المدة الإجمالية:
                            </span>
                            <span className="font-bold text-cyan-400">
                              {formatHours(selectedSession.totalHours)} (
                              {selectedSession.totalHours.toFixed(2)} ساعة)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3">
                          الحسابات المالية
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">سعر الجلسة:</span>
                            <span className="font-bold text-white">
                              {formatCurrency(selectedSession.sessionPrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">سعر المنتجات:</span>
                            <span className="font-bold text-white">
                              {formatCurrency(selectedSession.itemsPrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">الخصم:</span>
                            <span className="font-bold text-amber-400">
                              {formatCurrency(selectedSession.discount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-700/50 pt-3">
                            <span className="text-gray-400 text-lg">
                              السعر النهائي:
                            </span>
                            <span className="text-2xl font-bold text-emerald-400">
                              {formatCurrency(selectedSession.finalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedSession.items &&
                    selectedSession.items.length > 0 && (
                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-4">
                          المنتجات المطلوبة
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-700/50">
                                <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                                  المنتج
                                </th>
                                <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                                  النوع
                                </th>
                                <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                                  الكمية
                                </th>
                                <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                                  سعر الوحدة
                                </th>
                                <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                                  الإجمالي
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedSession.items.map((item, index) => (
                                <tr
                                  key={item.id || index}
                                  className="border-b border-gray-700/30"
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg">
                                        <Gamepad2
                                          size={16}
                                          className="text-blue-400"
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-white">
                                          {item.item?.name || "غير معروف"}
                                        </p>
                                        {item.item?.notes && (
                                          <p className="text-xs text-gray-400">
                                            {item.item.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-300 rounded text-xs border border-amber-600/30">
                                      {item.item?.itemType?.name || "غير معروف"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-white">
                                      {item.quantity}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-gray-300">
                                      {formatCurrency(item.unitPrice)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-emerald-400">
                                      {formatCurrency(item.totalPrice)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-700/50">
                                <td
                                  colSpan="4"
                                  className="py-3 px-4 text-right text-gray-300 font-bold"
                                >
                                  المجموع النهائي:
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(selectedSession.itemsPrice)}
                                  </span>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                  {selectedSession.notes && (
                    <div className="mt-6 bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                      <h3 className="text-lg font-bold text-white mb-3">
                        ملاحظات
                      </h3>
                      <p className="text-gray-300">{selectedSession.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 9999 !important;
        }

        .react-datepicker {
          font-family: inherit;
          background-color: #1f2937 !important;
          border: 1px solid #374151 !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          direction: rtl;
        }

        .react-datepicker__header {
          background-color: #111827 !important;
          border-bottom: 1px solid #374151 !important;
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
          padding-top: 12px !important;
          padding-bottom: 8px !important;
        }

        .react-datepicker__current-month {
          color: #e5e7eb !important;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 12px !important;
        }

        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-between !important;
          margin: 0 !important;
          padding: 0 8px !important;
        }

        .react-datepicker__day-name {
          color: #e5e7eb !important;
          font-weight: 500;
          font-size: 0.875rem;
          width: 2.5rem !important;
          margin: 0 !important;
          text-align: center !important;
          padding: 4px 0 !important;
        }

        .react-datepicker__month {
          margin: 0.5rem !important;
          background-color: #1f2937 !important;
          border-radius: 0.75rem !important;
          padding: 0 8px !important;
        }

        .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
          margin: 0 !important;
        }

        .react-datepicker__day {
          color: #d1d5db !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
          margin: 0 !important;
          text-align: center !important;
          border-radius: 0.375rem !important;
          font-size: 0.95rem !important;
        }

        .react-datepicker__day:hover {
          background-color: #374151 !important;
        }

        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6 !important;
        }

        .react-datepicker__navigation-icon::before {
          border-color: #9ca3af !important;
          border-width: 2px 2px 0 0 !important;
        }

        .react-datepicker__day--disabled {
          color: #6b7280 !important;
        }

        .react-datepicker__navigation--previous {
          right: 20px !important;
          left: auto !important;
        }

        .react-datepicker__navigation--next {
          left: 20px !important;
          right: auto !important;
        }

        .react-datepicker__day-name:first-child {
          color: #f87171 !important;
        }

        .react-datepicker__day-name:nth-child(7) {
          color: #60a5fa !important;
        }

        .react-datepicker-popper[data-placement^="bottom"] {
          padding-top: 8px !important;
        }

        .react-datepicker-popper[data-placement^="top"] {
          padding-bottom: 8px !important;
        }

        .react-datepicker__month-container {
          float: none !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default SessionsReportsPage;
