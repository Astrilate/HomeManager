from flask import Blueprint

# 初始化蓝图
main = Blueprint('main', __name__)

# 延迟导入经过模块处理完的蓝图
from .main import main

# 声明公开的模块和类
# 说明哪些内容可以在别的文件中用from <module> import *直接导入
__all__ = ['main']
