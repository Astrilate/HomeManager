function categoryInit() {
    let currentPage = 1;
    let totalPages = 1;
    const category_content = document.getElementById('category-content');
    category_content.addEventListener('click', hideContextMenuListener_click_category);
    window.addEventListener('scroll', hideContextMenuListener_scroll_category);
    fetchCategories(currentPage);
}

// 获取类别列表
function fetchCategories(page) {
    // 隐藏没有找到相关物品的提示信息
    document.getElementById('no-results-message').style.display = 'none';
    fetch(`/category?page=${page}&per_page=12`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`  // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            if (data.data.length === 0) {
                // 没有找到任何物品
                document.getElementById('no-results-message').style.display = 'block';
            }
            displayCategories(data.data);  // 显示类别数据
            totalPages = data.pages;  // 总页数
            currentPage = data.page;  // 当前页
            updatePagination_category();  // 更新分页信息
        } else {
            alert('无法加载类别数据');
        }
    })
    .catch(error => {
        alert('请求失败，请稍后再试');
    });
}

// 显示类别数据
function displayCategories(categories) {
    const categories_cards = document.getElementById('category-cards');
    categories_cards.innerHTML = '';  // 清空现有内容

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('category-card');

        // 在类别名片上添加左键点击触发的函数
        categoryCard.onclick = function() {
            handleCategoryClick(category.id); // 触发点击事件，传递类别 ID
        };
        // 在类别名片上添加监听右键点击的事件，这个和左点击不一样不能放在一起
        categoryCard.addEventListener('contextmenu', (event) => {
            event.preventDefault();  // 阻止浏览器默认的右键菜单
            // 使用 event.clientX 和 Y 直接获取光标目前相对于屏幕视口的坐标位置
            handleCategoryRightClick(category.id, event.clientX, event.clientY);
        });

        // 创建图标元素
        const iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-tag');  // 使用 Font Awesome 的标签图标

        // 创建标题元素
        const titleElement = document.createElement('h4');
        titleElement.innerHTML = '';  // 清空默认内容
        titleElement.appendChild(iconElement);  // 将图标插入到标题中
        titleElement.innerHTML += ` ${category.name}`;  // 添加类别名称

        categoryCard.appendChild(titleElement);  // 将标题添加到卡片中
        categories_cards.appendChild(categoryCard);  // 将卡片添加到卡片容器
    });
}

// 类别点击事件处理函数
function handleCategoryClick(categoryId) {
    loadContent("search", 0, categoryId, 0, 0);
}

// 右键点击时，显示菜单
function handleCategoryRightClick(categoryId, mouseX, mouseY) {
    const contextMenu = document.getElementById('context-menu_category');  // 获取菜单容器
    // 设置菜单的位置
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.top = `${mouseY}px`;
    // 显示菜单
    contextMenu.style.display = 'block';

    // 绑定菜单项的点击事件，触发具体函数，并确保菜单被隐藏
    document.getElementById('menu-detail_category').onclick = function() {
        document.getElementById('context-menu_category').style.display = 'none';  // 隐藏菜单
        handleCategoryClick(categoryId);  // 触发查看详情
    };
    document.getElementById('menu-update_name_category').onclick = function() {
        document.getElementById('context-menu_category').style.display = 'none';  // 隐藏菜单
        editField_category(categoryId, 'name');  // 修改名称
    };
    document.getElementById('menu-update_description_category').onclick = function() {
        document.getElementById('context-menu_category').style.display = 'none';  // 隐藏菜单
        editField_category(categoryId, 'description');  // 修改描述
    };
    document.getElementById('menu-delete_category').onclick = function() {
        document.getElementById('context-menu_category').style.display = 'none';  // 隐藏菜单
        deleteCategory(categoryId);  // 直接删除
    };
}

// 左键点击监听器
function hideContextMenuListener_click_category(event) {
    // 当左键位置既不在名片上，也不在菜单上的时候，隐藏菜单
    if (!event.target.closest('.context-menu_category') && !event.target.closest('.category-card')) {
        document.getElementById('context-menu_category').style.display = 'none';
    }
}

// 只要检测到滚动就直接隐藏菜单
function hideContextMenuListener_scroll_category(event) {
    if (window.page == 'category') {
        if (document.getElementById('context-menu_category').style.display === 'block') {
        document.getElementById('context-menu_category').style.display = 'none'; // 隐藏菜单
        }
    }
}

// 打开弹窗并获取里面的内容
function editField_category(categoryId, field) {
    currentField = field;
    currentId = categoryId;
    // 获取当前类别的信息
    fetch(`/category-info?category_id=${currentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            // 将内容填充至弹窗的文本框中
            if (currentField == 'name') {
                document.getElementById("edit-value").value = data.data.name;
            }
            else {
                document.getElementById("edit-value").value = data.data.description;
            }
            document.getElementById("edit-modal").style.display = "flex";  // 打开弹窗
        } else {
            alert('获取类别信息失败');
        }
    })
    .catch(error => {
        alert('网络错误，请稍后再试');
    });
}

