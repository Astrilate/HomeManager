from sqlalchemy.dialects.postgresql.base import PGDialect

# 解决无法解析版本号字符串的报错
PGDialect._get_server_version_info = lambda *args: (9, 2)

# 可以临时使用 SQLite 内存数据库
# SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
# 连接到openGauss数据库
SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://qcz1:Root123456@113.44.137.211:26000/qcz1'
SQLALCHEMY_TRACK_MODIFICATIONS = False  # 不需要自动commit，关闭追踪修改，提高性能

JWT_SECRET_KEY = '102201307QiuCongZhu'  # 用于生成JWT令牌的密钥
