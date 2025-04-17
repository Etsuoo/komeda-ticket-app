// DOM要素の取得
const ticketsContainer = document.getElementById('tickets-container');
const addTicketBtn = document.getElementById('add-ticket-btn');
const modal = document.getElementById('add-ticket-modal');
const ticketForm = document.getElementById('ticket-form');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const storeNameInput = document.getElementById('store-name');
const ticketCountInput = document.getElementById('ticket-count');
const ticketPriceInput = document.getElementById('ticket-price');
const purchaseDateInput = document.getElementById('purchase-date');
const stepperMinusBtn = document.querySelector('.stepper-btn.minus');
const stepperPlusBtn = document.querySelector('.stepper-btn.plus');

// チケットデータを管理する配列
let tickets = [];

// アプリの初期化
function initApp() {
    // ローカルストレージからデータを読み込む
    loadTicketsFromLocalStorage();
    
    // チケット一覧を表示
    renderTickets();
    
    // イベントリスナーの設定
    addEventListeners();
}
// 保存するキー名を修正（パスに依存しないようにする）
const STORAGE_KEY = 'komeda-tickets-data';

// ローカルストレージからチケットデータを読み込む
function loadTicketsFromLocalStorage() {
    const savedTickets = localStorage.getItem(STORAGE_KEY);
    console.log('読み込んだデータ:', savedTickets); // デバッグ用
    if (savedTickets) {
        tickets = JSON.parse(savedTickets);
        console.log('パース後のチケット:', tickets); // デバッグ用
    }
}

// ローカルストレージにチケットデータを保存
function saveTicketsToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    console.log('保存したデータ:', JSON.stringify(tickets)); // デバッグ用
}

// チケット一覧を画面に表示
function renderTickets() {
    ticketsContainer.innerHTML = '';
    
    if (tickets.length === 0) {
        ticketsContainer.innerHTML = '<p class="no-tickets">チケットがありません。「+」ボタンから追加してください。</p>';
        return;
    }
    
    tickets.forEach((ticket, index) => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket-card';
        
        ticketCard.innerHTML = `
            <div class="store-name">${ticket.storeName}</div>
            <div class="ticket-count">残り: ${ticket.remainingCount}枚</div>
            <div class="ticket-price">1枚あたり: ${Math.round(ticket.price / ticket.totalCount)}円</div>
            <div class="card-actions">
                <button class="use-btn" data-index="${index}">使用</button>
            </div>
        `;
        
        ticketsContainer.appendChild(ticketCard);
    });
    
    // 使用ボタンにイベントリスナーを追加
    document.querySelectorAll('.use-btn').forEach(button => {
        button.addEventListener('click', handleUseTicket);
    });
}

// チケットを使用する処理
function handleUseTicket(event) {
    const index = parseInt(event.target.dataset.index);
    
    if (tickets[index].remainingCount > 0) {
        tickets[index].remainingCount--;
        saveTicketsToLocalStorage();
        renderTickets();
    } else {
        alert('チケットが残っていません');
    }
}

// 新しいチケットを追加
function addNewTicket(storeName, totalCount, price, purchaseDate) {
    const newTicket = {
        id: Date.now(), // ユニークIDとして現在のタイムスタンプを使用
        storeName,
        totalCount: parseInt(totalCount),
        remainingCount: parseInt(totalCount),
        price: parseInt(price),
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0]
    };
    
    tickets.push(newTicket);
    saveTicketsToLocalStorage();
    renderTickets();
}

// フォームのバリデーション
function validateForm() {
    const isValid = storeNameInput.value.trim() !== '' && 
                   ticketCountInput.value > 0 && 
                   ticketPriceInput.value > 0;
    
    saveBtn.disabled = !isValid;
    return isValid;
}

// ステッパーの値を更新
function updateStepperValue(increment) {
    let value = parseInt(ticketCountInput.value) || 10;
    value = increment ? value + 1 : Math.max(1, value - 1);
    ticketCountInput.value = value;
    validateForm();
}

// イベントリスナーの設定
function addEventListeners() {
    // 「+」ボタンクリックでモーダルを表示
    addTicketBtn.addEventListener('click', () => {
        // フォームをリセット
        ticketForm.reset();
        ticketCountInput.value = 10; // デフォルト値を設定
        validateForm();
        modal.style.display = 'block';
    });
    
    // キャンセルボタンクリックでモーダルを閉じる
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // モーダルの外側をクリックしたらモーダルを閉じる
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // ステッパーボタンのイベント
    stepperMinusBtn.addEventListener('click', () => updateStepperValue(false));
    stepperPlusBtn.addEventListener('click', () => updateStepperValue(true));
    
    // 入力フィールドの変更時にバリデーションを実行
    storeNameInput.addEventListener('input', validateForm);
    ticketCountInput.addEventListener('input', validateForm);
    ticketPriceInput.addEventListener('input', validateForm);
    
    // フォーム送信時の処理
    ticketForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (validateForm()) {
            addNewTicket(
                storeNameInput.value,
                ticketCountInput.value,
                ticketPriceInput.value,
                purchaseDateInput.value
            );
            
            modal.style.display = 'none';
        }
    });
}

// アプリの初期化を実行
document.addEventListener('DOMContentLoaded', initApp);