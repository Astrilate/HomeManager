import os
from datetime import datetime

from flask import render_template, jsonify, request
from sqlalchemy import func

from config import UPLOAD_FOLDER_IMAGES, UPLOAD_FOLDER_ATTACHMENTS
from models import db, Item, Category, Location, ItemHistory
from . import main
from .utils import token_required, allowed_image_file, allowed_attachment_file


# 启动测试
@main.route('/')
def hello():
    return "hello"


# 载入首页
@main.route('/home')
def home():
    return render_template('home.html')


# 切换页面
@main.route('/load_page', methods=['POST'])
@token_required
def load_page(token):
    page = request.form.get('page')  # 获取前端传来的页面信息
    return render_template(f'{page}.html')  # 渲染对应的页面


# 信息统计
@main.route('/calculate', methods=['GET'])
@token_required
def calculate(token):
    user_id = token['user_id']
    # 计算物品的总价值
    total_value = db.session.query(func.sum(Item.quantity * Item.price)).filter(Item.user_id == user_id).scalar() or 0
    # 计算物品总数
    total_items = db.session.query(func.count(Item.id)).filter(Item.user_id == user_id).scalar() or 0
    # 计算类别总数
    total_categories = db.session.query(func.count(Category.id)).filter(Category.user_id == user_id).scalar() or 0
    # 计算位置总数
    total_locations = db.session.query(func.count(Location.id)).filter(Location.user_id == user_id).scalar() or 0
    # 返回计算结果
    result = {
        'result1': round(total_value, 1),  # 为了好显示，最好不要超过999.9
        'result2': total_items,
        'result3': total_categories,
        'result4': total_locations
    }
    return jsonify({'message': 'success', 'data': result, 'code': 200})


# 物品创建
@main.route('/submit/item', methods=['POST'])
@token_required
def submit_item(token):
    user_id = token['user_id']
    # 获取form-data表单数据
    item_name = request.form.get('item-name')
    item_description = request.form.get('item-description')
    item_quantity = request.form.get('item-quantity')
    item_price = request.form.get('item-price')
    item_category = request.form.get('item-category')
    item_location = request.form.get('item-location')
    item_expiry = request.form.get('item-expiry')
    item_warranty = request.form.get('item-warranty')
    item_image = request.files.get('item-image')  # 图片
    item_attachment = request.files.get('item-attachment')  # 附件

    # 检查物品是否已存在
    existing_item = Item.query.filter_by(user_id=user_id, name=item_name).first()
    if existing_item:
        return jsonify({'message': '物品已存在', 'code': 400})
    # 查找物品的分类和位置，如果没有则报错
    category = Category.query.filter_by(user_id=user_id, name=item_category).first()
    if not category:
        return jsonify({'message': '没有这个类别，请先创建', 'code': 400})
    location = Location.query.filter_by(user_id=user_id, name=item_location).first()
    if not location:
        return jsonify({'message': '没有这个位置，请先创建', 'code': 400})

    # 保存上传的图片和附件
    item_image_filename = None
    if item_image and allowed_image_file(item_image.filename):
        file_extension = os.path.splitext(item_image.filename)[1]  # 提取扩展名
        # 确保 item_name 编码为 UTF-8 字符串，能在下面的格式化字符串中显示
        encoded_item_name = item_name.encode('utf-8').decode('utf-8')
        item_image_filename = f"{user_id}_item_{encoded_item_name}{file_extension}"  # 用户ID_物品_物品名称，避免重复覆盖
        item_image_filename = UPLOAD_FOLDER_IMAGES + item_image_filename
        item_image.save(item_image_filename)
    elif item_image:
        return jsonify({'message': '图片格式有误', 'code': 400})
    item_attachment_filename = None
    if item_attachment and allowed_attachment_file(item_attachment.filename):
        file_extension = os.path.splitext(item_attachment.filename)[1]  # 提取扩展名
        encoded_item_name = item_name.encode('utf-8').decode('utf-8')
        item_attachment_filename = f"{user_id}_item_{encoded_item_name}{file_extension}"  # 用户ID_物品_物品名称
        item_attachment_filename = UPLOAD_FOLDER_ATTACHMENTS + item_attachment_filename
        item_attachment.save(item_attachment_filename)
    elif item_attachment:
        return jsonify({'message': '附件格式有误', 'code': 400})

    # 创建物品记录
    item = Item(
        name=item_name,
        description=item_description,
        quantity=int(item_quantity),
        price=float(item_price),
        category_id=category.id,
        location_id=location.id,
        user_id=user_id,
        expiry=item_expiry,
        warranty=item_warranty,
        image_url=item_image_filename,
        attachment_url=item_attachment_filename,
        created_at=datetime.now()
    )
    db.session.add(item)
    db.session.commit()

    # 创建物品修改历史记录，特地放在创建物品commit之后，就能获取到item的id
    item_history = ItemHistory(
        user_id=user_id,
        item_id=item.id,
        action_type="创建",
        action=f"创建了这个物品",
        changed_at=datetime.now()
    )
    db.session.add(item_history)
    db.session.commit()
    return jsonify({'message': '物品创建成功', 'item_id': item.id, 'code': 201})


