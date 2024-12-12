function searchInit() {
    let currentPage = 1;  // 当前页
    let totalPages = 1;   // 总页数
    // 监听该界面下的左键情况，获取的DOM元素一定要是 id，不能是 class
    // 其次，之前说的没错，只要是获取DOM元素就一定要每次初始化，这两句放外面第二次进来的时候就不行了
    // 现在能够实现的情况就是，可以规定仅 search 这个子页面下监听左键是有用的，且还会切换别的页面时不会报错
    // 并且，由于是仅这个页面有效，以任意形式切出去的时候也不需要再禁用这个左键的监听了
    const search_content = document.getElementById('search-content');
    search_content.addEventListener('click', hideContextMenuListener_click);
    // 而滚动又有所不同，试了好多种感觉必须要在window上才可以检测到，普通的 DOM 元素估计不行
    window.addEventListener('scroll', hideContextMenuListener_scroll);
    // 这里需要注意这三个参数在应该是全局变量，而不能是 let，不然下面删除刷新的时候无法获取
    // 放在这里而不放在 fetchItems 里面，确保每次跳转到这个页面的时候初始化，但是在本页面翻页不重复初始化，不然会丢失信息
    Category_id = 0;
    Location_id = 0;
    Expiry_type = 0;  // 这里一定要注意，直接定义的全局变量实际上和用window.定义是一样的，会同名覆盖
    fetchItems(currentPage);
}

// 获取物品搜索结果
function fetchItems(page) {
    document.getElementById('search-box').style.display = 'flex';
    // 使用过后即可归零，保持始终最多只有一个是非零的情况
    if (window.category_id != 0) {
        Category_id = window.category_id;
        window.category_id = 0;
        document.getElementById('search-box').style.display = 'none';
    }
    if (window.location_id != 0) {
        Location_id = window.location_id;
        window.location_id = 0;
        document.getElementById('search-box').style.display = 'none';
    }
    if (window.expiry_type != 0) {
        Expiry_type = window.expiry_type;
        window.expiry_type = 0;
        document.getElementById('search-box').style.display = 'none';
    }
    if (Category_id === 0 && Location_id === 0 && Expiry_type === 0) {
        // 仅有出现搜索框的情况下，才需要监听回车键，不过也是奇怪，在这里就变成了光标在输入框的时候
        // 才能触发回车监听，虽然歪打正着避免了没输文字时误触回车导致无效刷新，但是前面对左键点击的
        // 监听明明是可以在整个核心区域下的，搞不懂是怎么回事，换成 container 也不行
        const search_content = document.getElementById('search-content');
        search_content.addEventListener('keydown', handleEnterKey);
    }
    else {
        document.getElementById('search-box').style.display = 'none';
    }
    const query = document.getElementById('search-input').value.trim();  // 获取搜索框中的内容
    // 显示加载旋转图标
    document.getElementById('loading-spinner').style.display = 'flex';
    // 隐藏没有找到相关物品的提示信息
    document.getElementById('no-results-message').style.display = 'none';
    fetch(`/search/items?category_id=${Category_id}&location_id=${Location_id}&expiry_type=${Expiry_type}&query=${query}&page=${page}&per_page=12`, {
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
            if (data.data.length === 0) {
                // 没有找到任何物品
                document.getElementById('no-results-message').style.display = 'block';
            }
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

        // 在物品名片上添加左键点击触发的函数
        itemCard.onclick = function() {
            handleItemClick(item.id); // 触发点击事件，传递物品 ID
        };
        // 在物品名片上添加监听右键点击的事件，这个和左点击不一样不能放在一起
        itemCard.addEventListener('contextmenu', (event) => {
            event.preventDefault();  // 阻止浏览器默认的右键菜单
            // 使用 event.clientX 和 Y 直接获取光标目前相对于屏幕视口的坐标位置
            handleItemRightClick(item.id, event.clientX, event.clientY);
        });

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

// 回车处理函数，确保回车键的监听仅在搜索页面具有搜索栏时生效
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        fetchItems(1);
    }
}

// 左键打开对应物品的信息详情页
function handleItemClick(itemId) {
    loadContent("item", itemId, 0, 0, 0);
}

// 右键点击时，显示菜单
function handleItemRightClick(itemId, mouseX, mouseY) {
    const contextMenu = document.getElementById('context-menu');  // 获取菜单容器
    // 设置菜单的位置
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.top = `${mouseY}px`;
    // 显示菜单
    contextMenu.style.display = 'block';

    // 绑定菜单项的点击事件，触发具体函数，并确保菜单被隐藏
    document.getElementById('menu-detail').onclick = function() {
        document.getElementById('context-menu').style.display = 'none';  // 隐藏菜单
        handleItemClick(itemId);  // 触发查看详情
    };
    document.getElementById('menu-delete').onclick = function() {
        document.getElementById('context-menu').style.display = 'none';  // 隐藏菜单
        deleteItem(itemId);  // 直接删除
    };
}

// 左键点击监听器
function hideContextMenuListener_click(event) {
    // 当左键位置既不在名片上，也不在菜单上的时候，隐藏菜单
    if (!event.target.closest('.context-menu') && !event.target.closest('.item-card')) {
        document.getElementById('context-menu').style.display = 'none';
    }
}

// 只要检测到滚动就直接隐藏菜单
function hideContextMenuListener_scroll(event) {
    // 如果是搜索页面再来检测
    if (window.page == 'search') {
        if (document.getElementById('context-menu').style.display === 'block') {
        document.getElementById('context-menu').style.display = 'none'; // 隐藏菜单
        }
    }
}

// 发送确认删除的请求
function deleteItem(itemId) {
    // 发送删除请求
    fetch(`/delete/item?item_id=${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 204) {
            // 重新加载当前页面，这里不要直接用 fetchItems，最好刷新后展示的页面还能保持
            // 有搜索栏 / 某类别 / 某位置 / 回收站的情况
            // 这里需要注意这三个参数在上面定义时应该是全局变量，而不能是 let，不然这里无法获取
            loadContent('search', 0, Category_id, Location_id, expiry_type);
        } else {
            alert('删除失败');
        }
    })
    .catch(error => {
        alert('请求失败，请稍后再试');
    });
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
