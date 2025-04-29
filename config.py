import os

from sqlalchemy.dialects.postgresql.base import PGDialect

# 连接到临时的 SQLite 内存数据库
# SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
# 连接到远程的 openGauss 数据库
# PGDialect._get_server_version_info = lambda *args: (9, 2) # openGauss 解决无法解析版本号字符串的报错
# SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://qcz1:Root123456@113.44.137.211:26000/qcz1'
# 连接到本地的 MySQL 数据库
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456@127.0.0.1:3306/homemanager'

SQLALCHEMY_TRACK_MODIFICATIONS = False  # 不需要自动commit，关闭追踪修改，提高性能
SECRET_KEY = '102201307QiuCongZhu'  # 用于生成JWT令牌的密钥
UPLOAD_FOLDER_PHOTOS = 'static/uploads/photos/'
os.makedirs(UPLOAD_FOLDER_PHOTOS, exist_ok=True)  # 确保这些用于存放上传文件的文件夹创建
UPLOAD_FOLDER_IMAGES = 'static/uploads/images/'
os.makedirs(UPLOAD_FOLDER_IMAGES, exist_ok=True)
UPLOAD_FOLDER_ATTACHMENTS = 'static/uploads/attachments/'
os.makedirs(UPLOAD_FOLDER_ATTACHMENTS, exist_ok=True)
