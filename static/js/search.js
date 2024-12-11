function searchInit() {
    let currentPage = 1;  // 当前页
    let totalPages = 1;   // 总页数
    fetchItems(currentPage);
}

// 获取物品搜索结果
function fetchItems(page) {
    const query = document.getElementById('search-input').value.trim();  // 获取搜索框中的内容
    // 显示加载旋转图标
    document.getElementById('loading-spinner').style.display = 'flex';
    fetch(`/search/items?query=${query}&page=${page}&per_page=12`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        // 隐藏加载旋转图标
        document.getElementById('loading-spinner').style.display = 'none';
        if (data.code === 200) {
            displayItems(data.data);  // 显示搜索结果
            totalPages = data.pages;  // 获取总页数
            currentPage = data.page;  // 获取当前页
            updatePagination_search();  // 更新分页信息
        } else {
            alert('无法加载搜索数据');
        }
    })
    .catch(error => {
        // 隐藏加载旋转图标
        document.getElementById('loading-spinner').style.display = 'none';
        alert('请求失败，请稍后再试');
    });
}


// 显示物品名片
function displayItems(items) {
    const itemsContainer = document.getElementById('item-cards');  // 获取展示区域容器
    itemsContainer.innerHTML = '';  // 清空现有内容
    // 渲染每个物品的名片
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card');
        // 在物品名片上添加点击事件
        itemCard.onclick = function() {
            handleItemClick_search(item.id);  // 触发点击事件，传递物品 ID
        };

        // 判断过期时间是否存在，如果存在则显示，否则显示默认文本
        const expirationText = item.expiry ?
            `过期时间: ${new Date(item.expiry).toLocaleDateString()}` :
            '无过期时间';

        itemCard.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="item-image">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>类别: ${item.category}</p>
                <p>位置: ${item.location}</p>
                <p>${expirationText}</p>  <!-- 显示过期时间 -->
            </div>
        `;
        itemsContainer.appendChild(itemCard);
    });
}

// 物品名称点击事件处理函数，打开对应物品的信息详情页
function handleItemClick_search(itemId) {
    loadContent("item", itemId);
}

// 和new一样的原因，不能直接使用监听，不然指针会指向之前的东西而不是再次回来后的
// 应该让html来onclick触发这里的函数，或者像开头那样直接用window触发一次
// 分页：上一页
function goToPreviousPage_search() {
    if (currentPage > 1) {
        fetchItems(currentPage - 1);  // 加载上一页数据
    }
}
// 分页：下一页
function goToNextPage_search() {
    if (currentPage < totalPages) {
        fetchItems(currentPage + 1);  // 加载下一页数据
    }
}

// 更新分页信息
function updatePagination_search() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // 更新页码显示
    if (currentPage == 1 && totalPages == 0) pageInfo.innerHTML = `第 ${0} 页 / 共 ${0} 页`;
    else pageInfo.innerHTML = `第 ${currentPage} 页 / 共 ${totalPages} 页`;

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

// 打印消息
function displayMessage_search(message, type) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;

    if (type === 'success') {
        errorMessage.classList.remove('error');
        errorMessage.classList.add('success');
    } else if (type === 'error') {
        errorMessage.classList.remove('success');
        errorMessage.classList.add('error');
    }

    // 消息显示 1 秒后消失
    setTimeout(() => {
        clearErrorMessage_search();
    }, 1000);  // 1秒后清除提示信息
}

// 清除错误消息
function clearErrorMessage_search() {
    if(document.getElementById('error-message-search')){
        document.getElementById('error-message-search').textContent = '';
        document.getElementById('error-message-search').classList.remove('success', 'error');
    }
}
