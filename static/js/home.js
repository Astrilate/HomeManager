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
            document.getElementById('result1').textContent = '价值: ' + data.data.result1;
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
// 公用切换页面函数
function loadContent(page, item_id=0, category_id=0, location_id=0, expiry_type=0) {
    const contentContainer = document.querySelector('.main-content');
    window.page = page;  // 记录当前的页面
    window.currentItemId = item_id;  // 任意地方跳转物品详情页的参数：物品id
    window.category_id = category_id;  // 位置页跳转物品搜索页的参数：类别id
    window.location_id = location_id;  // 位置页跳转物品搜索页的参数：位置id
    window.expiry_type = expiry_type;  // 过期物品跳转物品搜索页的 bool 参数
    fetch('/load_page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
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

        // 假设每个页面都有一个初始化函数 `init()`，很重要，因为子页面的js文件无法自己调用DOMContentLoaded
        // 只能能这样手动进行一次初始化，来更新页面的信息
        if (typeof window[page + 'Init'] === 'function') {
            window[page + 'Init']();  // 调用页面对应的初始化函数
        }
        return;
    }
    // 否则动态加载 JS 文件
    const script = document.createElement('script');
    script.src = `/static/js/${page}.js`;  // 假设每个子页面有对应的 JS 文件
    script.onload = () => {
        // console.log(`${page}.js loaded and executed.`);
        loadedScripts[page] = true;  // 标记此 JS 文件已加载

        // 假设每个页面都有一个初始化函数 `init()`
        if (typeof window[page + 'Init'] === 'function') {
            window[page + 'Init']();  // 调用页面对应的初始化函数
        }
    };
    script.onerror = () => {
        console.error(`Failed to load ${page}.js`);
    };
    document.body.appendChild(script);  // 将脚本插入到页面中执行
}
