// 请求计算并更新结果框
function requestCalculation() {
    // 假设我们使用 fetch 来请求后端 API 进行计算
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'calculate' })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('请求失败');
        }
    })
    .then(data => {
        // 假设返回的数据为 { result1: 10, result2: 20, result3: 30, result4: 40 }
        document.getElementById('result1').textContent = '价值总和: ' + data.result1;
        document.getElementById('result2').textContent = '物品数量: ' + data.result2;
        document.getElementById('result3').textContent = '类别数量: ' + data.result3;
        document.getElementById('result4').textContent = '位置数量: ' + data.result4;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('请求计算时出错');
    });
}

// 切换不同的 html 来控制核心区域
function loadContent(page) {
    const contentContainer = document.querySelector('.main-content');
    fetch('/load_page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `page=${page}`,  // 传递页面名称给后端
    })
    .then(response => response.text())
    .then(html => {
        // 将后端渲染的内容加载到核心区域
        contentContainer.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading content:', error);
    });
}
