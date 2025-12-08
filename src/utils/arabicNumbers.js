export const toArabicNumbers = (num) => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
};

export const toEnglishNumbers = (str) => {
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
  return str.replace(/[٠-٩]/g, (digit) => arabicToEnglish[digit]);
};

export const arabicTimeToMinutes = (timeStr) => {
  let time = timeStr;
  let hours = 0;
  let minutes = 0;

  time = toEnglishNumbers(time);

  if (time.includes("صباحاً")) {
    time = time.replace("صباحاً", "").trim();
    [hours, minutes] = time.split(":").map(Number);
  } else if (time.includes("ظهراً")) {
    time = time.replace("ظهراً", "").trim();
    [hours, minutes] = time.split(":").map(Number);
    if (hours !== 12) hours += 12;
  } else if (time.includes("مساءً")) {
    time = time.replace("مساءً", "").trim();
    [hours, minutes] = time.split(":").map(Number);
    if (hours !== 12) hours += 12;
  }

  return hours * 60 + minutes;
};

export const getCurrentDate = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `${toArabicNumbers(day)}-${toArabicNumbers(month)}-${toArabicNumbers(
    year
  )}`;
};

export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = tomorrow.getDate();
  const month = tomorrow.getMonth() + 1;
  const year = tomorrow.getFullYear();
  return `${toArabicNumbers(day)}-${toArabicNumbers(month)}-${toArabicNumbers(
    year
  )}`;
};

export const arabicTimeSlots = [
  "٩:٠٠ صباحاً",
  "١٠:٠٠ صباحاً",
  "١١:٠٠ صباحاً",
  "١٢:٠٠ ظهراً",
  "١:٠٠ مساءً",
  "٢:٠٠ مساءً",
  "٣:٠٠ مساءً",
  "٤:٠٠ مساءً",
  "٥:٠٠ مساءً",
  "٦:٠٠ مساءً",
  "٧:٠٠ مساءً",
  "٨:٠٠ مساءً",
  "٩:٠٠ مساءً",
  "١٠:٠٠ مساءً",
  "١١:٠٠ مساءً",
];

export const formatApiTimeToArabic = (apiTimeString) => {
  if (!apiTimeString) return "٠٠:٠٠";

  const date = new Date(apiTimeString);
  let hours = date.getHours();
  let minutes = date.getMinutes();

  let period = "صباحاً";
  if (hours >= 12) {
    period = "مساءً";
  }
  hours = hours % 12 || 12;

  const arabicHours = toArabicNumbers(hours);
  const arabicMinutes = toArabicNumbers(minutes.toString().padStart(2, "0"));

  return `${arabicHours}:${arabicMinutes} ${period}`;
};

export const formatApiDate = (apiDateString) => {
  if (!apiDateString) return getCurrentDate();

  const date = new Date(apiDateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return getCurrentDate();
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return getTomorrowDate();
  } else {
    const day = toArabicNumbers(date.getDate());
    const month = toArabicNumbers(date.getMonth() + 1);
    const year = toArabicNumbers(date.getFullYear());
    return `${day}/${month}/${year}`;
  }
};
