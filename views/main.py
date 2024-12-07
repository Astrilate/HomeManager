from flask import render_template, jsonify
from models import db, Item, User
from . import main


# 测试
@main.route('/')
def hello():
    return "hello"


# 首页
@main.route('/home')
def home():
    items = Item.query.all()  # 查询所有物品
    return render_template('index.html', items=items)


# 初始化数据库接口
@main.route('/init', methods=['GET'])
def init_db():
    # 插入测试数据
    user1 = User(username="asd", password="asd")
    db.session.add_all([user1])
    db.session.commit()

    return jsonify({'message': '成功初始化'}), 201
