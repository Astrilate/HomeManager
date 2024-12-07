from flask import Blueprint

# 初始化蓝图
main = Blueprint('main', __name__)
user = Blueprint('user', __name__)

# 延迟导入经过模块处理完的蓝图，实际上就是放在蓝图注册的后面
# 当这里调用main文件时，里面执行from . import main，由于
# 这里已经注册过了并存于sys.modules，就不会再次执行本文件
# 核心就是反向存在引用的时候，将该引用的东西提前完成免得再次执行
from .main import main
from .user import user

# 声明公开的模块和类
# 说明哪些内容可以在别的文件中用from <module> import *直接导入
__all__ = ['main', 'user']