# 类别创建
@main.route('/submit/category', methods=['POST'])
@token_required
def submit_category(token):
    user_id = token['user_id']
    # 获取 form-data 表单数据
    category_name = request.form.get('category-name')
    category_description = request.form.get('category-description')

    # 检查类别是否已存在
    existing_category = Category.query.filter_by(user_id=user_id, name=category_name).first()
    if existing_category:
        return jsonify({'message': '类别已存在', 'code': 400})

    # 创建类别记录
    category = Category(
        name=category_name,
        description=category_description,
        user_id=user_id,
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({'message': '类别创建成功', 'code': 201})


# 位置创建
@main.route('/submit/location', methods=['POST'])
@token_required
def submit_location(token):
    user_id = token['user_id']
    # 获取 form-data 表单数据
    location_name = request.form.get('location-name')
    location_description = request.form.get('location-description')
    location_image = request.files.get('location-image')  # 图片

    # 检查位置是否已存在
    existing_location = Location.query.filter_by(user_id=user_id, name=location_name).first()
    if existing_location:
        return jsonify({'message': '位置已存在', 'code': 400})

    # 保存上传的图片
    location_image_filename = None
    if location_image and allowed_image_file(location_image.filename):
        file_extension = os.path.splitext(location_image.filename)[1]  # 提取扩展名
        encoded_location_name = location_name.encode('utf-8').decode('utf-8')
        location_image_filename = f"{user_id}_location_{encoded_location_name}{file_extension}"  # 用户ID_位置_位置名称
        location_image_filename = UPLOAD_FOLDER_IMAGES + location_image_filename
        location_image.save(location_image_filename)
    elif location_image:
        return jsonify({'message': '图片格式有误', 'code': 400})

    # 创建位置记录
    location = Location(
        name=location_name,
        description=location_description,
        image_url=location_image_filename,
        user_id=user_id,
    )
    db.session.add(location)
    db.session.commit()

    return jsonify({'message': '位置创建成功', 'code': 201})


# 最近记录
@main.route('/get/item-history', methods=['GET'])
@token_required
def get_item_history(token):
    user_id = token['user_id']
    # 获取查询参数，默认为第一页，每页10条数据
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # 查询当前用户的物品修改记录，连接查询 Item、Category 和 Location
    item_history_query = (db.session.query(ItemHistory, Item, Category, Location)
                          .join(Item, ItemHistory.item_id == Item.id)  # 连接 Item 表
                          .join(Category, Item.category_id == Category.id)  # 连接 Category 表
                          .join(Location, Item.location_id == Location.id)  # 连接 Location 表
                          .filter(ItemHistory.user_id == user_id)
                          .order_by(ItemHistory.changed_at.desc()))

    # 分页查询
    item_history_paginated = item_history_query.paginate(page=page, per_page=per_page, error_out=False)

    # 获取分页后的数据
    item_history = item_history_paginated.items
    total_pages = item_history_paginated.pages
    current_page = item_history_paginated.page

    # 格式化数据返回
    item_history_data = [{
        'id': record.ItemHistory.id,
        'user_id': record.ItemHistory.user_id,
        'item_id': record.ItemHistory.item_id,
        'action_type': record.ItemHistory.action_type,
        'action': record.ItemHistory.action,
        'changed_at': record.ItemHistory.changed_at.isoformat(),
        'item_name': record.Item.name,
        'category_name': record.Category.name,
        'location_name': record.Location.name
    } for record in item_history]

    return jsonify({
        'code': 200,
        'data': item_history_data,
        'total': item_history_paginated.total,
        'pages': total_pages,
        'page': current_page,
        'per_page': per_page
    })


# 获取物品信息
@main.route('/item-info', methods=['GET'])
@token_required
def get_item_info(token):
    user_id = token['user_id']
    item_id = request.args.get('item_id')

    # 检验参数
    if not item_id:
        return jsonify({'message': '物品ID缺失', 'code': 400})
    item = Item.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({'message': '物品不存在', 'code': 400})

    # 获取物品相关的其他信息（如 category, location）
    category = Category.query.get(item.category_id)
    location = Location.query.get(item.location_id)

    # 返回物品信息
    item_info = {
        'image_url': item.image_url,
        'name': item.name,
        'description': item.description,
        'quantity': item.quantity,
        'price': item.price,
        'category': category.name,
        'location': location.name,
        'expiry': item.expiry,
        'warranty': item.warranty,
        'created_at': item.created_at,
        'attachment_url': item.attachment_url
    }

    return jsonify({'message': '信息获取成功', 'code': 200, 'data': item_info})


# 更新物品信息
@main.route('/item-update/<field>', methods=['POST'])
@token_required
def update_item_field(token, field):
    user_id = token['user_id']
    item_id = request.get_json().get('item_id')
    new_value = request.get_json().get('value')

    # 检验参数
    if not item_id:
        return jsonify({'message': '物品ID缺失', 'code': 400})
    item = Item.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({'message': '物品不存在', 'code': 400})

    # 根据字段更新物品信息
    if field == 'name':
        item.name = new_value
        action = "更新了物品的名称"
    elif field == 'description':
        item.description = new_value
        action = "更新了物品的描述"
    elif field == 'quantity':
        try:
            new_value = int(new_value)
            item.quantity = new_value
            action = "更新了物品的数量"
        except ValueError:
            return jsonify({'message': '数量必须是整数', 'code': 400})
    elif field == 'price':
        try:
            new_value = float(new_value)
            item.price = new_value
            action = "更新了物品的单价"
        except ValueError:
            return jsonify({'message': '价格必须是浮点数', 'code': 400})
    elif field == 'category':
        category = Category.query.filter_by(name=new_value, user_id=user_id).first()
        if category:
            item.category_id = category.id
            action = "更新了物品的类别"
        else:
            return jsonify({'message': '类别不存在，请先创建', 'code': 400})
    elif field == 'location':
        location = Location.query.filter_by(name=new_value, user_id=user_id).first()
        if location:
            item.location_id = location.id
            action = "更新了物品的位置"
        else:
            return jsonify({'message': '位置不存在，请先创建', 'code': 400})
    elif field == 'expiry':
        item.expiry = new_value
        action = "更新了物品的过期时间"
    elif field == 'warranty':
        item.warranty = new_value
        action = "更新了物品的保修时间"
    else:
        return jsonify({'message': '无效属性', 'code': 400})
    db.session.commit()

    item_history = ItemHistory(
        user_id=user_id,
        item_id=item.id,
        action_type="修改",
        action=action,
        changed_at=datetime.now()
    )
    db.session.add(item_history)
    db.session.commit()

    return jsonify({'message': f'{field}修改完成', 'code': 200})


# 更新物品图片信息
@main.route('/item-update/picture', methods=['POST'])
@token_required
def update_picture(token):
    user_id = token['user_id']
    item_id = request.form.get('item_id')

    # 检验参数
    if not item_id:
        return jsonify({'message': '物品ID缺失', 'code': 400})
    item = Item.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({'message': '物品不存在', 'code': 400})

    # 获取上传的文件
    file = request.files['picture']
    if file:
        if allowed_image_file(file.filename):
            file_extension = os.path.splitext(file.filename)[1]  # 提取扩展名
            encoded_item_name = item.name.encode('utf-8').decode('utf-8')
            item_image_filename = f"{user_id}_item_{encoded_item_name}{file_extension}"  # 用户ID_物品_物品名称，避免重复覆盖
            item_image_filename = UPLOAD_FOLDER_IMAGES + item_image_filename
            file.save(item_image_filename)
            # 更新数据库中的信息
            item.image_url = item_image_filename
            db.session.commit()

            item_history = ItemHistory(
                user_id=user_id,
                item_id=item.id,
                action_type="修改",
                action="更新了物品的图片",
                changed_at=datetime.now()
            )
            db.session.add(item_history)
            db.session.commit()

            return jsonify({
                'message': '图片更新成功',
                'code': 200,
                'data': {'image_url': item_image_filename}
            })
        else:
            return jsonify({'message': '图片类型不支持', 'code': 400})
    else:
        return jsonify({'message': '未上传图片', 'code': 400})


# 更新物品附件信息
@main.route('/item-update/attachment', methods=['POST'])
@token_required
def update_attachment(token):
    user_id = token['user_id']
    item_id = request.form.get('item_id')

    # 检验参数
    if not item_id:
        return jsonify({'message': '物品ID缺失', 'code': 400})
    item = Item.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({'message': '物品不存在', 'code': 400})

    # 获取上传的文件
    file = request.files.get('attachment')
    if file:
        if allowed_attachment_file(file.filename):
            file_extension = os.path.splitext(file.filename)[1]  # 提取扩展名
            encoded_item_name = item.name.encode('utf-8').decode('utf-8')
            attachment_filename = f"{user_id}_item_{encoded_item_name}{file_extension}"  # 用户ID_物品_物品名称，避免重复覆盖
            attachment_filepath = UPLOAD_FOLDER_ATTACHMENTS + attachment_filename
            file.save(attachment_filepath)

            # 更新数据库中的附件路径
            item.attachment_url = attachment_filepath
            db.session.commit()

            item_history = ItemHistory(
                user_id=user_id,
                item_id=item.id,
                action_type="修改",
                action="更新了物品的附件",
                changed_at=datetime.now()
            )
            db.session.add(item_history)
            db.session.commit()

            return jsonify({
                'message': '附件上传成功',
                'code': 200,
                'data': {'attachment_url': attachment_filepath}
            })
        else:
            return jsonify({'message': '附件类型不支持', 'code': 400})
    else:
        return jsonify({'message': '未上传附件', 'code': 400})


# 查询接口
@main.route('/search/items', methods=['GET'])
@token_required
def search_items(token):
    user_id = token['user_id']
    query = request.args.get('query', '')  # 获取查询的文本
    page = request.args.get('page', 1, type=int)  # 获取当前页，默认为第一页
    per_page = request.args.get('per_page', 12, type=int)  # 获取每页展示的数量，默认为12

    # 如果查询内容为空，则默认查询该用户的所有物品，并按过期时间正序排列
    if not query:
        items_query = Item.query.filter(Item.user_id == user_id).order_by(Item.expiry.asc())
    else:
        items_query = Item.query.filter(Item.name.ilike(f"%{query}%"), Item.user_id == user_id).order_by(
            Item.expiry.asc())

    # 分页查询
    item_paginated = items_query.paginate(page=page, per_page=per_page, error_out=False)
    items = item_paginated.items
    total_pages = item_paginated.pages
    current_page = item_paginated.page

    # 格式化物品数据返回
    item_data = [{
        'id': item.id,
        'name': item.name,
        'category': Category.query.get(item.category_id).name,
        'location': Location.query.get(item.location_id).name,
        'image_url': item.image_url,
        'expiry': item.expiry.isoformat() if item.expiry else None  # 格式化过期时间
    } for item in items]

    # 返回响应数据
    return jsonify({
        'message': '查询成功',
        'code': 200,
        'data': item_data,
        'total': item_paginated.total,
        'pages': total_pages,
        'page': current_page
    })
