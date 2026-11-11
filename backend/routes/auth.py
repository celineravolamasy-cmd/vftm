
from flask import Blueprint, request, jsonify, session
from config import get_connection
from werkzeug.security import check_password_hash
import secrets


auth_bp = Blueprint("auth", __name__)


# ==================================
# CONNEXION ADMINISTRATEUR
# ==================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = str(
        data.get("email") or ""
    ).strip()

    password = data.get("password") or ""

    if (
        not email
        or not isinstance(password, str)
        or not password
    ):
        return jsonify({
            "success": False,
            "message": "Email et mot de passe requis"
        }), 400

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, nom, email, password, role
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

    except Exception:
        return jsonify({
            "success": False,
            "message": "Erreur de connexion à la base de données"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()

    # ==================================
    # VERIFICATION DES IDENTIFIANTS
    # ==================================

    if (
        not user
        or not check_password_hash(
            user[3],
            password
        )
    ):
        return jsonify({
            "success": False,
            "message": "Email ou mot de passe incorrect"
        }), 401

    # ==================================
    # VERIFICATION DU ROLE
    # ==================================

    if user[4] != "admin":
        return jsonify({
            "success": False,
            "message": "Accès administrateur refusé"
        }), 403

    # ==================================
    # CREATION DE LA SESSION
    # ==================================

    session.clear()

    session["user_id"] = user[0]
    session["role"] = user[4]

    # Nouveau token CSRF à chaque connexion
    session["csrf_token"] = secrets.token_hex(32)

    session.permanent = False

    return jsonify({
        "success": True,
        "message": "Connexion réussie",
        "user": {
            "id": user[0],
            "nom": user[1],
            "email": user[2],
            "role": user[4]
        },
        "csrf_token": session["csrf_token"]
    }), 200


# ==================================
# VERIFICATION DE LA SESSION
# ==================================

@auth_bp.route("/auth/check", methods=["GET"])
def check_session():

    if (
        not session.get("user_id")
        or session.get("role") != "admin"
    ):
        return jsonify({
            "authenticated": False
        }), 401

    # Compatibilité avec les sessions
    # créées avant l'ajout du CSRF.
    if not session.get("csrf_token"):
        session["csrf_token"] = secrets.token_hex(32)

    return jsonify({
        "authenticated": True,
        "csrf_token": session["csrf_token"]
    }), 200


# ==================================
# DECONNEXION
# ==================================

@auth_bp.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Déconnexion réussie"
    }), 200
