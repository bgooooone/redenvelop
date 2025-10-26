// DOM 元素
const elements = {
    redEnvelope: document.getElementById('red-envelope'),
    createPacketBtn: document.getElementById('create-packet'),
    totalAmountInput: document.getElementById('total-amount'),
    totalPeopleInput: document.getElementById('total-people'),
    resultModal: document.getElementById('result-modal'),
    closeModalBtn: document.getElementById('close-modal'),
    resultAmount: document.querySelector('.result-amount'),
    resultMessage: document.querySelector('.result-message'),
    historyList: document.getElementById('history-list'),
    statistics: document.getElementById('statistics'),
    bestLuckValue: document.querySelector('.stat-item.best .stat-value'),
    worstLuckValue: document.querySelector('.stat-item.worst .stat-value'),
    remainingValue: document.querySelector('.stat-item.remaining .stat-value'),
    coinsContainer: document.getElementById('coins-container'),
    openSound: document.getElementById('open-sound'),
    clickSound: document.getElementById('click-sound'),
    coinSound: document.getElementById('coin-sound'),
    closeSound: document.getElementById('close-sound'),
    bestLuckSound: document.getElementById('best-luck-sound'),
    skinOptions: document.querySelectorAll('.skin-option')
};

// 红包数据
let redPacketData = {
    totalAmount: 0,
    totalPeople: 0,
    remainingPeople: 0,
    amounts: [],
    history: [],
    skin: 'default',
    isCreated: false
};

// 初始化事件监听
function initEvents() {
    // 创建红包按钮
    elements.createPacketBtn.addEventListener('click', createRedPacket);
    
    // 红包点击
    elements.redEnvelope.addEventListener('click', openRedPacket);
    
    // 关闭模态框
    elements.closeModalBtn.addEventListener('click', closeModal);
    
    // 皮肤选择
    elements.skinOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectSkin(option.dataset.skin);
        });
    });
    
    // 自动选择默认皮肤
    selectSkin('default');
    
    // 点击模态框背景关闭
    elements.resultModal.addEventListener('click', (e) => {
        if (e.target === elements.resultModal) {
            closeModal();
        }
    });
}

// 创建红包
function createRedPacket() {
    const totalAmount = parseFloat(elements.totalAmountInput.value);
    const totalPeople = parseInt(elements.totalPeopleInput.value);
    
    // 验证输入
    if (isNaN(totalAmount) || totalAmount <= 0) {
        alert('请输入有效的总金额');
        return;
    }
    
    if (isNaN(totalPeople) || totalPeople <= 0 || totalPeople > 50) {
        alert('请输入有效的红包个数（1-50）');
        return;
    }
    
    // 检查人均金额是否合理（最少0.01元）
    if (totalAmount < totalPeople * 0.01) {
        alert(`总金额需要至少 ${(totalPeople * 0.01).toFixed(2)} 元`);
        return;
    }
    
    // 清空之前的数据
    redPacketData.history = [];
    updateHistory();
    
    // 设置红包数据
    redPacketData.totalAmount = totalAmount;
    redPacketData.totalPeople = totalPeople;
    redPacketData.remainingPeople = totalPeople;
    redPacketData.isCreated = true;
    
    // 生成随机金额数组（抢红包算法）
    redPacketData.amounts = generateRandomAmounts(totalAmount, totalPeople);
    
    // 更新UI
    updateRedPacketDisplay();
    updateStatistics();
    resetRedPacket();
    
    // 播放点击音效
    playSound(elements.clickSound);
}

