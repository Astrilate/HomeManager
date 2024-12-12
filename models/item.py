from . import db


# 物品信息表
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)  # 名称，不要特意进行 unique 的设置，不然不同用户也无法重名了，且软删除完了还想增加同名物品就不好弄了
    description = db.Column(db.Text, nullable=False)  # 描述
    quantity = db.Column(db.Integer, nullable=False)  # 物品数量
    price = db.Column(db.Numeric(10, 2), nullable=False)  # 物品价格，保留两位小数
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)  # 外键，物品分类
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)  # 外键，物品位置
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外键，物品所有者
    expiry = db.Column(db.DateTime, nullable=True)  # 过期时间
    warranty = db.Column(db.DateTime, nullable=True)  # 保修时间
    image_url = db.Column(db.String(255), default="static/images/default_item.jpg", nullable=False)  # 用于存储图片路径
    attachment_url = db.Column(db.String(255), nullable=True)  # 用于存储附件路径
    created_at = db.Column(db.DateTime, nullable=False)  # 创建时间
    is_deleted = db.Column(db.Integer, default=0, nullable=False)  # 为了历史记录表的参照完整性使用软删除，表示是否被删除


# 物品类别表，初始包括家具家电、衣物配饰、厨房用品、食品饮料、学习工作、工具杂物这6类，可允许用户进行添加修改
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外键，用户专用的类别
    is_deleted = db.Column(db.Integer, default=0, nullable=False)  # 为了历史记录表的参照完整性使用软删除，表示是否被删除


# 物品位置表，初始包括客厅、餐厅、卧室、厨房、厕所、阳台6类，可允许用户进行添加修改
class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(255), default="static/images/default_location.png", nullable=False)  # 用于存储图片路径
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外键，用户专用的家庭位置
    is_deleted = db.Column(db.Integer, default=0, nullable=False)  # 为了历史记录表的参照完整性使用软删除，表示是否被删除


# 物品修改历史表
class ItemHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外键，关联指定用户
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)  # 外键，关联指定物品
    item_name = db.Column(db.String(100), nullable=False)  # 冗余数据，用于追踪历史名称
    category_name = db.Column(db.String(100), nullable=False)  # 冗余数据，用于追踪历史类别名称
    location_name = db.Column(db.String(100), nullable=False)  # 冗余数据，用于追踪历史位置名称
    action_type = db.Column(db.String(50), nullable=False)  # 操作类型，包括创建、修改、删除，只能在后端代码里面进行检查
    action = db.Column(db.String(255), nullable=False)  # 具体操作说明，后端格式化输入
    changed_at = db.Column(db.DateTime, nullable=False)  # 操作时间
