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
    
    // イベントリスナーを追加
    document.querySelectorAll('.use-btn').forEach(button => {
        button.addEventListener('click', handleUseTicket);
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditTicket);
    });
}