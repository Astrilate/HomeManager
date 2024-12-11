// 页面初始化时获取所有位置
function locationInit() {
    let currentPage = 1;  // 当前页
    let totalPages = 1;   // 总页数
    fetchLocations(currentPage);  // 加载位置数据
}

// 获取位置列表
function fetchLocations(page) {
    fetch(`/locations?page=${page}&per_page=12`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}` // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            displayLocations(data.data);  // 显示位置列表
            totalPages = data.pages;  // 获取总页数
            currentPage = data.page;  // 获取当前页
            updatePagination_location();  // 更新分页信息
        } else {
            alert('无法加载位置数据');
        }
    })
    .catch(error => {
        alert('请求失败，请稍后再试');
    });
}

// 显示位置名片
function displayLocations(locations) {
    const locations_cards = document.getElementById('location-cards');  // 获取容器
    locations_cards.innerHTML = '';  // 清空现有内容

    locations.forEach(location => {
        const locationCard = document.createElement('div');
        locationCard.classList.add('location-card');

        // 给名片添加点击事件
        locationCard.onclick = function() {
            handleLocationClick(location.id);  // 触发点击事件，传递位置ID
        };

        locationCard.innerHTML = `
            <img src="${location.image_url}" alt="${location.name}" class="location-image">
            <h4>${location.name}</h4>
        `;
        locations_cards.appendChild(locationCard);
    });
}

// 位置名称点击事件处理函数
function handleLocationClick(locationId) {
    loadContent("search", 0, 0, locationId);
}

// 分页：上一页
function goToPreviousPage_location() {
    if (currentPage > 1) {
        fetchLocations(currentPage - 1);
    }
}

// 分页：下一页
function goToNextPage_location() {
    if (currentPage < totalPages) {
        fetchLocations(currentPage + 1);
    }
}

// 更新分页信息
function updatePagination_location() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (currentPage === 1 && totalPages === 0) {
        pageInfo.innerHTML = `第 ${0} 页 / 共 ${0} 页`;
    } else {
        pageInfo.innerHTML = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    }

    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}
