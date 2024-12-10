from . import db


# 用户信息表
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.String(50), default="user", nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), default="static/images/default_photo.jpeg", nullable=False)
