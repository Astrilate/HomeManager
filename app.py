from flask import Flask
from models import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# 创建 Flask 实例
app = Flask(__name__, template_folder="templates", static_folder="static")
# 加载配置
app.config.from_object('config')

# 初始化数据库和其他的
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# 在app上下文中创建表结构
with app.app_context():
    db.create_all()


# 注册蓝图之前，不要提前导入
def create_app():
    # 延迟引用，避免重复执行蓝图的创建操作
    from views import main, user  # 这里延迟导入蓝图
    app.register_blueprint(main)
    app.register_blueprint(user)

    return app


if __name__ == '__main__':
    create_app().run()
