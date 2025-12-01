/* --- script.js (Undo機能付き) --- */

// 1. 初期設定とDOM要素の取得
const debtAmountElement = document.getElementById('debt-amount');
const paymentInput = document.getElementById('payment-input');
const recordButton = document.getElementById('record-payment');
const statusMessage = document.getElementById('status-message');
const lastDateElement = document.getElementById('last-date');
const borrowInput = document.getElementById('borrow-input');
const borrowButton = document.getElementById('record-borrow');
// ★★★ UndoボタンのDOMを取得 ★★★
const undoButton = document.getElementById('undo-action');


// 定数設定
const annualRate = 0.15; // 年利 15%
const dailyRate = annualRate / 365; // 日歩
const INITIAL_DEBT = 100000; // 初期残高 100,000円
const MAX_HISTORY = 10; // 履歴を保存する最大数

// 変数設定
let totalDebt;
let lastInterestDate;
// ★★★ 履歴配列の追加 ★★★
let history = []; 


// 2. LocalStorageからデータを読み込む関数
function loadData() {
    const savedDebt = localStorage.getItem('debtAmount');
    if (savedDebt !== null && !isNaN(parseFloat(savedDebt))) {
        totalDebt = parseFloat(savedDebt);
    } else {
        totalDebt = INITIAL_DEBT; 
    }

    const savedDate = localStorage.getItem('lastInterestDate');
    if (savedDate !== null && !isNaN(parseInt(savedDate, 10))) {
        lastInterestDate = new Date(parseInt(savedDate, 10));
    } else {
        lastInterestDate = new Date(); 
    }
    
    // ★★★ 履歴の読み込み ★★★
    const savedHistory = localStorage.getItem('debtHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }
}

// 3. LocalStorageにデータを保存する関数
function saveData() {
    localStorage.setItem('debtAmount', totalDebt);
    localStorage.setItem('lastInterestDate', lastInterestDate.getTime());
    // ★★★ 履歴の保存 ★★★
    localStorage.setItem('debtHistory', JSON.stringify(history));
}

// 4. ★★★ 状態を履歴に保存する関数を新設 ★★★
function saveHistory() {
    // 現在の状態をオブジェクトとして保存
    const currentState = {
        debt: totalDebt,
        date: lastInterestDate.getTime() // Dateオブジェクトはミリ秒で保存
    };
    
    // 配列の先頭に追加
    history.unshift(currentState);
    
    // 履歴が最大数を超えたら古いものを削除
    if (history.length > MAX_HISTORY) {
        history.pop();
    }
    
    updateDisplay(); // 履歴の有無でUndoボタンの状態が変わるため
}


// 5. 表示更新関数
function updateDisplay() {
    debtAmountElement.textContent = Math.round(totalDebt).toLocaleString();
    lastDateElement.textContent = lastInterestDate.toLocaleDateString('ja-JP');

    if (totalDebt <= 0) {
        // ... (省略：完済時の処理) ...
        recordButton.disabled = true;
        if (borrowButton) borrowButton.disabled = true;
    } else {
        // ... (省略：通常時の処理) ...
        recordButton.disabled = false;
        if (borrowButton) borrowButton.disabled = false;
    }

    // ★★★ Undoボタンの有効/無効を制御 ★★★
    if (undoButton) {
        undoButton.disabled = history.length === 0;
    }
}


// 6. アニメーション関数 (変更なし)
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
            updateDisplay();
        }
    }
    
    window.currentAnimation = requestAnimationFrame(frame);
}


// 7. 利子計算と返済処理
function recordPayment() {
    const payment = parseInt(paymentInput.value, 10);
    const today = new Date();

    if (isNaN(payment) || payment <= 0) {
        alert('有効な返済額を入力してください。');
        return;
    }
    if (totalDebt <= 0) return;

    // ★★★ 操作前に履歴を保存 ★★★
    saveHistory(); 
    
    // --- 利子計算 ---
    const diffTime = today.getTime() - lastInterestDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let interestAdded = 0;
    if (diffDays > 0) {
        interestAdded = totalDebt * dailyRate * diffDays;
        totalDebt += interestAdded;
        alert(`${diffDays}日経過したため、利子として ${Math.round(interestAdded).toLocaleString()} 円が加算されました。`);
    }
    
    // --- 返済処理 ---
    const startDebt = totalDebt;
    const newDebt = Math.max(0, totalDebt - payment);

    totalDebt = newDebt;
    lastInterestDate = today;

    saveData();
    animateCounter(startDebt, newDebt, 800);
    paymentInput.value = '';
}


// 8. 借金追加処理
function recordBorrow() {
    const borrowAmount = parseInt(borrowInput.value, 10);
    const today = new Date();

    if (isNaN(borrowAmount) || borrowAmount <= 0) {
        alert('有効な借入額を入力してください。');
        return;
    }
    
    // ★★★ 操作前に履歴を保存 ★★★
    saveHistory();
    
    // --- 利子計算 ---
    const diffTime = today.getTime() - lastInterestDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let interestAdded = 0;
    if (diffDays > 0) {
        interestAdded = totalDebt * dailyRate * diffDays;
        totalDebt += interestAdded;
        alert(`${diffDays}日経過したため、利子として ${Math.round(interestAdded).toLocaleString()} 円が加算されました。`);
    }

    // --- 借入額の追加 ---
    const startDebt = totalDebt;
    const newDebt = totalDebt + borrowAmount;

    totalDebt = newDebt;
    lastInterestDate = today; 

    alert(`${borrowAmount.toLocaleString()} 円の借金が追加されました！`);

    saveData();
    animateCounter(startDebt, newDebt, 800);
    borrowInput.value = '';
}


// 9. ★★★ Undoアクション関数を新設 ★★★
function undoAction() {
    if (history.length === 0) {
        alert("元に戻せる履歴がありません。");
        return;
    }
    
    // 履歴から最新の状態を取り出す
    const previousState = history.shift();
    
    const startDebt = totalDebt;
    
    // 状態を適用
    totalDebt = previousState.debt;
    lastInterestDate = new Date(previousState.date);
    
    // 変更を保存
    saveData();
    
    // アニメーションを適用
    animateCounter(startDebt, totalDebt, 800);

    alert("一つ前の操作に戻しました。");
}


// 10. 初期化処理
function initialize() {
    loadData();
    updateDisplay();
    recordButton.addEventListener('click', recordPayment);
    if (borrowButton) {
        borrowButton.addEventListener('click', recordBorrow);
    }
    // ★★★ Undoボタンにイベントリスナーを設定 ★★★
    if (undoButton) {
        undoButton.addEventListener('click', undoAction);
    }
}

// スクリプトの実行開始
initialize();
