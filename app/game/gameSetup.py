from flask_login import current_user
from app import models, db
import datetime

def setupGame():
    user_id = int(current_user.id)
    print(f"Setting up for user {user_id}")

    animals = models.Animal.query.all()
    products = models.AnimalProduct.query.all()

    for animal in animals:
        ba = models.UserAnimals(
            user_id=user_id,
            animal_id=animal.id,
            quantity=0
        )

        db.session.add(ba)

    for product in products:
        bp = models.UserProducts(
            user_id=user_id,
            animal_product_id=product.id,
            quantity=0
        )

        db.session.add(bp)

    # print(db.session.new)

    user_data = models.UserData.query.get(int(user_id))
    user_data.game_setup = 1

    user_game_data = models.UserGameData.query.get(int(user_id))
    user_game_data.product_last_collected = datetime.datetime.now()

    db.session.commit()
