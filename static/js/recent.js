// 初始化函数，用来刷新一次页面的信息
function recentInit() {
    let currentPage = 1;  // 当前页
    let totalPages = 1;   // 总页数
    fetchItemHistory(currentPage);  // 获取当前页的数据
}

// 获取物品修改历史
function fetchItemHistory(page) {
    fetch(`/get/item-history?page=${page}&per_page=10`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            displayItemHistory(data.data);  // 显示物品历史数据
            totalPages = data.pages;        // 获取总页数
            currentPage = data.page;       // 获取当前页
            updatePagination();             // 更新分页信息
        } else {
            displayMessage('无法加载物品修改历史数据', 'error');
        }
    })
    .catch(error => {
        displayMessage('请求失败，请稍后再试', 'error');
    });
}

// 显示物品修改历史
function displayItemHistory(history) {
    const historyList = document.getElementById('item-history-list');
    historyList.innerHTML = ''; // 清空现有内容
    // 如果有数据，遍历并渲染记录
    history.forEach(record => {
        const recordRow = document.createElement('div');
        recordRow.classList.add('item-history-row');
        recordRow.innerHTML = `
            <span>${record.item_name}</span>
            <span>${record.category_name}</span>
            <span>${record.location_name}</span>
            <span>${record.action}</span>
            <span>${record.quantity}</span>
            <span>${new Date(record.changed_at).toLocaleString()}</span>
        `;
        historyList.appendChild(recordRow);
    });
}

// 和new一样的原因，不能直接使用监听，不然指针会指向之前的东西而不是再次回来后的
// 应该让html来onclick触发这里的函数，或者像开头那样直接用window触发一次
// 分页：上一页
function goToPreviousPage() {
    if (currentPage > 1) {
        fetchItemHistory(currentPage - 1);  // 加载上一页数据
    }
}
// 分页：下一页
function goToNextPage() {
    if (currentPage < totalPages) {
        fetchItemHistory(currentPage + 1);  // 加载下一页数据
    }
}

// 更新分页信息
function updatePagination() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // 更新页码显示
    pageInfo.innerHTML = `第 ${currentPage} 页 / 共 ${totalPages} 页`;

    // 更新按钮状态
    if (currentPage <= 1) {
        prevButton.disabled = true;  // 当前页是第一页时，上一页按钮不可用
    } else {
        prevButton.disabled = false;
    }
    if (currentPage >= totalPages) {
        nextButton.disabled = true;  // 当前页是最后一页时，下一页按钮不可用
    } else {
        nextButton.disabled = false;
    }
}

// 显示消息
function displayMessage(message, type) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;

    if (type === 'success') {
        errorMessage.classList.remove('error');
        errorMessage.classList.add('success');
    } else if (type === 'error') {
        errorMessage.classList.remove('success');
        errorMessage.classList.add('error');
    }
}
