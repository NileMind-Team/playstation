import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Check,
  Trash2,
  Plus,
  Minus,
  Printer,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

export default function DrinksCashier() {
  const [products, setProducts] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [lastReceiptData, setLastReceiptData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printFrameRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingTypes(true);

        const typesResponse = await axiosInstance.get("/api/ItemTypes/GetAll");
        const fetchedTypes = typesResponse.data;
        setItemTypes(fetchedTypes);
        setLoadingTypes(false);

        if (fetchedTypes.length > 0) {
          setActiveTab(fetchedTypes[0].id.toString());
          await fetchProductsByType(fetchedTypes[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ في جلب البيانات",
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

    fetchData();

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
  }, []);

  const fetchProductsByType = async (typeId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/Items/GetAll?typeId=${typeId}`
      );

      const availableProducts = response.data.filter(
        (product) => product.isAvailable
      );

      setProducts(availableProducts);
    } catch (error) {
      console.error("Error fetching products by type:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب المنتجات",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (typeId) => {
    setActiveTab(typeId.toString());
    await fetchProductsByType(typeId);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: item.price * (item.quantity + 1),
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            totalPrice: product.price,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.price * newQuantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleEmptyCart = () => {
    if (cart.length === 0) return;

    Swal.fire({
      title: "تأكيد إفراغ السلة",
      text: "هل أنت متأكد من إفراغ السلة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، أفرغ السلة",
      cancelButtonText: "إلغاء",
      background: "#0f172a",
      color: "#e2e8f0",
      backdrop: "rgba(0, 0, 0, 0.7)",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setCart([]);
        Swal.fire({
          icon: "success",
          title: "تمت العملية",
          text: "تم إفراغ السلة بنجاح",
          timer: 2000,
          showConfirmButton: false,
          background: "#0f172a",
          color: "#e2e8f0",
          backdrop: "rgba(0, 0, 0, 0.7)",
        });
      }
    });
  };

  const handleConfirmOrder = async (printReceipt = false) => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "السلة فارغة",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
      return;
    }

    try {
      const totalAmount = calculateTotal();

      Swal.fire({
        title: "جاري تأكيد الطلب...",
        text: "يرجى الانتظار",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      const requestData = {
        notes: "",
        items: cart.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await axiosInstance.post(
        "/api/DirectSales/Add",
        requestData
      );

      const receiptData = {
        id: response.data.id || Date.now(),
        items: cart,
        totalAmount,
        notes: "",
        date: new Date().toLocaleString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      };

      setLastReceiptData(receiptData);

      Swal.close();

      if (printReceipt && receiptData) {
        setIsPrinting(true);
        await handlePrintReceipt(receiptData);
        setIsPrinting(false);
      }

      Swal.fire({
        icon: "success",
        title: "تم تأكيد الطلب بنجاح",
        html: `
          <div style="text-align: right;">
            <p>تم تأكيد الطلب النقدي بنجاح</p>
             <p><strong>عدد المنتجات:</strong> ${cart.length}</p>
            <p><strong>الإجمالي:</strong> ${totalAmount} ج.م</p>
          </div>
        `,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      setCart([]);
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "خطأ في تأكيد الطلب",
        text: "حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.",
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: "حاول مرة أخرى",
        background: "#0f172a",
        color: "#e2e8f0",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });
      console.error("Error confirming order:", error);
    }
  };

  const handleConfirmAndPrint = () => {
    handleConfirmOrder(true);
  };

  const handlePrintReceipt = async (receiptData = null) => {
    return new Promise((resolve, reject) => {
      try {
        const dataToPrint = receiptData || lastReceiptData;

        if (!dataToPrint) {
          Swal.fire({
            icon: "warning",
            title: "لا توجد فاتورة",
            text: "لا توجد فاتورة متاحة للطباعة",
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
            backdrop: "rgba(0, 0, 0, 0.7)",
          });
          reject(new Error("No receipt data available"));
          return;
        }

        const receiptContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>فاتورة مبيعات</title>
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
  .info { width: 100%; margin: 12px 0; text-align: right; font-size: 12px; }
  .info div { margin: 6px 0; }

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
  .final-total { font-size: 14px; margin-top: 4px; font-weight: bold; color: #000; }
  .footer { margin-top: 12px; padding-top: 8px; border-top: 1px dashed #000; text-align: center; font-size: 10px; }
  .thank-you { font-size: 14px; font-weight: bold; margin: 6px 0; text-align: center; }
  .barcode { text-align: center; margin: 6px 0; }
  .notes { margin-top: 6px; padding: 6px; border: 1px dashed #000; font-size: 10px; text-align: right; }
</style>
</head>
<body>

<div class="header">
  <h1>Workspace</h1>
  <div>تلفون: 0123456789</div>
  <div>العنوان: العنوان التجاري</div>
</div>

<div class="info">
  <div>رقم الفاتورة: ${dataToPrint.orderNumber}</div>
  <div>التاريخ: ${dataToPrint.date}</div>
  <div>نوع الدفع: نقدي</div>
</div>

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
    ${dataToPrint.items
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.quantity}</td>
          <td>${item.name}</td>
          <td>${item.price} ج.م</td>
          <td>${item.totalPrice} ج.م</td>
        </tr>
      `
      )
      .join("")}
  </tbody>
</table>

<div class="total-section">
  <div class="total-row"><span>عدد الأصناف:</span><span>${
    dataToPrint.items.length
  }</span></div>
  <div class="total-row"><span>إجمالي الكمية:</span><span>${dataToPrint.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )}</span></div>
  <div class="total-row"><span>المبلغ الإجمالي:</span><span>${
    dataToPrint.totalAmount
  } ج.م</span></div>
  <div class="total-row final-total"><span>المبلغ المستحق:</span><span>${
    dataToPrint.totalAmount
  } ج.م</span></div>
</div>

<div class="thank-you">شكراً لزيارتكم</div>

<div class="footer">
  <div>للاستفسار: 0123456789</div>
  <div>نرجو زيارة المحل مرة أخرى</div>
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">كاشير المشروبات</h2>
            <p className="text-gray-400 mt-1">نظام الطلبات النقدية</p>
          </div>
          {isPrinting && (
            <div className="flex items-center text-blue-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-2"></div>
              <span>جاري طباعة الفاتورة...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-7/12 p-6 overflow-y-auto border-l border-gray-700">
          <div className="mb-6">
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {loadingTypes ? (
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-24 h-10 bg-gray-800 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : itemTypes.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  لا توجد أنواع منتجات
                </div>
              ) : (
                itemTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTabChange(type.id)}
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${
                      activeTab === type.id.toString()
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {type.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 border-4 border-gray-700/30 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <ShoppingCart size={24} className="text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2 mt-6">
                  <div className="h-2 w-32 bg-gray-700 rounded-full animate-pulse mx-auto"></div>
                  <div className="h-2 w-24 bg-gray-700 rounded-full animate-pulse mx-auto"></div>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={64} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                لا توجد منتجات متاحة
              </h3>
              <p className="text-gray-500">
                لا توجد منتجات متاحة في هذا القسم حالياً
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={64} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-500">
                لم يتم العثور على منتجات مطابقة للبحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full h-full p-4 flex items-center gap-3"
                  >
                    <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-600">
                      {product.imageUrl ? (
                        <img
                          src={`https://cyberplay.runasp.net/${product.imageUrl}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <div className="text-gray-500 text-xs">
                            لا توجد صورة
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-blue-400 font-bold">
                        {product.price} ج.م
                      </p>
                    </div>
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-5/12 p-6 bg-gradient-to-b from-gray-900 to-black flex flex-col">
          <div className="flex items-center mb-6">
            <ShoppingCart size={24} className="ml-2 text-blue-400" />
            <h3 className="text-xl font-bold">سلة المشتريات</h3>
            <span className="mr-auto bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {cart.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                <p>السلة فارغة</p>
                <p className="text-sm mt-2">أضف منتجات من القائمة</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4 border border-gray-700 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-600">
                        {item.imageUrl ? (
                          <img
                            src={`https://cyberplay.runasp.net/${item.imageUrl}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="text-gray-500 text-xs">
                              لا توجد صورة
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-blue-400 font-bold text-sm">
                          {item.price} ج.م
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600/20 hover:border-red-500/50 border border-gray-600 transition-all"
                      >
                        <Minus size={14} className="text-red-400" />
                      </button>

                      <div className="min-w-[30px] text-center">
                        <span className="font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600/20 hover:border-green-500/50 border border-gray-600 transition-all"
                      >
                        <Plus size={14} className="text-green-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right min-w-[80px]">
                        <p className="text-green-400 font-bold">
                          {item.totalPrice} ج.م
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-gray-700 mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-lg text-gray-300">الإجمالي الكلي:</span>
                <p className="text-gray-400 text-sm mt-1">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} منتج
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-green-400">
                  {calculateTotal()} ج.م
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleConfirmOrder(false)}
                disabled={isPrinting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-4 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={20} className="ml-2" />
                تأكيد الطلب
              </button>

              <button
                onClick={handleConfirmAndPrint}
                disabled={isPrinting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPrinting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري الطباعة...
                  </>
                ) : (
                  <>
                    <Printer size={20} className="ml-2" />
                    تأكيد وطباعة
                  </>
                )}
              </button>

              <button
                onClick={handleEmptyCart}
                disabled={cart.length === 0 || isPrinting}
                className="px-6 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                إفراغ السلة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
