let currentPage = 1;
let totalPages = 1;

// 页面初始化
function categoryInit() {
    fetchCategories(currentPage);
}

// 获取类别列表
function fetchCategories(page) {
    // 显示加载旋转图标
    document.getElementById('loading-spinner').style.display = 'flex';

    fetch(`/category?page=${page}&per_page=12`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`  // 使用 JWT
        }
    })
    .then(response => response.json())
    .then(data => {
        // 隐藏加载旋转图标
        document.getElementById('loading-spinner').style.display = 'none';

        if (data.code === 200) {
            displayCategories(data.data);  // 显示类别数据
            totalPages = data.pages;  // 总页数
            currentPage = data.page;  // 当前页
            updatePagination_category();  // 更新分页信息
        } else {
            alert('无法加载类别数据');
        }
    })
    .catch(error => {
        // 隐藏加载旋转图标
        document.getElementById('loading-spinner').style.display = 'none';
        alert('请求失败，请稍后再试');
    });
}

// 显示类别数据
function displayCategories(categories) {
    const categoriesContainer = document.getElementById('category-container');
    categoriesContainer.innerHTML = '';  // 清空现有内容

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('category-card');
        categoryCard.onclick = function() {
            handleCategoryClick(category.id);  // 触发点击事件，传递类别 ID
        };

        categoryCard.innerHTML = `
            <h4>${category.name}</h4>
        `;
        categoriesContainer.appendChild(categoryCard);
    });
}

// 类别点击事件处理函数
function handleCategoryClick(categoryId) {
    loadContent("search", 0, categoryId, 0);
}

// 分页：上一页
function goToPreviousPage_category() {
    if (currentPage > 1) {
        fetchCategories(currentPage - 1);
    }
}

// 分页：下一页
function goToNextPage_category() {
    if (currentPage < totalPages) {
        fetchCategories(currentPage + 1);
    }
}

// 更新分页信息
function updatePagination_category() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    pageInfo.innerHTML = `第 ${currentPage} 页 / 共 ${totalPages} 页`;

    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}
