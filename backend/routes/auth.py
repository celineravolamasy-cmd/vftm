from flask import Blueprint, request, jsonify
from config import get_connection
from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email et mot de passe requis"
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, nom, email, password, role FROM users WHERE email = %s",
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Email ou mot de passe incorrect"
        }), 401

    if not check_password_hash(user[3], password):
        return jsonify({
            "success": False,
            "message": "Email ou mot de passe incorrect"
        }), 401

    return jsonify({
        "success": True,
        "message": "Connexion réussie",
        "user": {
            "id": user[0],
            "nom": user[1],
            "email": user[2],
            "role": user[4]
        }
    })