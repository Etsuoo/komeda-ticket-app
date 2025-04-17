// グローバル変数と定数
const STORAGE_KEY = 'komeda-tickets-data';
let tickets = [];
let isEditMode = false;
let editingTicketId = null;

// DOM要素の取得
document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の参照を取得
    const ticketsContainer = document.getElementById('tickets-container');
    const addTicketBtn = document.getElementById('add-ticket-btn');
    const ticketModal = document.getElementById('ticket-modal');
    const modalTitle = document.getElementById('modal-title');
    const ticketForm = document.getElementById('ticket-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const storeNameInput = document.getElementById('store-name');
    const ticketCountInput = document.getElementById('ticket-count');
    const ticketPriceInput = document.getElementById('ticket-price');
    const purchaseDateInput = document.getElementById('purchase-date');
    const expireDateInput = document.getElementById('expire-date');
    const noExpireCheckbox = document.getElementById('no-expire');
    const editTicketIdInput = document.getElementById('edit-ticket-id');
    const stepperMinusBtn = document.querySelector('.stepper-btn.minus');
    const stepperPlusBtn = document.querySelector('.stepper-btn.plus');
    
    // デバッグ用：プラスボタンの存在確認
    console.log('プラスボタン要素:', addTicketBtn);
    
    if (!addTicketBtn) {
        console.error('プラスボタン要素が見つかりません');
    } else {
        console.log('プラスボタンが正常に見つかりました');
    }

    // アプリの初期化
    function initApp() {
        console.log('アプリ初期化開始');
        
        // ローカルストレージからデータを読み込む
        loadTicketsFromLocalStorage();
        
        // チケット一覧を表示
        renderTickets();
        
        // イベントリスナーの設定
        addEventListeners();
        
        console.log('アプリ初期化完了');
    }

    // ローカルストレージからチケットデータを読み込む
    function loadTicketsFromLocalStorage() {
        try {
            console.log('ローカルストレージからデータ読み込み試行');
            const savedTickets = localStorage.getItem(STORAGE_KEY);
            console.log('読み込んだデータ:', savedTickets);
            
            if (savedTickets) {
                tickets = JSON.parse(savedTickets);
                console.log('パース後のチケット数:', tickets.length);
            } else {
                console.log('保存されたデータはありません');
                tickets = [];
            }
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            tickets = [];
        }
    }

    // ローカルストレージにチケットデータを保存
    function saveTicketsToLocalStorage() {
        try {
            const ticketsString = JSON.stringify(tickets);
            console.log('保存するデータ:', ticketsString);
            localStorage.setItem(STORAGE_KEY, ticketsString);
            
            // 保存確認
            const savedData = localStorage.getItem(STORAGE_KEY);
            console.log('保存後の確認:', savedData);
            
            if (savedData) {
                console.log('データは正常に保存されました');
            } else {
                console.log('データの保存に問題がありました');
            }
        } catch (error) {
            console.error('データ保存エラー:', error);
            alert('データの保存中にエラーが発生しました');
        }
    }

    // チケット一覧を画面に表示
    function renderTickets() {
        console.log('チケット一覧表示処理開始:', tickets.length + '件');
        ticketsContainer.innerHTML = '';
        
        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '<p class="no-tickets">チケットがありません。「+」ボタンから追加してください。</p>';
            return;
        }
        
        tickets.forEach((ticket) => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';
            
            // 単価計算（NaNになる場合は0を表示）
            const pricePerTicket = ticket.totalCount ? Math.round(ticket.price / ticket.totalCount) : 0;
            
            // 有効期限の表示テキスト
            let expireDateText = '';
            if (ticket.noExpire) {
                expireDateText = '有効期限：なし';
            } else if (ticket.expireDate) {
                expireDateText = `有効期限：${formatDate(ticket.expireDate)}`;
            }
            
            ticketCard.innerHTML = `
                <div class="ticket-info">
                    <div class="store-name">${ticket.storeName}</div>
                    <div class="ticket-count">残り：${ticket.remainingCount}枚</div>
                    <div class="ticket-price">￥${pricePerTicket}/枚</div>
                    ${expireDateText ? `<div class="expire-date">${expireDateText}</div>` : ''}
                </div>
                <div class="card-actions">
                    <button class="edit-btn" data-id="${ticket.id}">編集</button>
                    <button class="use-btn" data-id="${ticket.id}">使用する</button>
                </div>
            `;
            
            ticketsContainer.appendChild(ticketCard);
        });
        
        // 使用ボタンにイベントリスナーを追加
        document.querySelectorAll('.use-btn').forEach(button => {
            button.addEventListener('click', handleUseTicket);
        });
        
        // 編集ボタンにイベントリスナーを追加
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditTicket);
        });
    }

    // 日付のフォーマット（YYYY-MM-DD → YYYY/MM/DD）
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[0]}/${parts[1]}/${parts[2]}`;
        }
        return dateString;
    }

    // チケットを使用する処理
    function handleUseTicket(event) {
        const id = event.target.dataset.id;
        const ticketIndex = tickets.findIndex(ticket => ticket.id.toString() === id);
        
        if (ticketIndex === -1) {
            console.error('チケットが見つかりません:', id);
            return;
        }
        
        if (tickets[ticketIndex].remainingCount > 0) {
            tickets[ticketIndex].remainingCount--;
            saveTicketsToLocalStorage();
            renderTickets();
        } else {
            alert('チケットが残っていません');
        }
    }

    // チケットを編集する処理
    function handleEditTicket(event) {
        const id = event.target.dataset.id;
        const ticket = tickets.find(t => t.id.toString() === id);
        
        if (!ticket) {
            console.error('編集対象のチケットが見つかりません:', id);
            return;
        }
        
        // 編集モードに設定
        isEditMode = true;
        editingTicketId = ticket.id;
        
        // モーダルのタイトルを変更
        modalTitle.textContent = 'チケット編集';
        
        // フォームに値を設定
        editTicketIdInput.value = ticket.id;
        storeNameInput.value = ticket.storeName;
        ticketCountInput.value = ticket.totalCount;
        ticketPriceInput.value = ticket.price;
        
        if (ticket.purchaseDate) {
            purchaseDateInput.value = ticket.purchaseDate;
        } else {
            purchaseDateInput.value = '';
        }
        
        if (ticket.noExpire) {
            noExpireCheckbox.checked = true;
            expireDateInput.value = '';
            expireDateInput.disabled = true;
        } else {
            noExpireCheckbox.checked = false;
            expireDateInput.disabled = false;
            
            if (ticket.expireDate) {
                expireDateInput.value = ticket.expireDate;
            } else {
                expireDateInput.value = '';
            }
        }
        
        // 保存ボタンのテキストを変更
        saveBtn.textContent = '更新する';
        
        // モーダルを表示
        ticketModal.style.display = 'block';
    }

    // 新しいチケットを追加
    function addNewTicket(storeName, totalCount, price, purchaseDate, expireDate, noExpire) {
        console.log('新規チケット追加:', storeName, totalCount, price, purchaseDate, expireDate, noExpire);
        
        const newTicket = {
            id: Date.now(), // ユニークIDとして現在のタイムスタンプを使用
            storeName,
            totalCount: parseInt(totalCount),
            remainingCount: parseInt(totalCount),
            price: parseInt(price),
            purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
            expireDate: noExpire ? null : expireDate,
            noExpire: noExpire
        };
        
        tickets.push(newTicket);
        console.log('チケット追加後の件数:', tickets.length);
        saveTicketsToLocalStorage();
        renderTickets();
    }

    // チケットを更新
    function updateTicket(id, storeName, totalCount, price, purchaseDate, expireDate, noExpire) {
        console.log('チケット更新:', id, storeName, totalCount, price, purchaseDate, expireDate, noExpire);
        
        const index = tickets.findIndex(ticket => ticket.id.toString() === id.toString());
        
        if (index === -1) {
            console.error('更新対象のチケットが見つかりません:', id);
            return false;
        }
        
        const oldTicket = tickets[index];
        const newTotalCount = parseInt(totalCount);
        const remainingRatio = oldTicket.remainingCount / oldTicket.totalCount;
        const newRemainingCount = Math.round(newTotalCount * remainingRatio);
        
        tickets[index] = {
            ...oldTicket,
            storeName,
            totalCount: newTotalCount,
            remainingCount: newRemainingCount,
            price: parseInt(price),
            purchaseDate: purchaseDate || oldTicket.purchaseDate,
            expireDate: noExpire ? null : expireDate,
            noExpire: noExpire
        };
        
        saveTicketsToLocalStorage();
        renderTickets();
        return true;
    }

    // フォームのバリデーション
    function validateForm() {
        const isValid = storeNameInput.value.trim() !== '' && 
                       parseInt(ticketCountInput.value) > 0 && 
                       parseInt(ticketPriceInput.value) > 0;
        
        saveBtn.disabled = !isValid;
        return isValid;
    }

    // ステッパーの値を更新
    function updateStepperValue(increment) {
        let value = parseInt(ticketCountInput.value) || 9; // デフォルト値を9に変更
        value = increment ? value + 1 : Math.max(1, value - 1);
        ticketCountInput.value = value;
        validateForm();
    }

    // イベントリスナーの設定
    function addEventListeners() {
        console.log('イベントリスナー設定');
        
        // 「+」ボタンクリックでモーダルを表示（新規追加モード）
        addTicketBtn.addEventListener('click', () => {
            console.log('プラスボタンがクリックされました');
            // 新規追加モードに設定
            isEditMode = false;
            editingTicketId = null;
            
            // モーダルのタイトルを変更
            modalTitle.textContent = 'チケット登録';
            
            // フォームをリセット
            ticketForm.reset();
            editTicketIdInput.value = '';
            ticketCountInput.value = 9; // デフォルト値を9に変更
            expireDateInput.disabled = false;
            
            // 保存ボタンのテキストを変更
            saveBtn.textContent = '登録する';
            
            validateForm();
            ticketModal.style.display = 'block';
        });
        
        // 期限なしチェックボックスの変更時
        noExpireCheckbox.addEventListener('change', () => {
            expireDateInput.disabled = noExpireCheckbox.checked;
            if (noExpireCheckbox.checked) {
                expireDateInput.value = '';
            }
        });
        
        // キャンセルボタンクリックでモーダルを閉じる
        cancelBtn.addEventListener('click', () => {
            ticketModal.style.display = 'none';
        });
        
        // モーダルの外側をクリックしたらモーダルを閉じる
        window.addEventListener('click', (event) => {
            if (event.target === ticketModal) {
                ticketModal.style.display = 'none';
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
            console.log('フォーム送信');
            
            if (validateForm()) {
                if (isEditMode) {
                    // 編集モード
                    const success = updateTicket(
                        editTicketIdInput.value,
                        storeNameInput.value,
                        ticketCountInput.value,
                        ticketPriceInput.value,
                        purchaseDateInput.value,
                        expireDateInput.value,
                        noExpireCheckbox.checked
                    );
                    
                    if (success) {
                        ticketModal.style.display = 'none';
                    }
                } else {
                    // 新規追加モード
                    addNewTicket(
                        storeNameInput.value,
                        ticketCountInput.value,
                        ticketPriceInput.value,
                        purchaseDateInput.value,
                        expireDateInput.value,
                        noExpireCheckbox.checked
                    );
                    
                    ticketModal.style.display = 'none';
                }
            }
        });
    }

    // アプリの初期化を実行
    initApp();
});