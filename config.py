SECRET_KEY = 'xxxxxx'

# 暂时使用 SQLite 内存数据库
SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
# 如果需要持久化到文件，可以改成以下路径：
# SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(os.getcwd(), "homebox.db")}'

SQLALCHEMY_TRACK_MODIFICATIONS = False  # 关闭追踪修改，提高性能
