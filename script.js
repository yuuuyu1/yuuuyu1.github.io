/* --- script.js --- */

// 1. 初期設定とDOM要素の取得
const debtAmountElement = document.getElementById('debt-amount');
const paymentInput = document.getElementById('payment-input');
const recordButton = document.getElementById('record-payment');
const statusMessage = document.getElementById('status-message');
const lastDateElement = document.getElementById('last-date');

// 定数設定
const annualRate = 0.15; // 年利 15%
const dailyRate = annualRate / 365; // 日歩
const INITIAL_DEBT = 100000; // 初期残高 100,000円

// 変数設定 (LocalStorageから読み込むか、初期値を使用)
let totalDebt;
let lastPaymentDate; 


// 2. LocalStorageからデータを読み込む関数
function loadData() {
    // 借金残高の読み込み
    const savedDebt = localStorage.getItem('debtAmount');
    if (savedDebt !== null && !isNaN(parseFloat(savedDebt))) {
        // 保存データがあれば読み込み
        totalDebt = parseFloat(savedDebt);
    } else {
        // なければ初期値
        totalDebt = INITIAL_DEBT; 
    }

    // 最終返済日の読み込み
    const savedDate = localStorage.getItem('lastDate');
    if (savedDate !== null && !isNaN(parseInt(savedDate, 10))) {
        // 保存データがあれば読み込み
        lastPaymentDate = new Date(parseInt(savedDate, 10));
    } else {
        // なければ現在の日付
        lastPaymentDate = new Date(); 
    }
}

// 3. LocalStorageにデータを保存する関数
function saveData() {
    // totalDebtを保存
    localStorage.setItem('debtAmount', totalDebt);
    // lastPaymentDateをミリ秒 (数値) にして保存
    localStorage.setItem('lastDate', lastPaymentDate.getTime());
}


// 4. 表示更新関数
function updateDisplay() {
    // 小数点を四捨五入して表示
    debtAmountElement.textContent = Math.round(totalDebt).toLocaleString();
    lastDateElement.textContent = lastPaymentDate.toLocaleDateString('ja-JP');

    if (totalDebt <= 0) {
        debtAmountElement.style.color = '#5cb85c'; // 緑色
        statusMessage.textContent = '🎊 借金完済おめでとうございます！ 🎊';
        recordButton.disabled = true;
    } else {
        debtAmountElement.style.color = '#d9534f'; // 赤色
        statusMessage.textContent = '目標まであと少し！頑張りましょう！';
        recordButton.disabled = false;
    }
}


// 5. アニメーション関数 (変更なし)
function animateCounter(startValue, endValue, duration = 800) {
    let startTime = null;
    const range = endValue - startValue; 
    
    if (window.currentAnimation) {
        cancelAnimationFrame(window.currentAnimation);
    }

    function frame(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        const currentValue = Math.round(startValue + (range * percentage));

        debtAmountElement.textContent = currentValue.toLocaleString();
        
        if (percentage < 1) {
            window.currentAnimation = requestAnimationFrame(frame);
        } else {
            updateDisplay(); // アニメーション完了後に表示を確定
        }
    }
    
    window.currentAnimation = requestAnimationFrame(frame);
}


// 6. 利子計算と返済処理
function recordPayment() {
    const payment = parseInt(paymentInput.value, 10);
    const today = new Date();

    if (isNaN(payment) || payment <= 0) {
        alert('有効な返済額を入力してください。');
        return;
    }
    if (totalDebt <= 0) return;

    // --- 利子計算 ---
    // 経過日数を計算
    const diffTime = today.getTime() - lastPaymentDate.getTime();
    // 1日のミリ秒数
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 0) {
        const interest = totalDebt * dailyRate * diffDays;
        totalDebt += interest;
        alert(`${diffDays}日経過したため、利子として ${Math.round(interest).toLocaleString()} 円が加算されました。`);
    }
    
    // --- 返済処理 ---
    const startDebt = totalDebt;
    
    const newDebt = Math.max(0, totalDebt - payment);

    // 総残高と最終返済日を更新
    totalDebt = newDebt;
    lastPaymentDate = today;

    // *** ここでLocalStorageにデータを保存 ***
    saveData();

    // アニメーションを開始
    animateCounter(startDebt, newDebt, 800);

    // 入力欄をクリア
    paymentInput.value = '';
}


// 7. 初期化処理
// ページ読み込み時に実行されます
function initialize() {
    loadData(); // 保存データがあれば読み込む
    updateDisplay(); // 表示を初期化
    recordButton.addEventListener('click', recordPayment);
}

// スクリプトの実行開始
initialize();
