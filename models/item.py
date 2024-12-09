from datetime import datetime

from sqlalchemy import Enum

from . import db


# 物品信息表
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)  # 名称
    description = db.Column(db.Text, nullable=True)  # 描述
    quantity = db.Column(db.Integer, default=1)  # 物品数量
    price = db.Column(db.Numeric(10, 2), nullable=False)  # 物品价格，保留两位小数
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)  # 外键，物品分类
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)  # 外键，物品位置
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # 外键，物品所有者
    image_url = db.Column(db.String(200), nullable=False)  # 图片 URL
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 创建时间


# 物品类别表，初始包括家具家电、衣物配饰、厨房用品、食品饮料、学习工作、工具杂物这6类，可允许用户进行添加修改
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # 外键，用户专用的类别


# 物品位置表，初始包括客厅、餐厅、卧室、厨房、厕所、阳台6类，可允许用户进行添加修改
class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(200), nullable=False)  # 位置图片 URL
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外键，用户专用的家庭位置


# 物品修改历史表
class ItemHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)  # 关联物品
    action = db.Column(Enum('新增', '修改', '删除', name='action_type'), nullable=False)  # 操作类型，包括增加、修改、删除
    description = db.Column(db.String(100), nullable=False)  # 格式化修改信息
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)  # 操作时间
