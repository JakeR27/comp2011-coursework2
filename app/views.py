import json
from flask import render_template, request, redirect, flash, abort, session
from flask_login import login_user, login_required, current_user, logout_user
from app import app, db, models
from app.forms import LoginForm, RegisterForm, UserSettingsForm, GameAnimalCommandForm
from app.utils import is_safe_url, get_user_settings, dbresult_to_list, db_api_execute
from app.game.gameSetup import setupGame
import hashlib
import datetime
import logging


@app.before_request
def make_session_permanent():
    session.permanent = False


@app.route('/', methods=["GET", "POST"])
def index():
    if current_user.is_authenticated:
        # current_user_db = models.User.query.filter_by(username=current_user.username).first()
        # current_user_settings = models.UserSettings.query.filter_by(user_id=current_user_db.id).first()

        return render_template("index.html",
                               title="My app",
                               current_path="/",
                               dev=False,
                               user=current_user,
                               user_settings=get_user_settings()), 200

    tmp = dict()
    if datetime.datetime.now().hour in range(7, 18):
        tmp["theme"] = "light"
    else:
        tmp["theme"] = "dark"

    return render_template("landing.html",
                           title="My app",
                           current_path="/",
                           dev=False,
                           user=current_user,
                           user_settings=get_user_settings() or tmp
                           ), 200


@app.route('/login', methods=["GET"])
def login():
    if current_user.is_authenticated:
        next = request.args.get('next')
        if not is_safe_url(next):
            return abort(400)

        return redirect(next or "/")

    form = LoginForm()

    tmp = dict()
    if datetime.datetime.now().hour in range(7, 18):
        tmp["theme"] = "light"
    else:
        tmp["theme"] = "dark"

    return render_template("login.html",
                           title="Login",
                           current_path="/login",
                           dev=False,
                           form=form,
                           user=current_user,
                           user_settings=get_user_settings() or tmp
                           ), 200


@app.route('/login', methods=["POST"])
def login_post():
    form = LoginForm()

    if form.is_submitted():
        user = models.User.query.filter_by(username=form.username.data).first()

        hashed_password_input = hashlib.sha256((form.password.data + app.config["SECRET_KEY"]).encode())

        if (not user) or (user.password != hashed_password_input.hexdigest()):
            logging.warning(f"Failed attempt to login to {form.username.data}")
            flash("Login Failed! Please check your details and try again", "danger")
            return render_template("login.html",
                                   title="Login",
                                   current_path="/login",
                                   dev=False,
                                   form=form,
                                   user=current_user,
                                   user_settings=get_user_settings()), 200

        login_user(user, form.remember_me.data)
        next = request.args.get('next')
        if not is_safe_url(next):
            logging.error("NEXT URL is not safe, aborting request")
            return abort(400)

        return redirect(next or "/")

    return abort(400)


@app.route('/register', methods=["GET"])
def register():
    form = RegisterForm()

    tmp = dict()
    if datetime.datetime.now().hour in range(7, 18):
        tmp["theme"] = "light"
    else:
        tmp["theme"] = "dark"

    return render_template("register.html",
                           title="Register",
                           current_path="/register",
                           dev=False,
                           form=form,
                           user=current_user,
                           user_settings=get_user_settings() or tmp
                           ), 200


@app.route('/register', methods=["POST"])
def register_post():
    form = RegisterForm()

    tmp = dict()
    if datetime.datetime.now().hour in range(7, 18):
        tmp["theme"] = "light"
    else:
        tmp["theme"] = "dark"

    if form.is_submitted():

        user = models.User.query.filter_by(username=form.username.data).first()

        valid = True

        if user:
            flash("A user with that username already exists!", "danger")
            valid = False

        if form.password.data != form.password2.data:
            flash("The passwords provided do not match!", "danger")
            valid = False

        if not valid:
            return redirect("/register")
            # return render_template("register.html",
            #                        title="Register",
            #                        current_path="/register",
            #                        dev=False,
            #                        form=form,
            #                        user=current_user,
            #                        user_settings=get_user_settings()), 200

        hashed_password_input = hashlib.sha256((form.password.data + app.config["SECRET_KEY"]).encode()).hexdigest()

        user = None
        user = models.User(
            username=form.username.data,
            password=hashed_password_input
        )

        db.session.add(user)
        db.session.commit()

        user = models.User.query.filter_by(username=user.username).first()

        user_settings = models.UserSettings(
            name=form.name.data,
            theme="light",
            user_id=user.id
        )

        user_data = models.UserData(
            user_id=user.id,
            game_setup=0
        )

        user_game_data = models.UserGameData(
            user_id=user.id,
            coins=1000,
            product_last_collected=datetime.datetime.now()
        )

        db.session.add(user_data)
        db.session.add(user_settings)
        db.session.add(user_game_data)
        db.session.commit()

        return redirect("/login")


