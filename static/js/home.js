// 请求计算并更新结果框
function requestCalculation() {
    fetch('/calculate', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            document.getElementById('result1').textContent = '价值总和: ' + data.data.result1;
            document.getElementById('result2').textContent = '物品数量: ' + data.data.result2;
            document.getElementById('result3').textContent = '类别数量: ' + data.data.result3;
            document.getElementById('result4').textContent = '位置数量: ' + data.data.result4;
        } else {
            alert('计算失败');
        }
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
