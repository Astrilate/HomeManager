import jwt
from flask import jsonify, request
from functools import wraps

from config import SECRET_KEY


# 验证JWT装饰器
def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None

        # 从请求头获取Authorization信息
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        # 如果没有提供Token
        if not token:
            # 中文编码有问题，只能用英文
            return jsonify({'message': 'Token missed, please login', 'code': 401})

        try:
            # 解码JWT
            decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

            # 确保JWT中包含了user_id和username
            if 'user_id' in decoded and 'username' in decoded:
                current_user = {
                    'user_id': decoded['user_id'],
                    'username': decoded['username']
                }
            else:
                return jsonify({'message': 'Invalid Token, please login again', 'code': 401})

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired, please login again', 'code': 401})
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid Token, please login again', 'code': 401})

        # 将当前用户信息传递给视图函数
        return f(current_user, *args, **kwargs)

    return decorator


# 检查文件扩展名是否合法
def allowed_image_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}


def allowed_attachment_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt',
                                                                      'pptx', 'pdf', 'zip', 'rar'}
