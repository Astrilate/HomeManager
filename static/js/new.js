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

    // 遍历 FormData 将数据保存到 data 对象
    formData.forEach((value, key) => {
        // 如果是文件类型的数据，会以 File 对象的形式存在
        if (value instanceof File) {
            // 对于文件类型，直接将文件对象保留
            data[key] = value;
        } else {
            // 对于普通的文本输入，仍然可以直接存入
            data[key] = value || '';  // 如果字段为空，设置为空字符串
        }
    });

    // 确定 API 路径和请求数据，根据 formType 选择不同的路径和数据结构
    let url = `/submit/${formType}`;

    // 使用 FormData 发送请求
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        },
        body: formData  // 使用 FormData 作为请求体
    })
    .then(response => response.json())
    .then(result => {
        if (result.code == 200 || result.code == 201) {
            // 如果提交成功，弹出提示框
            displayMessage_new(result.message, 'success', formType);
            setTimeout(() => {
                loadContent('new');  // 跳回创建页面
            }, 1000);
        } else {
            // 如果提交失败，显示错误消息
            displayMessage_new(result.message, 'error', formType);
        }
    })
    .catch(error => {
        displayMessage_new('请求失败，请稍后再试', 'error', formType);
        setTimeout(() => {
            loadContent('new');  // 跳回创建页面
        }, 1000);
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

    // 消息显示 1 秒后消失
    setTimeout(() => {
        clearErrorMessage();
    }, 1000);  // 1秒后清除提示信息
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