@app.route("/logout")
@login_required
def logout():
    logout_user()

    if current_user.is_authenticated:
        return render_template("logout_fail.html",
                               title="Logout",
                               current_path="/logout",
                               dev=False,
                               user=current_user,
                               user_settings=get_user_settings()), 200

    return render_template("logout_success.html",
                           title="Logout",
                           current_path="/logout",
                           dev=False,
                           user=current_user,
                           user_settings=get_user_settings()), 200


@app.route("/settings", methods=["GET", "POST"])
@login_required
def settings():
    form = UserSettingsForm()
    current_user_settings = get_user_settings()

    if form.is_submitted():
        current_user_settings.name = form.name.data
        current_user_settings.theme = form.theme.data

        db.session.commit()

        flash("Successfully updated!", "success")

        return render_template("user_settings.html",
                               title="Settings",
                               current_path="/settings",
                               dev=False,
                               user=current_user,
                               user_settings=get_user_settings(),
                               form=form), 200

    form.name.data = current_user_settings.name
    form.theme.data = current_user_settings.theme

    return render_template("user_settings.html",
                           title="Settings",
                           current_path="/settings",
                           dev=False,
                           user=current_user,
                           user_settings=get_user_settings(),
                           form=form), 200


@app.route("/play", methods=["GET"])
@login_required
def play():
    c_css = "play/play"

    form = GameAnimalCommandForm()

    user_data = models.UserData.query.get(int(current_user.id))
    if user_data.game_setup != 1:
        logging.warning(f"USER ID {current_user.id} has never played before! Setting up relevant tables")
        setupGame()

    animals = [(a.id, f"{a.name}") for a in models.Animal.query.all()]
    form.animal.choices = animals

    products = db.session.execute("SELECT name, quantity, value "
                                  "FROM user_products, animal_product "
                                  "WHERE user_products.animal_product_id = animal_product.id "
                                  "AND user_products.user_id = :uid", {"uid": current_user.id})

    animals = db.session.execute("SELECT name, quantity, value "
                                 "FROM user_animals, animal "
                                 "WHERE user_animals.animal_id = animal.id "
                                 "AND user_animals.user_id = :uid", {"uid": current_user.id})

    db.session.flush()

    return render_template("game/play.html",
                           title="Zoomania",
                           current_path="/play",
                           dev=False,
                           user=current_user,
                           user_settings=get_user_settings(),
                           custom_css=c_css,
                           form=form,
                           products=products,
                           animals=animals
                           ), 200


@app.route("/explore", methods=["GET"])
def explore():
    accounts = models.UserGameData.query.all()
    db.session.commit()

    return render_template("game/explore.html",
                           title="Explore zoos",
                           current_path="/explore",
                           dev=False,
                           user=current_user,
                           user_settings=get_user_settings(),
                           custom_css="explore/explore",
                           accounts=accounts), 200


# API ------------------------------------------------------------------


@app.route("/api/v1/farm/me/data")
@login_required
def farm_me_data():
    a = farm_me_animals(True)
    p = farm_me_products(True)
    e = farm_me_extra(True)

    obj = dict()
    obj["success"] = "true"
    obj["animals"] = a
    obj["products"] = p
    obj["extra"] = e

    return obj


@app.route("/api/v1/farm/me/animals")
@login_required
def farm_me_animals(internal=False):

    return db_api_execute("SELECT name, quantity, value "
                          "FROM user_animals, animal "
                          "WHERE user_animals.animal_id = animal.id "
                          "AND user_animals.user_id = :uid", {"uid": current_user.id},
                          internal)


@app.route("/api/v1/farm/me/products")
@login_required
def farm_me_products(internal=False):

    return db_api_execute("SELECT name, quantity, value "
                          "FROM user_products, animal_product "
                          "WHERE user_products.animal_product_id = animal_product.id "
                          "AND user_products.user_id = :uid", {"uid": current_user.id},
                          internal)


@app.route("/api/v1/farm/me/extra")
@login_required
def farm_me_extra(internal=False):

    return db_api_execute("SELECT coins "
                          "FROM user_game_data "
                          "WHERE user_game_data.user_id = :uid", {"uid": current_user.id},
                          internal)


