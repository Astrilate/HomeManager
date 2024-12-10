// DOM 元素缓存
const formContainer = document.getElementById('form-container');
const formTitle = document.getElementById('form-title');
const formTitleText = document.getElementById('form-title-text');
const authForm = document.getElementById('auth-form');
const submitButton = document.getElementById('submit-button');
const toggleLink = document.getElementById('toggle-link');
const errorMessage = document.getElementById('error-message');
const passwordField = document.getElementById('password');
const togglePasswordIcon = document.getElementById('toggle-password');
const emailContainer = document.getElementById('email-container');

let isLogin = true;  // 当前是否为登录模式

// 页面加载完毕后，初始化功能
document.addEventListener('DOMContentLoaded', function() {
    initialize();
});

// 初始化函数，绑定事件
function initialize() {
    toggleLink.addEventListener('click', toggleAuthView);
    authForm.addEventListener('submit', handleFormSubmit);
    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener('click', togglePasswordVisibility);
    }
}

// 视图切换功能：切换登录和注册界面
function toggleAuthView() {
    if (isLogin) {
        switchToRegisterView();
    } else {
        switchToLoginView();
    }
}

// 登录与注册视图切换
function switchToLoginView() {
    formTitleText.textContent = '登录';
    submitButton.textContent = '登录';
    toggleLink.textContent = '没有账号？点击这里注册';

    // 移除邮箱字段
    emailContainer.innerHTML = '';  // 清空邮箱字段
    isLogin = true;
}

function switchToRegisterView() {
    formTitleText.textContent = '注册';
    submitButton.textContent = '注册';
    toggleLink.textContent = '已经有账号？点击这里登录';

    // 动态添加邮箱字段
    emailContainer.innerHTML = `
        <input type="email" id="email" class="input-field" placeholder="邮箱" required>
    `;
    isLogin = false;
}

// 处理表单提交：登录或注册
function handleFormSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = passwordField.value;
    const email = isLogin ? null : document.getElementById('email').value;  // 登录时忽略邮箱字段

    if (!username || !password || (!isLogin && !email)) {
        displayMessage('请输入所有必填字段', 'error');
        return;
    }

    clearErrorMessage();  // 清除任何之前的错误信息

    const url = isLogin ? '/login' : '/register';
    const method = 'POST';
    const data = { username, password, email };

    sendRequest(url, method, data);  // 发送 AJAX 请求
}

// AJAX 请求处理
function sendRequest(url, method, data) {
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(function(response) {  // 进行异步的解析
        response.json()
            .then(function(jsonData) {
                // 将是否成功的信息，和解析后的数据传递给 handleResponse
                handleResponse(response.ok, jsonData);
            })
    })
    .catch(handleError);  // 错误处理
}

// 响应处理
function handleResponse(ok=false, data) {
    if (ok) {
        // 如果是注册成功，显示消息并切换到登录界面
        if (!isLogin) {
            displayMessage('注册成功，请登录', 'success');
            setTimeout(() => {
                isLogin = true  // 切换回登录的状态
                switchToLoginView();  // 1秒后切换到登录界面
                clearErrorMessage();  // 清除消息
            }, 1000);
        }

        // 如果是登录成功，跳转到仪表盘
        if (isLogin) {
            // 存储 JWT 到 localStorage 或 sessionStorage
            localStorage.setItem('jwt', data.access_token);
            displayMessage('登录成功，正在跳转...', 'success');
            setTimeout(() => {
                window.location.href = '/home';
            }, 1000);  // 1秒后跳转
        }
    } else {
        // 显示错误消息
        displayMessage(data.message || '发生错误，请稍后重试', 'error');
    }
}

// 错误处理
function handleError(error) {
    console.error('Error:', error);
    displayMessage('网络错误，请稍后再试', 'error');
}

// 显示消息（成功/失败）
function displayMessage(message, type) {
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
    errorMessage.textContent = '';
    errorMessage.classList.remove('success', 'error');
}

// 密码显示切换
function togglePasswordVisibility() {
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        togglePasswordIcon.classList.remove('fa-eye');
        togglePasswordIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        togglePasswordIcon.classList.remove('fa-eye-slash');
        togglePasswordIcon.classList.add('fa-eye');
    }
}
