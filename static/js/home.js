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

// 记录已经加载的 JS 文件
const loadedScripts = {};

function loadContent(page) {
    const contentContainer = document.querySelector('.main-content');

    fetch('/load_page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `page=${page}`,
    })
    .then(response => response.text())
    .then(html => {
        // 更新核心区域内容
        contentContainer.innerHTML = html;

        // 动态加载并执行 JS 文件（确保不重复加载）
        loadScriptIfNeeded(page);
    })
    .catch(error => {
        console.error('Error loading content:', error);
    });
}

// 动态加载 JS 文件并执行，确保不重复加载
function loadScriptIfNeeded(page) {
    // 如果 JS 文件已经加载过，直接返回
    if (loadedScripts[page]) {
        // console.log(`${page} JS file already loaded.`);
        return;
    }
    // 否则动态加载 JS 文件
    const script = document.createElement('script');
    script.src = `/static/js/${page}.js`;  // 假设每个子页面有对应的 JS 文件
    script.onload = () => {
        // console.log(`${page}.js loaded and executed.`);
        loadedScripts[page] = true;  // 标记此 JS 文件已加载
    };
    script.onerror = () => {
        console.error(`Failed to load ${page}.js`);
    };
    document.body.appendChild(script);  // 将脚本插入到页面中执行
}
