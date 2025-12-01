const annualRate = 0.15; // 年利 15%
const dailyRate = annualRate / 365; // 日歩
let totalDebt = 100000; // 初期残高 100,000円
let lastPaymentDate = new Date(); // 最終返済日を今日の日付で開始
