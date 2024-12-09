// 显示对应的表单，隐藏其他表单和按钮
function showForm(formType) {
    // 隐藏所有表单
    document.getElementById('item-form').style.display = 'none';
    document.getElementById('category-form').style.display = 'none';
    document.getElementById('location-form').style.display = 'none';

    // 隐藏所有按钮
    let buttons = document.querySelectorAll('.select-button');
    buttons.forEach(button => button.classList.add('hidden'));

    // 显示对应的表单
    document.getElementById(`${formType}-form`).style.display = 'flex';
}

// 表单提交处理
function handleSubmit(event, formType) {
    // 防止默认表单提交行为
    event.preventDefault();

    // 获取表单元素
    const form = document.getElementById(`${formType}-info-form`);

    // 检查表单验证是否通过
    if (!form.checkValidity()) {
        return;  // 如果验证未通过，阻止提交
    }

    // 获取表单数据
    const formData = new FormData(form);

    // 构造请求数据
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // 发送 AJAX 请求
    fetch(`/submit/${formType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`  // 如果需要携带JWT
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // 如果提交成功，弹出提示框
            displayMessage_new('创建成功', 'success', formType);
            setTimeout(() => {
                loadContent('new');  // 跳回创建页面
            }, 2000);
        } else {
            // 如果提交失败，显示错误消息
            displayMessage_new('创建失败，请重试', 'error', formType);
            setTimeout(() => {
                loadContent('new');  // 跳回创建页面
            }, 2000);
        }
    })
    .catch(error => {
        displayMessage_new('请求失败，请稍后再试', 'error', formType);
        setTimeout(() => {
            loadContent('new');  // 跳回创建页面
        }, 2000);
    });
}

// 显示消息（成功/失败）
function displayMessage_new(message, type, formType) {
    // 每次显示错误消息时都重新获取 error-message 元素，不能定义为全局变量
    var errorMessage;
    if (formType == 'item') errorMessage = document.getElementById('error-message1');  // 重新获取 DOM 元素
    else if (formType == 'category') errorMessage = document.getElementById('error-message2');  // 重新获取 DOM 元素
    else if (formType == 'location') errorMessage = document.getElementById('error-message3');  // 重新获取 DOM 元素
    errorMessage.textContent = message;

    // 根据类型选择添加不同的样式
    if (type === 'success') {
        errorMessage.classList.remove('error');  // 清除错误样式
        errorMessage.classList.add('success');   // 添加成功样式
    } else if (type === 'error') {
        errorMessage.classList.remove('success');  // 清除成功样式
        errorMessage.classList.add('error');   // 添加错误样式
    }

    // 消息显示 2 秒后消失
    setTimeout(() => {
        clearErrorMessage();
    }, 2000);  // 2秒后清除提示信息
}

// 清除错误消息
function clearErrorMessage() {
    document.getElementById('error-message1').textContent = '';
    document.getElementById('error-message1').classList.remove('success', 'error');
    document.getElementById('error-message2').textContent = '';
    document.getElementById('error-message2').classList.remove('success', 'error');
    document.getElementById('error-message3').textContent = '';
    document.getElementById('error-message3').classList.remove('success', 'error');
}
