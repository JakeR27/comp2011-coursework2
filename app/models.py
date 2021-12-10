from app import db
from flask_login import UserMixin


class AssessmentTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module = db.Column(db.String(10), index=True, unique=False)
    deadline = db.Column(db.DateTime)
    complete = db.Column(db.Boolean)
    title = db.Column(db.String(100))
    description = db.Column(db.String(1000))


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100), nullable=False)


class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(1000))
    theme = db.Column(db.String(20))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class UserData(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, primary_key=True)
    game_setup = db.Column(db.Integer, nullable=False)


class Animal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    value = db.Column(db.Integer)


class AnimalProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    value = db.Column(db.Integer)


class AnimalProductProduce(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey("animal.id"))
    animal_product_id = db.Column(db.Integer, db.ForeignKey("animal_product.id"))
    production_rate = db.Column(db.Float, nullable=False)


class UserProducts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    animal_product_id = db.Column(db.Integer, db.ForeignKey("animal_product.id"))
    quantity = db.Column(db.Integer, nullable=False)


class UserAnimals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    animal_id = db.Column(db.Integer, db.ForeignKey("animal.id"))
    quantity = db.Column(db.Integer, nullable=False)


class UserGameData(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    coins = db.Column(db.Integer)
    product_last_collected = db.Column(db.DateTime)
    farm_screenshot = db.Column(db.String)
