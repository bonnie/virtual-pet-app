"""Server for virtual pet app."""

from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from model import connect_to_db, db
import crud
import helper
from jinja2 import StrictUndefined

# create Flask app
app = Flask(__name__)
# create secret_key (req for session object)
app.secret_key = "lkdhjfasiop89ryweq23809"
# throw error for undefined variables
app.jinja_env.undefined = StrictUndefined



@app.route('/')
def show_homepage():
    """Show homepage."""

    # Check if user is logged in. If yes, redirect to pet page.
    if session.get("current_user_id"):
        return redirect('/pet')
    else:
        return render_template('homepage.html')


@app.route('/create-user', methods=['POST'])
def create_user():
    """Create new user.
    
    Checks if user with provided email or username already exists."""

    # Get email, username, password from create account form
    email = request.form.get("email")
    username = request.form.get("username")
    password = request.form.get("password")
    password2 = request.form.get("password2")

    valid_account = helper.check_new_account(email, username, password, password2)

    if not valid_account:
        return redirect('/')
    else:
        # Get newly created User object from db
        user = crud.get_user_by_username(username)
        helper.log_in_user(user)
        return redirect('/pet')


@app.route('/login', methods=['POST'])
def login():
    """Log user in."""

    # Get username and password from login form
    username = request.form.get("username")
    password = request.form.get("password")

    # Get user object by username
    user = crud.get_user_by_username(username)

    # Validate username
    if not user:
        flash("No accounts found with that username. Please try again.")
        return redirect('/')

    # Validate password
    if user.password != password:
        flash("That username and password don't match. Please try again.")
        return redirect('/')
    else:
        helper.log_in_user(user)
        return redirect('/pet')


@app.route("/logout")
def logout():
    """Log user out."""

    # session["current_user_id"] = None
    session.pop("current_user_id", None)
    flash("You are now logged out.")

    return redirect("/")


@app.route('/pet')
def view_pet():
    """Show user their pet."""

    # Redirect to homepage if user not logged in
    if not session.get("current_user_id"):
        return redirect("/")

    # Get pet of current user
    else:
        pet = crud.get_pet(session["current_user_id"])
        # If user doesn't have a pet, redirect to create pet page.
        if not pet:
            flash("Looks like you don't have a pet yet! Let's fix that.")
            return redirect("/create-pet")
        # If user has pet, display pet
        else:
            print(pet)
            return render_template('pet.html', pet=pet)


@app.route("/create-pet")
def new_pet():
    """Show user pet generator."""

    # Redirect to homepage if user not logged in
    if not session.get("current_user_id"):
        return redirect("/")
    # Redirect to pet page if user has existing pet
    elif crud.get_pet(session["current_user_id"]):
        return redirect("/pet")
    else:
        return render_template("pet-generator.html")


@app.route("/generate-pet")
def generate_rand_pet():
    """Generate a random pet."""

    pet = helper.generate_pet()

    return jsonify(pet)


@app.route("/adopt-pet", methods=["POST"])
def adopt_pet():
    """Create pet in database and assign to user."""

    pet_data = request.json

    species_name = pet_data["Pet species"]
    food_fave = pet_data["Favorite food"]
    food_least = pet_data["Least favorite food"]
    activity_fave = pet_data["Favorite activity"]
    activity_least = pet_data["Least favorite activity"]
    music_fave = pet_data["Favorite music genre"]
    music_least = pet_data["Least favorite music genre"]
    weather_fave = pet_data["Favorite weather"]
    weather_least = pet_data["Least favorite weather"]
    personality = pet_data["Personality"]
    astro_sign = pet_data["Astrological sign"]
    species_img_path = pet_data["Species img path"]
    name = pet_data["Name"]
    zipcode = pet_data["Zipcode"]
    user_id = session["current_user_id"]

    # Create pet
    pet = crud.create_pet(
    user_id,
    species_name,
    name,
    zipcode,
    food_fave,
    food_least,
    activity_fave,
    activity_least,
    music_fave,
    music_least,
    weather_fave,
    weather_least,
    personality,
    astro_sign,
    species_img_path)

    db.session.add(pet)
    db.session.commit()

    print(crud.get_pet(session["current_user_id"]))

    flash("Congratulations on bringing home your new pet!")

    return redirect('/pet')


@app.route("/delete-pet")
def delete_user_pet():
    """Delete current user's pet."""

    crud.delete_pet(session["current_user_id"])

    flash("Your pet has been released to the wild.")

    return redirect("/create-pet")


if __name__ == "__main__":
    # connect app to db
    connect_to_db(app)
    # run app
    app.run(debug=True, host='0.0.0.0')