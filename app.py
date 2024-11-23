from flask import Flask
from models import db
from views import main

# 创建 Flask 实例
app = Flask(__name__)
# 加载配置
app.config.from_object('config')
# 初始化数据库
db.init_app(app)
# 注册蓝图
app.register_blueprint(main)

# 在app上下文中创建表结构
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run()
