// 页面初始化时获取所有位置
function locationInit() {
    let currentPage = 1;  // 当前页
    let totalPages = 1;   // 总页数
    const location_content = document.getElementById('location-content');
    location_content.addEventListener('click', hideContextMenuListener_click_location);
    window.addEventListener('scroll', hideContextMenuListener_scroll_location);
    fetchLocations(currentPage);  // 加载位置数据
}

// 获取位置列表
function fetchLocations(page) {
    // 隐藏没有找到相关物品的提示信息
    document.getElementById('no-results-message').style.display = 'none';
    fetch(`/locations?page=${page}&per_page=12`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            if (data.data.length === 0) {
                // 没有找到任何物品
                document.getElementById('no-results-message').style.display = 'block';
            }
            displayLocations(data.data);  // 显示位置列表
            totalPages = data.pages;  // 获取总页数
            currentPage = data.page;  // 获取当前页
            updatePagination_location();  // 更新分页信息
        } else {
            alert('无法加载位置数据');
        }
    })
    .catch(error => {
        alert('请求失败，请稍后再试');
    });
}

// 显示位置名片
function displayLocations(locations) {
    const locations_cards = document.getElementById('location-cards');  // 获取容器
    locations_cards.innerHTML = '';  // 清空现有内容

    locations.forEach(location => {
        const locationCard = document.createElement('div');
        locationCard.classList.add('location-card');

        // 在位置名片上添加左键点击触发的函数
        locationCard.onclick = function() {
            handleLocationClick(location.id); // 触发点击事件，传递位置 ID
        };
        // 在位置名片上添加监听右键点击的事件，这个和左点击不一样不能放在一起
        locationCard.addEventListener('contextmenu', (event) => {
            event.preventDefault();  // 阻止浏览器默认的右键菜单
            // 使用 event.clientX 和 Y 直接获取光标目前相对于屏幕视口的坐标位置
            handleLocationRightClick(location.id, event.clientX, event.clientY);
        });

        locationCard.innerHTML = `
            <img src="${location.image_url}" alt="${location.name}" class="location-image">
            <h4>${location.name}</h4>
        `;
        locations_cards.appendChild(locationCard);
    });
}

// 类别点击事件处理函数
function handleLocationClick(locationId) {
    loadContent("search", 0, 0, locationId, 0);
}

// 右键点击时，显示菜单
function handleLocationRightClick(locationId, mouseX, mouseY) {
    currentId = locationId;
    const contextMenu = document.getElementById('context-menu_location');  // 获取菜单容器
    // 设置菜单的位置
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.top = `${mouseY}px`;
    // 显示菜单
    contextMenu.style.display = 'block';

    // 绑定菜单项的点击事件，触发具体函数，并确保菜单被隐藏
    document.getElementById('menu-detail_location').onclick = function() {
        document.getElementById('context-menu_location').style.display = 'none';  // 隐藏菜单
        handleLocationClick(locationId);  // 触发查看详情
    };
    document.getElementById('menu-update_image_location').onclick = function() {
        document.getElementById('context-menu_location').style.display = 'none';  // 隐藏菜单
        document.getElementById('fileInput_location').click();  // 触发文件选择框
    };
    document.getElementById('menu-update_name_location').onclick = function() {
        document.getElementById('context-menu_location').style.display = 'none';  // 隐藏菜单
        editField_location(locationId, 'name');  // 修改名称
    };
    document.getElementById('menu-update_description_location').onclick = function() {
        document.getElementById('context-menu_location').style.display = 'none';  // 隐藏菜单
        editField_location(locationId, 'description');  // 修改描述
    };
    document.getElementById('menu-delete_location').onclick = function() {
        document.getElementById('context-menu_location').style.display = 'none';  // 隐藏菜单
        deleteLocation(locationId);  // 直接删除
    };
}

// 左键点击监听器
function hideContextMenuListener_click_location(event) {
    // 当左键位置既不在名片上，也不在菜单上的时候，隐藏菜单
    if (!event.target.closest('.context-menu_location') && !event.target.closest('.location-card')) {
        document.getElementById('context-menu_location').style.display = 'none';
    }
}

// 只要检测到滚动就直接隐藏菜单
function hideContextMenuListener_scroll_location(event) {
    if (window.page == 'location') {
        if (document.getElementById('context-menu_location').style.display === 'block') {
        document.getElementById('context-menu_location').style.display = 'none'; // 隐藏菜单
        }
    }
}

// 在文件选择框中选好图片按下确认键后触发此函数
function previewPicture_location(event) {
    const file = event.target.files[0];
    if (file) {
        uploadPicture_location(file);  // 如果有选择图片的话，就上传图片，不需要进行展示和预览
    }
}

// 上传位置图片
function uploadPicture_location(file) {
    const formData = new FormData();
    formData.append('picture', file); // 将文件添加到表单数据中
    formData.append('location_id', currentId); // 以及位置 id

    // 发送请求到后端
    fetch('/location-update/picture', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            fetchLocations(currentPage);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert("网络错误，请稍后再试");
    });
}

// 打开弹窗并获取里面的内容
function editField_location(locationId, field) {
    currentField = field;
    currentId = locationId;
    // 获取当前类别的信息
    fetch(`/location-info?location_id=${currentId}`, {
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
function saveChanges_location() {
    // 获取文本框中输入的内容
    const newValue = document.getElementById("edit-value").value;
    // 发送修改请求到后端
    fetch(`/location-update/${currentField}`, {
        method: 'POST', // 使用 POST 请求进行修改
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT 认证
        },
        body: JSON.stringify({
            value: newValue,
            location_id: currentId
        }) // 发送新值和位置id到后端
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) { // 根据返回的 code 判断是否成功
            displayMessage_location("修改成功", "success");
            setTimeout(() => {
                closeModal_location();  // 关闭弹窗
                fetchLocations(currentPage);  // 重新加载当前页面
            }, 1000);

        } else {
            displayMessage_location(data.message, "error");
        }
    })
    .catch(error => {
        displayMessage_location("网络错误，请稍后再试", "error");
    });
}

// 关闭弹窗
function closeModal_location() {
    document.getElementById("edit-modal").style.display = "none";
}

// 发送确认删除的请求
function deleteLocation(locationId) {
    // 发送删除请求
    fetch(`/delete/location?location_id=${locationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 204) {
            // 重新加载当前页面
            fetchLocations(currentPage);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert('请求失败，请稍后再试');
    });
}

// 分页：上一页
function goToPreviousPage_location() {
    if (currentPage > 1) {
        fetchLocations(currentPage - 1);
    }
}

// 分页：下一页
function goToNextPage_location() {
    if (currentPage < totalPages) {
        fetchLocations(currentPage + 1);
    }
}

// 更新分页信息
function updatePagination_location() {
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
function displayMessage_location(message, type) {
    // 每次显示错误消息时都重新获取 error-message 元素，不能定义为全局变量
    const errorMessage = document.getElementById('error-message-location');
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
        clearErrorMessage_location();
    }, 1000);  // 1秒后清除提示信息
}

// 清除错误消息
function clearErrorMessage_location() {
    if (document.getElementById('error-message-location')) {
        document.getElementById('error-message-location').textContent = '';
        document.getElementById('error-message-location').classList.remove('success', 'error');
    }
}
