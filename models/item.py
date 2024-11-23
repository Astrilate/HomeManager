from . import db


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    insured = db.Column(db.Boolean, default=False)
    price = db.Column(db.Float, nullable=False)
