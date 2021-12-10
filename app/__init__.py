from flask import Flask, request, has_request_context
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
# from app.utils import setupLogger
import logging
from flask.logging import default_handler

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)


class RequestFormatter(logging.Formatter):
    def format(self, record):
        if has_request_context():
            record.url = request.url
            record.remote_addr = request.remote_addr
        else:
            record.url = None
            record.remote_addr = None

        return super().format(record)


def setupLogger():
    logging.basicConfig(filename="system.log", level=logging.DEBUG, filemode="w")

    improvedFormatter = RequestFormatter('[%(asctime)s] %(remote_addr)s requested %(url)s\n'
                                         '%(levelname)s in %(module)s: %(message)s')

    default_handler.setFormatter(improvedFormatter)

    root = logging.getLogger()
    root.addHandler(default_handler)


setupLogger()
for logger in (app.logger, logging.getLogger('sqlalchemy'), logging.getLogger('werkzeug')):
    logger.addHandler(default_handler)


from app import views, models


@login_manager.user_loader
def load_user(user_id):
    return models.User.query.get(int(user_id))
