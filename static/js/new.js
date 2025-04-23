// 初始化函数，进行事件监听
function newInit() {
    // 获取类别输入框和下拉菜单元素
    const categoryInput = document.getElementById('item-category');
    const categoryDropdown = document.getElementById('category-dropdown');
    // 位置输入框功能
    const locationInput = document.getElementById('item-location');
    const locationDropdown = document.getElementById('location-dropdown');

    // 为类别输入框添加focus事件监听器
    if (categoryInput) {
        categoryInput.addEventListener('focus', function() {
            // 显示下拉菜单
            categoryDropdown.style.display = 'block';
            // 如果下拉菜单为空，则获取类别数据并填充
            if (categoryDropdown.children.length === 0) {
                fetchCategoriesAndPopulateDropdown();
            }
        });
    }
    if (locationInput) {
        locationInput.addEventListener('focus', function() {
            locationDropdown.style.display = 'block';
            if (locationDropdown.children.length === 0) {
                fetchLocationsAndPopulateDropdown();
            }
        });
    }

    // 点击页面其他地方时隐藏下拉菜单
    document.addEventListener('click', function(event) {
        // 检查点击的目标是否不是输入框且不是下拉菜单中的项
        if (
            event.target !== categoryInput &&
            !(categoryDropdown.contains(event.target) && event.target.classList.contains('dropdown-item'))
        ) {
            categoryDropdown.style.display = 'none';
        }
        // 检查点击的目标是否不是位置输入框且不是位置下拉菜单中的项
        if (
            event.target !== locationInput &&
            !(locationDropdown.contains(event.target) && event.target.classList.contains('dropdown-item'))
        ) {
            locationDropdown.style.display = 'none';
        }
    });
}

// 获取类别数据并填充下拉菜单
function fetchCategoriesAndPopulateDropdown() {
    const categoryDropdown = document.getElementById('category-dropdown');
    categoryDropdown.innerHTML = ''; // 清空现有内容

    fetch('/menu/category', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            const categories = data.data;
            categories.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('dropdown-item');
                categoryItem.textContent = category;
                categoryItem.addEventListener('click', () => {
                    document.getElementById('item-category').value = category;
                    categoryDropdown.style.display = 'none';
                });
                categoryDropdown.appendChild(categoryItem);
            });
        } else {
            console.error('获取类别失败:', data.message);
        }
    })
    .catch(error => {
        console.error('获取类别失败:', error);
    });
}

// 获取位置数据并填充下拉菜单
function fetchLocationsAndPopulateDropdown() {
    const locationDropdown = document.getElementById('location-dropdown');
    locationDropdown.innerHTML = ''; // 清空现有内容

    fetch('/menu/location', { // 假设后端有获取位置的接口
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            const locations = data.data;
            locations.forEach(location => {
                const locationItem = document.createElement('div');
                locationItem.classList.add('dropdown-item');
                locationItem.textContent = location;
                locationItem.addEventListener('click', () => {
                    document.getElementById('item-location').value = location;
                    locationDropdown.style.display = 'none';
                });
                locationDropdown.appendChild(locationItem);
            });
        } else {
            console.error('获取位置失败:', data.message);
        }
    })
    .catch(error => {
        console.error('获取位置失败:', error);
    });
}

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
                loadContent('new', 0, 0, 0);  // 跳回创建页面
            }, 1000);
        } else {
            // 如果提交失败，显示错误消息
            displayMessage_new(result.message, 'error', formType);
        }
    })
    .catch(error => {
        displayMessage_new('请求失败，请稍后再试', 'error', formType);
        setTimeout(() => {
            loadContent('new', 0, 0, 0);  // 跳回创建页面
        }, 1000);
    });
}

// 显示消息（成功/失败）
function displayMessage_new(message, type, formType) {
    // 每次显示错误消息时都重新获取 error-message 元素，不能定义为全局变量，这里是因为害怕指向的是
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
