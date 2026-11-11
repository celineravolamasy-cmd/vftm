
from flask import (
    Flask,
    send_from_directory,
    request,
    session,
    jsonify
)

from flask_cors import CORS
from dotenv import load_dotenv

from routes.actualites import actualites_bp
from routes.projets import projets_bp
from routes.messages import messages_bp
from routes.dashboard import dashboard_bp
from routes.partenaires import partenaires_bp
from routes.auth import auth_bp

import os
import secrets


# ==================================
# CHARGEMENT DES VARIABLES .ENV
# ==================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

load_dotenv(
    os.path.join(BASE_DIR, ".env")
)


# ==================================
# INITIALISATION FLASK
# ==================================

app = Flask(__name__)


# ==================================
# CONFIGURATION SESSION
# ==================================

app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY"
)

if not app.config["SECRET_KEY"]:
    raise RuntimeError(
        "SECRET_KEY manquante dans les variables d'environnement."
    )

app.config["SESSION_COOKIE_HTTPONLY"] = True

# Configuration locale / production
COOKIE_SECURE = (
    os.environ.get(
        "COOKIE_SECURE", "false"
    ).lower() == "true"
)

app.config["SESSION_COOKIE_SECURE"] = COOKIE_SECURE

app.config["SESSION_COOKIE_SAMESITE"] = (
    "None" if COOKIE_SECURE else "Lax"
)


# ==================================
# CONFIGURATION CORS
# ==================================

CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vftm-frontend.onrender.com"
    ],
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "X-CSRF-Token"
    ],
    methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ]
)


# ==================================
# PROTECTION CSRF
# ==================================

@app.before_request
def verifier_csrf():

    # Autoriser les requêtes de lecture
    # et les requêtes CORS préliminaires.
    if request.method in (
        "GET",
        "HEAD",
        "OPTIONS"
    ):
        return None

    # Autoriser la connexion.
    if (
        request.path == "/login"
        and request.method == "POST"
    ):
        return None

    # Autoriser le formulaire de contact public.
    if (
        request.path == "/messages"
        and request.method == "POST"
    ):
        return None

    # Récupérer le token de session.
    token_session = session.get(
        "csrf_token"
    )

    # Récupérer le token envoyé par React.
    token_requete = request.headers.get(
        "X-CSRF-Token"
    )

    # Vérifier les deux tokens.
    if (
        not token_session
        or not token_requete
        or not secrets.compare_digest(
            token_session,
            token_requete
        )
    ):
        return jsonify({
            "success": False,
            "message": "Token CSRF invalide ou manquant"
        }), 403

    return None


# ==================================
# DOSSIER DES IMAGES
# ==================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==================================
# AFFICHAGE DES IMAGES
# ==================================

@app.route(
    "/uploads/<path:filename>",
    methods=["GET"]
)
def uploaded_file(filename):

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# ==================================
# ENREGISTREMENT DES BLUEPRINTS
# ==================================

app.register_blueprint(actualites_bp)

app.register_blueprint(projets_bp)

app.register_blueprint(messages_bp)

app.register_blueprint(dashboard_bp)

app.register_blueprint(partenaires_bp)

app.register_blueprint(auth_bp)


# ==================================
# ROUTE PRINCIPALE
# ==================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "API VFTM fonctionne !"
    }), 200


# ==================================
# LANCEMENT DU SERVEUR
# ==================================

if __name__ == "__main__":

    port = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=port
    )
