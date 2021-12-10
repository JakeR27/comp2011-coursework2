from urllib.parse import urlparse, urljoin
from flask import request, has_request_context
from app import models, db
from flask_login import login_required, current_user
import logging
from flask.logging import default_handler


def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


def get_user_settings():
    if current_user.is_authenticated:
        current_user_db = models.User.query.filter_by(username=current_user.username).first()
        current_user_settings = models.UserSettings.query.filter_by(user_id=current_user_db.id).first()
        return current_user_settings

    return None


def dbresult_to_list(result):
    data = list()
    for row in result:
        new_row = list()
        for field in row:
            new_row.append(field)
        data.append(new_row)
    return data


def db_api_execute(query, queryparam, internal):
    result = db.session.execute(query, queryparam)
    db.session.flush()

    obj = dict()
    data = dbresult_to_list(result)

    if not internal:
        obj["success"] = "true"
        obj["data"] = data
    else:
        obj = data

    # print(obj)
    return obj


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