// 生成随机金额数组（抢红包算法）
function generateRandomAmounts(totalAmount, totalPeople) {
    const amounts = [];
    let remainingAmount = totalAmount;
    let remainingPeople = totalPeople;
    
    // 为每个人生成随机金额，最后一个人拿剩下的
    for (let i = 0; i < totalPeople - 1; i++) {
        // 确保每个人至少能拿到0.01元，最多拿到剩余金额的80%
        const min = 0.01;
        const max = remainingAmount - (remainingPeople - 1) * 0.01;
        const amount = Math.random() * (max * 0.8 - min) + min;
        const roundedAmount = Math.round(amount * 100) / 100;
        
        amounts.push(roundedAmount);
        remainingAmount = Math.round((remainingAmount - roundedAmount) * 100) / 100;
        remainingPeople--;
    }
    
    // 最后一个人拿剩下的所有金额
    amounts.push(remainingAmount);
    
    // 打乱数组顺序
    return shuffleArray(amounts);
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 更新红包显示
function updateRedPacketDisplay() {
    // 显示总金额和剩余数量
    const packetAmount = elements.redEnvelope.querySelector('.packet-amount');
    const packetCount = elements.redEnvelope.querySelector('.packet-count');
    
    packetAmount.textContent = redPacketData.totalAmount.toFixed(2);
    packetCount.textContent = `${redPacketData.remainingPeople}个`;
    
    // 移除未创建状态
    elements.redEnvelope.classList.remove('not-created');
}

// 打开红包
function openRedPacket() {
    // 检查红包是否已创建且还有剩余
    if (!redPacketData.isCreated || redPacketData.remainingPeople <= 0) {
        if (redPacketData.isCreated && redPacketData.remainingPeople <= 0) {
            alert('红包已抢完！');
        }
        return;
    }
    
    // 获取一个随机金额
    const amount = redPacketData.amounts.pop();
    redPacketData.remainingPeople--;
    
    // 记录到历史
    const timestamp = new Date();
    redPacketData.history.push({
        amount,
        time: timestamp
    });
    
    // 更新UI
    updateHistory();
    updateStatistics();
    
    // 播放打开红包音效（在用户点击时立即播放）
    playSound(elements.openSound);
    
    // 额外播放一个清脆的提示音
    setTimeout(() => {
        playSound(elements.coinSound);
    }, 100);
    
    // 执行开红包动画
    const envelopeTop = elements.redEnvelope.querySelector('.envelope-top');
    envelopeTop.style.animation = 'envelope-open 0.8s forwards';
    
    // 显示内部金额
    const luckyMoneyAmount = elements.redEnvelope.querySelector('.lucky-money-amount');
    luckyMoneyAmount.textContent = amount.toFixed(2);
    
    // 创建金币动画
    createCoinAnimation();
    
    // 语音播报金额
    speakAmount(amount);
    
    // 延迟显示结果弹窗
    setTimeout(() => {
        showResult(amount);
    }, 1500);
}

// 创建金币动画
function createCoinAnimation() {
    // 清空之前的金币
    elements.coinsContainer.innerHTML = '';
    
    // 播放金币音效
    playSound(elements.coinSound);
    
    // 创建20个金币
    for (let i = 0; i < 20; i++) {
        createSingleCoin();
    }
}

// 创建单个金币动画
function createSingleCoin() {
    const coin = document.createElement('div');
    coin.classList.add('coin');
    
    // 设置起始位置（红包中心）
    const envelopeRect = elements.redEnvelope.getBoundingClientRect();
    const startX = envelopeRect.left + envelopeRect.width / 2;
    const startY = envelopeRect.top + envelopeRect.height / 2;
    
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;
    
    // 生成随机的终点和中间点
    const endX = Math.random() * window.innerWidth;
    const endY = Math.random() * window.innerHeight;
    const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
    const midY = Math.min(startY - 100 - Math.random() * 200, window.innerHeight * 0.2);
    
    // 设置CSS变量用于动画
    coin.style.setProperty('--mid-x', `${midX - startX}px`);
    coin.style.setProperty('--mid-y', `${midY - startY}px`);
    coin.style.setProperty('--end-x', `${endX - startX}px`);
    coin.style.setProperty('--end-y', `${endY - startY}px`);
    
    // 设置动画持续时间和延迟
    const duration = 1.5 + Math.random() * 1.5;
    const delay = Math.random() * 0.5;
    coin.style.animation = `coin-fly ${duration}s ease-out ${delay}s forwards`;
    
    elements.coinsContainer.appendChild(coin);
    
    // 动画结束后移除金币
    setTimeout(() => {
        coin.remove();
    }, (duration + delay) * 1000);
}

// 语音播报金额
function speakAmount(amount) {
    if ('speechSynthesis' in window) {
        // 计算是否为手气最佳
        const isBestLuck = checkIsBestLuck(amount);
        
        // 根据情况生成不同的播报内容
        let text = '';
        if (isBestLuck) {
            text = `恭喜恭喜，您是手气最佳，抢到了${amount.toFixed(2)}元！`;
        } else {
            text = `恭喜抢到${amount.toFixed(2)}元`;
        }
        
        // 创建语音实例
        const message = new SpeechSynthesisUtterance(text);
        message.lang = 'zh-CN';
        message.rate = 0.9; // 稍微放慢语速，更清晰
        message.pitch = isBestLuck ? 1.4 : 1.2; // 最佳手气时音调更高
        message.volume = 1.0;
        
        // 播放语音
        speechSynthesis.speak(message);
        
        // 如果是手气最佳，播放特殊音效
        if (isBestLuck) {
            setTimeout(() => {
                playSound(elements.bestLuckSound);
            }, 500);
        }
    }
}

// 检查是否为手气最佳
function checkIsBestLuck(amount) {
    // 获取所有已抢金额
    const allAmounts = [...redPacketData.history.map(h => h.amount), ...redPacketData.amounts];
    // 找出最大金额
    const maxAmount = Math.max(...allAmounts);
    // 检查当前金额是否等于最大金额
    return amount === maxAmount;
}

// 显示结果
function showResult(amount) {
    elements.resultAmount.textContent = amount.toFixed(2);
    
    // 根据金额显示不同的提示信息
    let message = '';
    const average = redPacketData.totalAmount / redPacketData.totalPeople;
    
    if (amount >= average * 1.5) {
        message = '哇！运气爆表！';
    } else if (amount >= average) {
        message = '手气不错哦！';
    } else if (amount >= average * 0.7) {
        message = '再接再厉！';
    } else {
        message = '下次一定更好！';
    }
    
    elements.resultMessage.textContent = message;
    elements.resultModal.style.display = 'flex';
}

// 关闭模态框
function closeModal() {
    // 播放关闭音效
    playSound(elements.closeSound);
    
    elements.resultModal.style.display = 'none';
    
    // 重置红包外观，使其恢复到打开前的状态
    resetRedPacket();
    
    // 如果红包抢完了，提示用户
    if (redPacketData.remainingPeople <= 0) {
        setTimeout(() => {
            alert('红包已全部抢完！点击"创建红包"开始新一轮');
        }, 300);
    }
}

// 重置红包外观
function resetRedPacket() {
    const envelopeTop = elements.redEnvelope.querySelector('.envelope-top');
    envelopeTop.style.animation = '';
    
    const luckyMoneyAmount = elements.redEnvelope.querySelector('.lucky-money-amount');
    luckyMoneyAmount.textContent = '0.00';
    
    // 清空金币
    elements.coinsContainer.innerHTML = '';
    
    // 应用选择的皮肤
    applySkin();
}

// 选择红包皮肤
function selectSkin(skin) {
    // 播放点击音效
    playSound(elements.clickSound);
    
    redPacketData.skin = skin;
    
    // 更新选择状态
    elements.skinOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.skin === skin) {
            option.classList.add('selected');
        }
    });
    
    // 如果红包已创建，立即应用皮肤
    if (redPacketData.isCreated) {
        applySkin();
    }
}

