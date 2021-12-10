from flask_testing import TestCase
import os
from app import db, models, app
import unittest


class testMyTest(TestCase):
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app/app_test.db')
    TESTING = True

    render_templates = False

    def create_app(self):
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self) -> None:
        db.session.remove()
        db.drop_all()

    def test_assert_login(self):
        response = self.client.get("/login")
        self.assert_template_used("login.html")

    def test_assert_index(self):
        response = self.client.get("/")
        self.assert_template_used("landing.html")

    def test_assert_register(self):
        response = self.client.get("/register")
        self.assert_template_used("register.html")

    def test_assert_explore(self):
        response = self.client.get("/explore")
        self.assert_template_used("game/explore.html")

    def test_assert_help(self):
        response = self.client.get("/help")
        self.assert_template_used("game/help.html")

    def test_assert_user_create(self):
        user = models.User(username="un", password="pw")
        db.session.add(user)
        db.session.commit()

        assert user in db.session


if __name__ == "__main__":
    unittest.main()
