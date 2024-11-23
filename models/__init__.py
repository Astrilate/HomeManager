from flask_sqlalchemy import SQLAlchemy

# 初始化数据库对象
db = SQLAlchemy()

# 延迟导入所有模型
from .item import Item
from .user import User

# 声明公开的模块和类
# 说明哪些内容可以在别的文件中用from <module> import *直接导入
__all__ = ['db', 'Item', 'User']
