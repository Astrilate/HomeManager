from flask import render_template, jsonify, request
from models import db, Item, User
from . import main


# 启动测试
@main.route('/')
def hello():
    return "hello"


@main.route('/home')
def home():
    return render_template('home.html')


@main.route('/load_page', methods=['POST'])
def load_page():
    page = request.form.get('page')  # 获取前端传来的页面信息
    return render_template(f'{page}.html')  # 渲染对应的页面


# 初始化数据库接口
@main.route('/calculate', methods=['POST'])
def calculate():
    result = {
        'result1': 666,
        'result2': 666,
        'result3': 666,
        'result4': 666
    }
    return jsonify(result), 200