// 应用红包皮肤
function applySkin() {
    // 移除所有皮肤类
    elements.redEnvelope.classList.remove('default-skin', 'birthday-skin', 'festival-skin', 'random-skin');
    
    // 如果选择了随机皮肤，随机选择一种
    let skinToApply = redPacketData.skin;
    if (skinToApply === 'random') {
        const skins = ['default-skin', 'birthday-skin', 'festival-skin'];
        skinToApply = skins[Math.floor(Math.random() * skins.length)];
    } else {
        skinToApply += '-skin';
    }
    
    // 添加选中的皮肤类
    elements.redEnvelope.classList.add(skinToApply);
}

// 添加到历史记录
function updateHistory() {
    if (redPacketData.history.length === 0) {
        elements.historyList.innerHTML = '<p class="empty-tip">暂无记录</p>';
        return;
    }
    
    elements.historyList.innerHTML = '';
    
    // 按时间倒序显示
    redPacketData.history.slice().reverse().forEach(record => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        
        const formattedTime = record.time.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        item.innerHTML = `
            <span class="amount">${record.amount.toFixed(2)}</span>
            <span class="time">${formattedTime}</span>
        `;
        
        elements.historyList.appendChild(item);
    });
    
    // 滚动到底部（最新记录）
    elements.historyList.scrollTop = elements.historyList.scrollHeight;
}

// 更新统计信息
function updateStatistics() {
    elements.remainingValue.textContent = redPacketData.remainingPeople;
    
    // 如果有历史记录，计算最佳和最差
    if (redPacketData.history.length > 0) {
        const amounts = redPacketData.history.map(record => record.amount);
        const best = Math.max(...amounts);
        const worst = Math.min(...amounts);
        
        elements.bestLuckValue.textContent = best.toFixed(2);
        elements.worstLuckValue.textContent = worst.toFixed(2);
    } else {
        elements.bestLuckValue.textContent = '--';
        elements.worstLuckValue.textContent = '--';
    }
}

// 播放音效
function playSound(audioElement) {
    if (audioElement) {
        try {
            // 重置播放位置
            audioElement.currentTime = 0;
            // 播放音效
            audioElement.play().then(() => {
                console.log('音效播放成功:', audioElement.id);
            }).catch(error => {
                // 处理用户交互限制和其他错误
                console.log('播放音效失败:', audioElement.id, error);
                
                // 降级方案：创建新的音频实例并播放
                const backupAudio = new Audio(audioElement.src);
                backupAudio.play().catch(err => {
                    console.log('备用播放方案也失败:', err);
                });
            });
        } catch (e) {
            console.log('音效播放错误:', audioElement.id, e);
        }
    }
}

// 初始化应用
function init() {
    initEvents();
    updateStatistics();
    updateHistory();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);