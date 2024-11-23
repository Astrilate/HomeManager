from flask import render_template, jsonify
from models import db, Item
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
    # 检查是否已有数据
    if Item.query.first():
        return jsonify({'message': 'Database already initialized. No action taken.'}), 200

    # 插入测试数据
    item1 = Item(name='Laptop', quantity=2, insured=True, price=1500.0)
    item2 = Item(name='Chair', quantity=4, insured=False, price=200.0)
    item3 = Item(name='Desk', quantity=1, insured=True, price=450.0)

    db.session.add_all([item1, item2, item3])
    db.session.commit()

    return jsonify({'message': 'Database initialized successfully with test data.'}), 201
