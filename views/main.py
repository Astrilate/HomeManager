from flask import render_template, jsonify
from models import db, Item, User
from . import main


# 启动测试
@main.route('/')
def hello():
    return "hello"


# 登录注册首页
@main.route('/index')
def index():
    return render_template('index.html')


@main.route('/home')
def home():
    return "this is home"


# 初始化数据库接口
@main.route('/init', methods=['GET'])
def init_db():
    # 插入测试数据
    user1 = User(username="asd", password="asd")
    db.session.add_all([user1])
    db.session.commit()

    return jsonify({'message': '成功初始化'}), 201
