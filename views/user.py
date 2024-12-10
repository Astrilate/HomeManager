import datetime
import jwt
from flask import jsonify, request, render_template

from app import bcrypt
from config import SECRET_KEY
from models import db, User
from . import user


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
