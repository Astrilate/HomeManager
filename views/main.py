import os
from datetime import datetime

from flask import render_template, jsonify, request
from sqlalchemy import func

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
    user_id = token['user_id']
    username = token['username']
    print(user_id, username)
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
        item_image.save(os.path.join('uploads', 'images', item_image_filename))
        item_image_filename = item_image_filename.replace(os.sep, '/')
    elif item_image:
        return jsonify({'message': '图片格式有误', 'code': 400})
    item_attachment_filename = None
    if item_attachment and allowed_attachment_file(item_attachment.filename):
        file_extension = os.path.splitext(item_attachment.filename)[1]  # 提取扩展名
        encoded_item_name = item_name.encode('utf-8').decode('utf-8')
        item_attachment_filename = f"{user_id}_item_{encoded_item_name}{file_extension}"  # 用户ID_物品_物品名称
        item_attachment.save(os.path.join('uploads', 'attachments', item_attachment_filename))
        item_attachment_filename = item_attachment_filename.replace(os.sep, '/')
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
        action="创建",
        quantity=item.quantity,
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
        location_image.save(os.path.join('uploads', 'images', location_image_filename))
        location_image_filename = location_image_filename.replace(os.sep, '/')
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
