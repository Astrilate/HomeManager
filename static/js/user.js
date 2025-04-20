// 初始化函数，用来刷新一次页面的信息
function userInit() {
    let currentField = "";  // 当前正在编辑的字段
    getUserInfo()  // 获取当前用户的信息
}

// 获取当前用户信息
function getUserInfo() {
    fetch('/user-info', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            // 成功获取用户信息
            const userInfo = data.data;
            document.getElementById('type').textContent = userInfo.type;
            document.getElementById('user_id').textContent = userInfo.id;
            document.getElementById('username').textContent = userInfo.username;
            document.getElementById('password').textContent = "******";
            document.getElementById('email').textContent = userInfo.email;
            document.getElementById('telephone').textContent = userInfo.telephone;
            document.getElementById('description').textContent = userInfo.description;
            document.getElementById('avatar').src = userInfo.image_url; // 获取头像并显示
        } else {
            alert('获取用户信息失败');
        }
    })
    .catch(error => {
        alert('网络错误，请稍后再试');
    });
}

// 触发文件上传框
function triggerAvatarUpload() {
    document.getElementById('avatar-upload').click();
}

// 预览头像
function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("avatar").src = e.target.result; // 预览头像
        };
        reader.readAsDataURL(file);
        // 上传头像
        uploadAvatar(file);
    }
}

// 上传头像
function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file); // 将文件添加到表单数据中

    // 发送请求到后端
    fetch('/user-update/avatar', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            document.getElementById('avatar').src = data.data.image_url;
        } else {
            displayMessage_user(data.message, "error");
        }
    })
    .catch(error => {
        displayMessage_user("网络错误，请稍后再试", "error");
    });
}

// 编辑字段，这些组件 css 的可以公用，但是js的不能共用，某些处理有所不同，比如日期的
function editField_user(field) {
    currentField = field;
    const value = document.getElementById(field).innerText;
    document.getElementById("edit-value").value = value;
    document.getElementById("edit-modal").style.display = "flex";
}

// 保存修改
function saveChanges_user() {
    const newValue = document.getElementById("edit-value").value;
    // 发送修改请求到后端
    fetch(`/user-update/${currentField}`, {
        method: 'POST', // 使用 POST 请求进行修改
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT 认证
        },
        body: JSON.stringify({ value: newValue }) // 发送新值到后端
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) { // 根据返回的 code 判断是否成功
            displayMessage_user("修改成功", "success")
            setTimeout(() => {
                closeModal_user();
            }, 1000);
            if (currentField != "password") document.getElementById(currentField).innerText = newValue;
        } else {
            displayMessage_user(data.message, "error")
        }
    })
    .catch(error => {
        displayMessage_user("网络错误，请稍后再试", "error")
    });
}

// 关闭弹窗
function closeModal_user() {
    document.getElementById("edit-modal").style.display = "none";
}

// 添加两个按钮的点击事件处理函数
function expiredItems() {
    // 跳转到搜索页面
    loadContent("search", 0, 0, 0, 1);
}

function logout() {
    // 清除本地存储的 token，跳转到登录页面
    localStorage.removeItem('jwt');
    window.location.href = '/';
}

// 显示消息（成功/失败）
function displayMessage_user(message, type) {
    // 每次显示错误消息时都重新获取 error-message 元素，不能定义为全局变量
    const errorMessage = document.getElementById('error-message-user');
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
        clearErrorMessage_user();
    }, 1000);  // 1秒后清除提示信息
}

// 清除错误消息
function clearErrorMessage_user() {
    if (document.getElementById('error-message-user')) {
        document.getElementById('error-message-user').textContent = '';
        document.getElementById('error-message-user').classList.remove('success', 'error');
    }
}
