// 初始化函数，用来刷新一次页面的信息
function itemInit() {
    let currentField = "";
    getItemInfo();
}

// 获取当前物品信息
function getItemInfo() {
    const itemId = window.currentItemId;
    fetch(`/item-info?item_id=${itemId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            // 成功获取物品信息
            const itemInfo = data.data;
            document.getElementById('picture').src = itemInfo.image_url; // 图片更新
            document.getElementById('name').textContent = itemInfo.name;
            document.getElementById('description').textContent = itemInfo.description;
            document.getElementById('quantity').textContent = itemInfo.quantity;
            document.getElementById('price').textContent = itemInfo.price;
            document.getElementById('category').textContent = itemInfo.category;
            document.getElementById('location').textContent = itemInfo.location;

            // 设置日期字段的值
            document.getElementById('expiry').value = formatDate(itemInfo.expiry) || "";
            document.getElementById('warranty').value = formatDate(itemInfo.warranty) || "";

            // 设置附件的值
            const attachmentField = document.getElementById('attachment');
            if (itemInfo.attachment_url) {
                // 如果附件存在，显示下载按钮
                attachmentField.innerHTML = `<a href="${itemInfo.attachment_url}" target="_blank">下载附件</a>`;
            } else {
                attachmentField.textContent = "无附件";
            }

            document.getElementById('created_at').textContent = itemInfo.created_at;
        } else {
            alert('获取物品信息失败');
        }
    })
    .catch(error => {
        alert('网络错误，请稍后再试');
    });
}

// 日期格式化函数
function formatDate(dateString) {
    if (!dateString) {
        return ''; // 如果日期为None或空，返回空字符串
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 保证月份两位数
    const day = String(date.getDate()).padStart(2, '0'); // 保证日期两位数
    return `${year}-${month}-${day}`;
}

// 触发文件上传框
function triggerPictureUpload() {
    document.getElementById('picture-upload').click();
}

// 预览物品图片
function previewPicture(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("picture").src = e.target.result; // 预览图片
        };
        reader.readAsDataURL(file);
        // 上传图片
        uploadPicture(file);
    }
}

// 上传物品图片
function uploadPicture(file) {
    const formData = new FormData();
    formData.append('picture', file); // 将文件添加到表单数据中
    formData.append('item_id', window.currentItemId);

    // 发送请求到后端
    fetch('/item-update/picture', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            document.getElementById('picture').src = data.data.image_url;
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert("网络错误，请稍后再试");
    });
}

// 处理附件上传
function handleAttachmentUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('attachment', file); // 将文件添加到表单数据中
        formData.append('item_id', window.currentItemId);

        // 发送请求到后端上传附件
        fetch('/item-update/attachment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                displayMessage_item("附件上传成功", "success");
                // 更新附件显示
                const attachmentField = document.getElementById('attachment');
                attachmentField.innerHTML = `<a href="${data.data.attachment_url}" target="_blank">下载附件</a>`;
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            alert("网络错误，请稍后再试");
        });
    }
}

// 编辑字段
function editField(field) {
    currentField = field;
    const inputField = document.getElementById(field);

    if (field === 'attachment') {
        // 如果是附件字段，触发文件选择框
        document.getElementById('attachment-upload').click();
    }
    else if (inputField.type === 'date') {
         // 如果是日期字段，启用日期输入框
        inputField.disabled = false;
        // 修改按钮文本为"保存"
        const button = inputField.nextElementSibling; // 获取按钮
        button.textContent = "保存";
        // 保存按钮点击后，提交数据
        button.onclick = function () {
            const newValue = inputField.value;
            if (newValue) {
                saveChanges();
            }
        };
    }
    else {
        // 其他字段编辑逻辑
        const value = inputField.innerText;
        document.getElementById("edit-value").value = value;
        document.getElementById("edit-modal").style.display = "flex";
    }
}

// 保存修改
function saveChanges() {
    let newValue;

    // 如果是日期字段
    if (currentField === 'expiry' || currentField === 'warranty') {
        newValue = document.getElementById(currentField).value;
        // 恢复按钮为“修改”状态
        const button = document.querySelector(`#${currentField}`).nextElementSibling; // 获取按钮
        button.textContent = "修改";
        button.onclick = function () {
        editField(currentField);
        };
    } else {
        newValue = document.getElementById("edit-value").value;
    }

    // 发送修改请求到后端
    fetch(`/item-update/${currentField}`, {
        method: 'POST', // 使用 POST 请求进行修改
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT 认证
        },
        body: JSON.stringify({
            value: newValue,
            item_id: window.currentItemId
        }) // 发送新值和物品id到后端
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) { // 根据返回的 code 判断是否成功
            displayMessage_item("修改成功", "success");
            setTimeout(() => {
                closeModal();
            }, 1000);

            // 更新显示的值
            if (currentField === 'expiry' || currentField === 'warranty') {
                document.getElementById(currentField).value = newValue;
                document.getElementById(currentField).disabled = true;  // 禁用日期输入框
            } else {
                document.getElementById(currentField).innerText = newValue;
            }
        } else {
            displayMessage_item(data.message, "error");
        }
    })
    .catch(error => {
        displayMessage_item("网络错误，请稍后再试", "error");
    });
}


// 关闭弹窗
function closeModal() {
    document.getElementById("edit-modal").style.display = "none";
}

// 显示消息（成功/失败）
function displayMessage_item(message, type) {
    // 每次显示错误消息时都重新获取 error-message 元素，不能定义为全局变量
    const errorMessage = document.getElementById('error-message-item');
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
        clearErrorMessage();
    }, 1000);  // 1秒后清除提示信息
}

// 清除错误消息
function clearErrorMessage() {
    if(document.getElementById('error-message-item')){
        document.getElementById('error-message-item').textContent = '';
        document.getElementById('error-message-item').classList.remove('success', 'error');
    }
}
