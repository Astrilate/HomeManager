import datetime
import os

import jwt
from flask import jsonify, request, render_template

from app import bcrypt
from config import SECRET_KEY, UPLOAD_FOLDER_PHOTOS
from models import db, User
from . import user
from .utils import token_required, allowed_image_file


# 登录注册
@user.route('/index')
def index():
    return render_template('index.html')


# 用户登录
@user.route('/login', methods=['POST'])
def login():
    # 获取用户名和密码
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # 查找用户
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': '用户不存在'}), 404

    # 验证密码
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': '密码错误'}), 401

    # 生成JWT
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # 设置过期时间
    }
    access_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return jsonify({'message': '登录成功', 'access_token': access_token}), 200


# 用户注册
@user.route('/register', methods=['POST'])
def register():
    # 获取用户名和密码和邮箱
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # 检查用户名是否已存在
    existing_username = User.query.filter(User.username == username).first()
    if existing_username:
        return jsonify({'message': '用户名已被使用'}), 400

    # 检查邮箱是否已存在
    existing_email = User.query.filter(User.email == email).first()
    if existing_email:
        return jsonify({'message': '邮箱已被使用'}), 400

    # 密码加密
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # 创建新用户
    new_user = User(username=username, password=hashed_password, email=email)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': '注册成功'}), 201


# 获取用户所有信息
@user.route('/user-info', methods=['GET'])
@token_required
def get_user_info(token):
    user_id = token['user_id']
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': '该用户不存在', 'code': 400})

    # 返回用户信息，去除密码
    user_info = {
        'id': user.id,
        'type': user.type,
        'username': user.username,
        'email': user.email,
        'telephone': user.telephone,
        'description': user.description,
        'image_url': user.image_url
    }

    return jsonify({'message': '信息获取成功', 'code': 200, 'data': user_info})


# 更新用户属性信息
@user.route('/user-update/<field>', methods=['POST'])
@token_required
def update_user_field(token, field):
    user_id = token['user_id']

    # 获取请求体中的数据
    data = request.get_json()
    if 'value' not in data:
        return jsonify({'message': '修改的内容不能为空', 'code': 400})
    new_value = data['value']

    # 根据字段动态更新用户信息
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': '该用户不存在', 'code': 400})

    # 根据 field 动态设置对应字段
    if field == 'username':
        if User.query.filter_by(username=new_value).first():
            return jsonify({'message': '用户名已被注册', 'code': 400})
        user.username = new_value
    elif field == 'password':
        if bcrypt.check_password_hash(user.password, new_value):
            return jsonify({'message': '新密码与旧密码重复', 'code': 400})
        user.password = bcrypt.generate_password_hash(new_value).decode('utf-8')
    elif field == 'description':
        user.description = new_value
    elif field == 'email':
        if User.query.filter_by(email=new_value).first():
            return jsonify({'message': '邮箱已被注册', 'code': 400})
        user.email = new_value
    elif field == 'telephone':
        if User.query.filter_by(telephone=new_value).first():
            return jsonify({'message': '电话号码已被注册', 'code': 400})
        user.telephone = new_value
    else:
        return jsonify({'message': '无效属性', 'code': 400})
    db.session.commit()

    return jsonify({'message': f'{field}修改完成', 'code': 200})


# 更新用户头像信息
@user.route('/user-update/avatar', methods=['POST'])
@token_required
def update_avatar(token):
    user_id = token['user_id']
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': '用户不存在', 'code': 400})

    # 获取上传的文件
    if 'avatar' not in request.files:
        return jsonify({'message': '没有选择文件', 'code': 400})
    file = request.files['avatar']
    if file and allowed_image_file(file.filename):
        file_extension = os.path.splitext(file.filename)[1]  # 提取扩展名
        filename = f"{user_id}{file_extension}"  # 用户ID.扩展名
        filepath = UPLOAD_FOLDER_PHOTOS + filename
        file.save(filepath)
        # 更新数据库中的信息
        user.image_url = filepath
        db.session.commit()

        return jsonify({
            'message': '头像更新成功',
            'code': 200,
            'data': {'image_url': filepath}
        })
    else:
        return jsonify({'message': '图片类型不支持', 'code': 400})