@app.route("/api/v1/farm/me/sold")
@login_required
def farm_me_sold():
    item = request.args.get("item")
    quantity = request.args.get("quantity")

    animal_item = db_api_execute("SELECT user_animals.quantity "
                                 "FROM user_animals, animal "
                                 "WHERE ("
                                 "user_animals.user_id = :uid "
                                 "AND "
                                 "user_animals.animal_id = animal.id "
                                 "AND "
                                 "animal.name = :item ) "
                                 , {"uid": current_user.id, "item": item}, True)

    product_item = db_api_execute("SELECT user_products.quantity "
                                  "FROM  user_products, animal_product "
                                  "WHERE ("
                                  "user_products.user_id = :uid "
                                  "AND "
                                  "user_products.animal_product_id = animal_product.id "
                                  "AND "
                                  "animal_product.name = :item"
                                  ")", {"uid": current_user.id, "item": item}, True)

    print(len(animal_item))
    print(len(product_item))

    quantity = int(quantity)

    # if its an animal that was sold
    if len(animal_item):
        animal_entry = models.Animal.query.filter_by(name=item).first()
        db_entry = models.UserAnimals.query.filter_by(user_id=current_user.id, animal_id=animal_entry.id).first()

        money_made = 0
        if quantity == -1:
            money_made = db_entry.quantity * animal_entry.value
            db_entry.quantity = 0
        else:
            if db_entry.quantity >= 1:
                money_made = 1 * animal_entry.value
                db_entry.quantity -= 1

        user_extras = models.UserGameData.query.filter_by(user_id=current_user.id).first()
        user_extras.coins += money_made

    if len(product_item):
        product_entry = models.AnimalProduct.query.filter_by(name=item).first()
        db_entry = models.UserProducts.query.filter_by(user_id=current_user.id, animal_product_id=product_entry.id).first()

        money_made = 0
        if quantity == -1:
            money_made = db_entry.quantity * product_entry.value
            db_entry.quantity = 0
        else:
            if db_entry.quantity >= 1:
                money_made = 1 * product_entry.value
                db_entry.quantity -= 1

        user_extras = models.UserGameData.query.filter_by(user_id=current_user.id).first()
        user_extras.coins += money_made

    db.session.commit()

    return "200"


@app.route("/api/v1/farm/me/buy")
@login_required
def farm_me_buy():
    item = request.args.get("item")
    quantity = request.args.get("quantity")

    animal_item = db_api_execute("SELECT user_animals.quantity "
                                 "FROM user_animals, animal "
                                 "WHERE ("
                                 "user_animals.user_id = :uid "
                                 "AND "
                                 "user_animals.animal_id = animal.id "
                                 "AND "
                                 "animal.name = :item ) "
                                 , {"uid": current_user.id, "item": item}, True)

    print(len(animal_item))

    if len(animal_item):
        animal_entry = models.Animal.query.filter_by(name=item).first()
        db_entry = models.UserAnimals.query.filter_by(user_id=current_user.id, animal_id=animal_entry.id).first()
        user_extras = models.UserGameData.query.filter_by(user_id=current_user.id).first()

        money_cost = int(quantity) * animal_entry.value
        if int(user_extras.coins) < int(money_cost):
            return "200"

        user_extras.coins -= money_cost
        db_entry.quantity += int(quantity)

        db.session.commit()

    return "200"


@app.route("/api/v1/farm/me/update/products")
@login_required
def farm_me_update_products():
    ctime = datetime.datetime.now()
    stime = models.UserGameData.query.filter_by(user_id=int(current_user.id)).first().product_last_collected
    time_passed = ctime - stime
    time_passed = time_passed.total_seconds()
    time_passed = divmod(time_passed, 60)[0]
    time_passed = int(time_passed)
    time_passed = 10 if time_passed > 10 else time_passed

    new_products = db.session.execute("SELECT animal_product_id, production_rate * user_animals.quantity * :time "
                                      "FROM animal_product_produce, user_animals "
                                      "WHERE user_id= :uid "
                                      "AND user_animals.animal_id=animal_product_produce.animal_id "
                                      "AND user_animals.quantity > 0 ",
                                      {"uid": current_user.id, "time": time_passed})

    for np in new_products:
        models.UserProducts.query.filter_by(user_id=int(current_user.id), animal_product_id=np[0]).first().quantity += np[
            1]

    models.UserGameData.query.filter_by(user_id=int(current_user.id)).first().product_last_collected = ctime

    db.session.commit()
    return "200"


@app.route("/api/v1/farm/me/update/screenshot", methods=["POST"])
@login_required
def farm_me_update_screenshot():
    models.UserGameData.query.filter_by(user_id=int(current_user.id)).first().farm_screenshot = json.loads(request.data)

    db.session.commit()

    return "200"


# Handle all 404 Errors, eg invalid paths
@app.errorhandler(404)
def error404(u_path):
    logging.error(f"NO ROUTE FOR {request.path}")
    tmp = dict()
    if datetime.datetime.now().hour in range(7, 18):
        tmp["theme"] = "light"
    else:
        tmp["theme"] = "dark"

    return render_template("404.html",
                           title="Error 404",
                           current_path=request.path,
                           user=current_user,
                           user_settings=get_user_settings() or tmp
                           ), 404