// 发送修改请求
function saveChanges_category() {
    // 获取文本框中输入的内容
    const newValue = document.getElementById("edit-value").value;
    // 发送修改请求到后端
    fetch(`/category-update/${currentField}`, {
        method: 'POST', // 使用 POST 请求进行修改
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT 认证
        },
        body: JSON.stringify({
            value: newValue,
            category_id: currentId
        }) // 发送新值和类别id到后端
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) { // 根据返回的 code 判断是否成功
            displayMessage_category("修改成功", "success");
            setTimeout(() => {
                closeModal_category();  // 关闭弹窗
                fetchCategories(currentPage);  // 重新加载当前页面
            }, 1000);

        } else {
            displayMessage_category(data.message, "error");
        }
    })
    .catch(error => {
        displayMessage_category("网络错误，请稍后再试", "error");
    });
}

// 关闭弹窗
function closeModal_category() {
    document.getElementById("edit-modal").style.display = "none";
}

// 发送确认删除的请求
function deleteCategory(categoryId) {
    // 发送删除请求
    fetch(`/delete/category?category_id=${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 204) {
            // 重新加载当前页面
            fetchCategories(currentPage);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert('请求失败，请稍后再试');
    });
}

// 分页：上一页
function goToPreviousPage_category() {
    if (currentPage > 1) {
        fetchCategories(currentPage - 1);
    }
}

// 分页：下一页
function goToNextPage_category() {
    if (currentPage < totalPages) {
        fetchCategories(currentPage + 1);
    }
}

// 更新分页信息
function updatePagination_category() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (currentPage === 1 && totalPages === 0) {
        pageInfo.innerHTML = `第 ${0} 页 / 共 ${0} 页`;
    } else {
        pageInfo.innerHTML = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    }

    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}


// 显示消息（成功/失败）
function displayMessage_category(message, type) {
    // 每次显示错误消息时都重新获取 error-message 元素，不能定义为全局变量
    const errorMessage = document.getElementById('error-message-category');
    errorMessage.textContent = message;

    // 根据类型选择添加不同的样式
    if (type === 'success') {
        errorMessage.classList.remove('error');  // 清除错误样式
        errorMessage.classList.add('success');   // 添加成功样式
    } else if (type === 'error') {
        errorMessage.classList.remove('success');  // 清除成功样式
        errorMessage.classList.add('error');   // 添加错误样式
    }

    // 消息显示 1 秒后消失
    setTimeout(() => {
        clearErrorMessage_category();
    }, 1000);  // 1秒后清除提示信息
}

// 清除错误消息
function clearErrorMessage_category() {
    if (document.getElementById('error-message-category')) {
        document.getElementById('error-message-category').textContent = '';
        document.getElementById('error-message-category').classList.remove('success', 'error');
    }
}
