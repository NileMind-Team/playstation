import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Printer,
  DollarSign,
  ShoppingBag,
  User,
  Clock,
  FileSpreadsheet,
  X,
  Coffee,
  Info,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const DrinkReportsPage = () => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const printFrameRef = useRef(null);

  // eslint-disable-next-line no-unused-vars
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
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
    totalSales: 0,
    totalRevenue: 0,
    totalItemsSold: 0,
  });
  // eslint-disable-next-line no-unused-vars
  const [cashiers, setCashiers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

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

  const fetchSales = async () => {
    try {
      setLoading(true);

      let params = {};
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        startDate.setHours(2, 0, 0, 0);
        params.startRange = startDate.toISOString();
      }
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(25, 59, 59, 999);
        params.endRange = endDate.toISOString();
      }

      const response = await axiosInstance.get("/api/DirectSales/GetAll", {
        params,
      });

      const salesData = response.data;
      setSales(salesData);
      setFilteredSales(salesData);

      const uniqueCashiers = [
        ...new Set(salesData.map((sale) => sale.cashierUserName)),
      ];
      setCashiers(uniqueCashiers);

      calculateStats(salesData);
      setIsFilterApplied(false);
    } catch (error) {
      console.error("خطأ في جلب المبيعات:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات المبيعات",
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
      fetchSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const calculateStats = (salesData) => {
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce(
      (sum, sale) => sum + sale.totalPrice,
      0
    );
    const totalItemsSold = salesData.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    setStats({
      totalSales,
      totalRevenue,
      totalItemsSold,
    });
  };

  const handleManualFilter = () => {
    fetchSales();
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

  const formatTime12Hour = (dateString) => {
    const date = new Date(dateString);
    return format(date, "hh:mm a", { locale: ar });
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
<title>تقرير مبيعات المشروبات</title>
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
    font-size: 12px;
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
    font-size: 11px;
    font-weight: normal;
  }
  
  .stat-card p {
    color: black !important;
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 10px;
    table-layout: fixed;
  }
  
  .print-table th {
    background-color: #f0f0f0 !important;
    color: black !important;
    padding: 8px 4px;
    text-align: right;
    border: 1px solid #ccc !important;
    font-weight: bold;
    font-size: 10px;
  }
  
  .print-table td {
    padding: 6px 4px;
    border: 1px solid #ddd !important;
    text-align: right;
    color: black !important;
    font-size: 9px;
  }
  
  .print-table tr:nth-child(even) {
    background-color: #f9f9f9 !important;
  }
  
  .invoice-id {
    color: black !important;
    font-weight: bold;
  }
  
  .cashier-name {
    color: black !important;
  }
  
  .date-cell {
    color: black !important;
  }
  
  .time-cell {
    color: black !important;
  }
  
  .total-amount {
    color: black !important;
    font-weight: bold;
  }
  
  .print-footer {
    margin-top: 20px;
    text-align: center;
    color: #666 !important;
    font-size: 10px;
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
  <h1>تقرير مبيعات المشروبات</h1>
  <p>نظام إدارة المبيعات - كاشير المشروبات</p>
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
  <div>عدد السجلات: ${filteredSales.length}</div>
</div>

<div class="stats-container">
  <div class="stat-card">
    <h3>إجمالي المبيعات</h3>
    <p>${stats.totalSales}</p>
  </div>
  <div class="stat-card">
    <h3>إجمالي الإيرادات</h3>
    <p>${formatCurrency(stats.totalRevenue)}</p>
  </div>
  <div class="stat-card">
    <h3>المنتجات المباعة</h3>
    <p>${stats.totalItemsSold}</p>
  </div>
</div>

${
  filteredSales.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد مبيعات في الفترة المحددة</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="10%">رقم الفاتورة</th>
        <th width="15%">الكاشير</th>
        <th width="12%">التاريخ</th>
        <th width="10%">الوقت</th>
        <th width="15%">عدد المنتجات</th>
        <th width="15%">إجمالي الكمية</th>
        <th width="13%">الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${filteredSales
        .map((sale) => {
          const totalItems = sale.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          return `
          <tr>
            <td class="invoice-id">${sale.id}</td>
            <td class="cashier-name">${sale.cashierUserName}</td>
            <td class="date-cell">${formatDate(sale.saleTime)}</td>
            <td class="time-cell">${formatTime12Hour(sale.saleTime)}</td>
            <td>${sale.items.length}</td>
            <td>${totalItems}</td>
            <td class="total-amount">${formatCurrency(sale.totalPrice)}</td>
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
    fetchSales();
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

  const handleShowProducts = (sale) => {
    setSelectedProducts(sale.items);
    setShowProductsModal(true);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
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
        className="fixed md:absolute top-4 md:top-6 left-4 md:left-6 z-10 group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-teal-500 transition-all duration-300 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <ArrowLeft
          size={20}
          className="text-gray-300 group-hover:text-teal-300 transition-colors"
        />
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-xl">
                  <FileText size={32} className="text-teal-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 bg-clip-text text-transparent pb-1">
                  تقارير كاشير المشروبات
                </h1>
                <p className="text-gray-400 mt-2 md:mt-3">
                  عرض وتحليل مبيعات المشروبات والطلبات النقدية
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
                  placeholder="بحث بالكاشير أو المنتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-teal-500 hover:bg-gray-700 transition-all duration-300"
              >
                <Filter size={18} className="text-teal-300" />
                <span className="hidden md:inline text-teal-300 font-medium">
                  فلاتر
                </span>
              </button>

              <button
                onClick={fetchSales}
                className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-teal-500 hover:bg-gray-700 transition-all duration-300"
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
                  <Filter size={20} className="text-teal-400" />
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
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                        className="w-full bg-gray-800/60 border border-gray-600 rounded-xl py-3 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                        className="w-full h-full flex items-center justify-center gap-2 text-white font-medium rounded-xl py-3 px-4 transition-all duration-300 shadow-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 hover:shadow-teal-500/25"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalSales}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 rounded-xl">
                  <ShoppingBag size={24} className="text-teal-400" />
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
                  <p className="text-gray-400 text-sm">
                    إجمالي المنتجات المباعة
                  </p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats.totalItemsSold}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl">
                  <Coffee size={24} className="text-cyan-400" />
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
                      <FileSpreadsheet size={16} />
                      رقم الفاتورة
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      الكاشير
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      التاريخ
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      الوقت
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} />
                      عدد المنتجات
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Coffee size={16} />
                      إجمالي الكمية
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      الإجمالي
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <Info size={16} />
                      تفاصيل
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
                          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <FileText size={20} className="text-teal-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-32 bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="h-2 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={48} className="text-gray-600" />
                        <p className="text-gray-400">
                          لا توجد مبيعات في الفترة المحددة
                        </p>
                        {isFilterApplied && (
                          <button
                            onClick={clearFilters}
                            className="mt-2 px-4 py-2 text-sm text-teal-400 hover:text-teal-300 hover:bg-teal-600/10 rounded-lg transition-colors"
                          >
                            مسح الفلاتر لعرض جميع النتائج
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const totalItems = sale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 text-teal-300 rounded-full text-sm font-medium border border-teal-600/30">
                            {sale.id}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 rounded-full text-sm font-medium border border-indigo-600/30">
                              {sale.cashierUserName}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-300">
                            {formatDate(sale.saleTime)}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-300">
                            {formatTime12Hour(sale.saleTime)}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-sm text-white font-medium">
                            {sale.items.length}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-sm text-cyan-300 font-medium">
                            {totalItems}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-300 rounded-full text-sm font-bold border border-emerald-600/30">
                              {formatCurrency(sale.totalPrice)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleShowProducts(sale)}
                            className="p-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 hover:text-cyan-300 rounded-lg border border-blue-600/30 hover:border-cyan-600/30 transition-all duration-300"
                            title="عرض تفاصيل المنتجات"
                          >
                            <Info size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showProductsModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-2xl">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg">
                        <ShoppingBag size={20} className="text-cyan-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        تفاصيل المنتجات المباعة
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowProductsModal(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
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
                          {selectedProducts.map((item, index) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 rounded-lg">
                                    <ShoppingBag
                                      size={16}
                                      className="text-teal-400"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      {item.item.name}
                                    </p>
                                    {item.item.notes && (
                                      <p className="text-xs text-gray-400">
                                        {item.item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-300 rounded text-xs border border-amber-600/30">
                                  {item.item.itemType.name}
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
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowProductsModal(false)}
                      className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-semibold text-white hover:from-gray-600 hover:to-gray-500 transition-all duration-300"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSaleDetails && selectedSale && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="relative w-full max-w-4xl">
              <div className="absolute -inset-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 rounded-lg">
                        <FileText size={20} className="text-teal-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        تفاصيل الفاتورة {selectedSale.id}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowSaleDetails(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">الكاشير:</span>
                        <span className="font-bold text-white">
                          {selectedSale.cashierUserName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">التاريخ:</span>
                        <span className="font-bold text-white">
                          {formatDate(selectedSale.saleTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">الوقت:</span>
                        <span className="font-bold text-white">
                          {formatTime12Hour(selectedSale.saleTime)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">إجمالي الفاتورة:</span>
                        <span className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(selectedSale.totalPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">عدد المنتجات:</span>
                        <span className="font-bold text-white">
                          {selectedSale.items.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">إجمالي الكمية:</span>
                        <span className="font-bold text-white">
                          {selectedSale.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50 p-4">
                    <h3 className="text-lg font-bold text-white mb-4">
                      تفاصيل المنتجات
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
                          {selectedSale.items.map((item, index) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-700/30"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 rounded-lg">
                                    <ShoppingBag
                                      size={16}
                                      className="text-teal-400"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      {item.item.name}
                                    </p>
                                    {item.item.notes && (
                                      <p className="text-xs text-gray-400">
                                        {item.item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-300 rounded text-xs border border-amber-600/30">
                                  {item.item.itemType.name}
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
                              <span className="text-2xl font-bold text-emerald-400">
                                {formatCurrency(selectedSale.totalPrice)}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
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
          background-color: #0d9488 !important;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: #0d9488 !important;
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

export default DrinkReportsPage;
