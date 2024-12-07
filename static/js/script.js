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
    formTitleText.textContent = '登录';  // 只修改文本
    submitButton.textContent = '登录';
    toggleLink.textContent = '没有账号？点击这里注册';

    // 移除邮箱字段
    emailContainer.innerHTML = '';  // 清空邮箱字段
    isLogin = true;
}

function switchToRegisterView() {
    formTitleText.textContent = '注册';  // 只修改文本
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
        displayErrorMessage('请输入所有必填字段');
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
    .then(response => response.json())
    .then(handleResponse)
    .catch(handleError);
}

// 响应处理
function handleResponse(data) {
    if (data.success) {
        alert(data.message);
        window.location.href = '/dashboard';  // 跳转到仪表盘
    } else {
        displayErrorMessage(data.message || '发生错误，请稍后重试');
    }
}

// 错误处理
function handleError(error) {
    console.error('Error:', error);
    displayErrorMessage('网络错误，请稍后再试');
}

// 错误消息显示与清除
function displayErrorMessage(message) {
    errorMessage.textContent = message;
}

function clearErrorMessage() {
    errorMessage.textContent = '';
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
