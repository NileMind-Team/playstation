import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  DoorOpen,
  Gamepad2,
  DollarSign,
  Search,
  Printer,
  RefreshCw,
  Sparkles,
  Package,
  History,
  X,
  ChevronDown,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const ClientSessionsPage = () => {
  const navigate = useNavigate();
  const printFrameRef = useRef(null);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalRevenue: 0,
    totalHours: 0,
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [clientsDropdownOpen, setClientsDropdownOpen] = useState(false);

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

  useEffect(() => {
    if (isAdmin) {
      fetchClients();
    }
  }, [isAdmin]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await axiosInstance.get("/api/Clients/GetAll");
      setClients(response.data);
    } catch (error) {
      console.error("خطأ في جلب العملاء:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات العملاء",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchClientSessions = async (clientId) => {
    try {
      setLoading(true);

      const params = { clientId };

      const response = await axiosInstance.get("/api/Sessions/GetAll", {
        params,
      });

      const sessionsData = response.data;
      setSessions(sessionsData);
      setFilteredSessions(sessionsData);

      calculateStats(sessionsData);

      Swal.fire({
        title: "تم التحميل",
        text: `تم تحميل ${sessionsData.length} جلسة للعميل`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
    } catch (error) {
      console.error("خطأ في جلب جلسات العميل:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب جلسات العميل",
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

    setStats({
      totalSessions,
      totalRevenue,
      totalHours: parseFloat(totalHours.toFixed(2)),
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
      case "Payed":
        return "from-purple-600/20 to-violet-600/20 text-purple-300 border-purple-600/30";
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
      case "Payed":
        return "مدفوعة";
      case "Pending":
        return "قيد الانتظار";
      case "Cancelled":
        return "ملغية";
      default:
        return status;
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientsDropdownOpen(false);
    fetchClientSessions(client.id);
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
<title>تقرير جلسات العميل</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    body {
      margin: 0; padding: 15px;
      font-family: 'Arial', sans-serif;
      background: white !important;
      color: black !important;
      direction: rtl;
      font-size: 12px;
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
  
  .client-info {
    margin: 15px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: #f9f9f9;
  }
  
  .client-info div {
    margin: 5px 0;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 20px 0;
    text-align: center;
  }
  
  .stat-card {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    border-radius: 5px;
    padding: 10px;
  }
  
  .stat-card h3 {
    color: #666 !important;
    margin: 0 0 8px 0;
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
    padding: 6px 4px;
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
  
  .status-badge {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: bold;
  }
  
  .status-payed {
    background: #ede9fe !important;
    color: #5b21b6 !important;
  }
  
  .status-finished {
    background: #dbeafe !important;
    color: #1e40af !important;
  }
  
  .status-active {
    background: #d1fae5 !important;
    color: #065f46 !important;
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
  <h1>تقرير جلسات العميل</h1>
  <p>نظام حجز جلسات الألعاب</p>
</div>

${
  selectedClient
    ? `
<div class="client-info">
  <div><strong>اسم العميل:</strong> ${selectedClient.name}</div>
  <div><strong>رقم الهاتف:</strong> ${selectedClient.phoneNumber}</div>
  <div><strong>تاريخ الانضمام:</strong> ${new Date(
    selectedClient.dateJoined
  ).toLocaleDateString("ar-EG")}</div>
  <div><strong>حالة العميل:</strong> ${
    selectedClient.isActive ? "نشط" : "غير نشط"
  }</div>
</div>
`
    : ""
}

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
    <p>${stats.totalHours.toFixed(2)} ساعة</p>
  </div>
</div>

${
  filteredSessions.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد جلسات</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="15%">رقم الجلسة</th>
        <th width="15%">الغرفة</th>
        <th width="10%">الحالة</th>
        <th width="15%">تاريخ البدء</th>
        <th width="8%">المدة</th>
        <th width="12%">سعر الجلسة</th>
        <th width="10%">خصم</th>
        <th width="15%">السعر النهائي</th>
      </tr>
    </thead>
    <tbody>
      ${filteredSessions
        .map((session) => {
          const statusClass = `status-${session.status.toLowerCase()}`;
          return `
          <tr>
            <td>${session.sessionCode}</td>
            <td>${session.room.name}</td>
            <td><span class="status-badge ${statusClass}">${getStatusLabel(
            session.status
          )}</span></td>
            <td>${formatDateTime(session.startTime)}</td>
            <td>${formatHours(session.totalHours)}</td>
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

<div class="print-footer">
  <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-EG")}</p>
  <p>عدد السجلات: ${filteredSessions.length}</p>
</div>

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

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6"
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
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <History size={32} className="text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent pb-1">
                  جلسات العملاء
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  عرض وتحليل جلسات كل عميل
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  selectedClient && fetchClientSessions(selectedClient.id)
                }
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300"
                title="تحديث البيانات"
                disabled={!selectedClient}
              >
                <RefreshCw size={20} className="text-gray-300" />
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting || !selectedClient}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="mt-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm relative z-50">
            <div className="flex items-center gap-3 mb-4">
              <Users size={20} className="text-indigo-400" />
              <h3 className="text-lg font-bold text-white">اختيار العميل</h3>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setClientsDropdownOpen(!clientsDropdownOpen)}
                className={`w-full bg-gray-700/60 border ${
                  selectedClient ? "border-indigo-500/50" : "border-gray-600"
                } rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 flex items-center justify-between group hover:bg-gray-700/80 relative z-50`}
              >
                <div className="flex items-center gap-3">
                  {loadingClients ? (
                    <>
                      <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-400">
                        جاري تحميل العملاء...
                      </span>
                    </>
                  ) : selectedClient ? (
                    <>
                      <div className="p-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg">
                        <Users size={16} className="text-indigo-400" />
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">
                          {selectedClient.name}
                        </span>
                        <p className="text-xs text-gray-400">
                          {selectedClient.phoneNumber}
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400">اختر عميل من القائمة</span>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 ${
                    clientsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {clientsDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-2 bg-gray-800 border border-indigo-500/30 rounded-xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-sm">
                  <div className="p-3 border-b border-gray-700">
                    <div className="relative">
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search size={18} className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="ابحث عن عميل..."
                        onChange={(e) => {}}
                        className="w-full bg-gray-700/60 border border-gray-600 rounded-lg py-2 px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {loadingClients ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-400 text-sm">
                          جاري تحميل العملاء...
                        </p>
                      </div>
                    ) : clients.length > 0 ? (
                      clients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-indigo-500/10 cursor-pointer transition-all duration-200 group/item border-b border-gray-700/30 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg">
                              <Users size={16} className="text-indigo-400" />
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-white group-hover/item:text-indigo-300">
                                {client.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {client.phoneNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                client.isActive
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {client.isActive ? "نشط" : "غير نشط"}
                            </span>
                            <History
                              size={14}
                              className="text-indigo-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-gray-400 text-sm">لا توجد عملاء</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedClient && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl border border-indigo-500/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">اسم العميل:</span>
                    <span className="font-bold text-white">
                      {selectedClient.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">رقم الهاتف:</span>
                    <span className="font-bold text-white">
                      {selectedClient.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">تاريخ الانضمام:</span>
                    <span className="font-bold text-white">
                      {formatDate(selectedClient.dateJoined)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedClient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي الجلسات</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalSessions}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl">
                    <Gamepad2 size={24} className="text-indigo-400" />
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
                      {stats.totalHours.toFixed(2)} ساعة
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl">
                    <Clock size={24} className="text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedClient && (
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900/50">
                    <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <Gamepad2 size={16} />
                        رقم الجلسة
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
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-700/30 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <History size={20} className="text-indigo-400" />
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
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Gamepad2 size={48} className="text-gray-600" />
                          <p className="text-gray-400">لا توجد جلسات</p>
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
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 rounded-full text-sm font-medium border border-indigo-600/30">
                            {session.sessionCode}
                          </span>
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
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(
                                session.status
                              )} rounded-full text-sm font-medium`}
                            >
                              {getStatusLabel(session.status)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-300">
                            {formatDateTime(session.startTime)}
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
                                  session.sessionPrice + session.itemsPrice
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
        )}

        {showSessionDetails && selectedSession && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <div className="relative w-full max-w-6xl">
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl blur-xl opacity-30"></div>
              <div
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
                style={{ maxHeight: "90vh" }}
              >
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl">
                        <Gamepad2 size={24} className="text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          تفاصيل الجلسة #{selectedSession.sessionCode}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          للعميل: {selectedSession.client.name}
                        </p>
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

                <div
                  className="p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 100px)" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <Users size={18} />
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
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <DoorOpen size={18} />
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
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <Clock size={18} />
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
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <DollarSign size={18} />
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
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Package size={18} />
                          المنتجات المطلوبة ({selectedSession.items.length})
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-700/50">
                                <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                                  المنتج
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
                                  key={item.product?.id || index}
                                  className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg">
                                        <Package
                                          size={16}
                                          className="text-indigo-400"
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-white">
                                          {item.product?.name || "غير معروف"}
                                        </p>
                                      </div>
                                    </div>
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
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSessionsPage;
