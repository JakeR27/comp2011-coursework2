from flask_wtf import Form
from wtforms import StringField, BooleanField, PasswordField, SelectField
from wtforms.fields.html5 import IntegerField
from wtforms.validators import InputRequired, Length, EqualTo, NumberRange


class LoginForm(Form):
    username = StringField("Username", validators=[Length(min=3), InputRequired()])
    password = PasswordField("Password", validators=[Length(min=1), InputRequired()])
    remember_me = BooleanField("Remember me")


class RegisterForm(Form):
    name = StringField("Name", validators=[Length(min=1), InputRequired()])
    username = StringField("Username", validators=[Length(min=3), InputRequired()])
    password = PasswordField("Password", validators=[ InputRequired()])
    password2 = PasswordField("Confirm Password", validators=[InputRequired(), EqualTo(password)])


class UserSettingsForm(Form):
    name = StringField("Name", validators=[Length(min=1), InputRequired()])
    theme = SelectField("Theme", choices=["light", "dark"], validators=[InputRequired()])


class GameAnimalCommandForm(Form):
    animal = SelectField("Animal", validators=[InputRequired()])
    quantity = IntegerField("Quantity", validators=[InputRequired(), NumberRange(min=1)])
    command = SelectField("Order", choices=[("buy", "Buy"), ("sell", "Sell")], validators=[InputRequired()])


class ChangePasswordForm(Form):
    old_password = PasswordField("Old Password", validators=[Length(min=1), InputRequired()])
    new_password = PasswordField("New Password", validators=[Length(min=1), InputRequired()])
    new_password2 = PasswordField("New Password", validators=[Length(min=1), InputRequired()])
