from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.actualites import actualites_bp
from routes.projets import projets_bp
from routes.messages import messages_bp
from routes.dashboard import dashboard_bp
from routes.partenaires import partenaires_bp
import os


app = Flask(__name__)
CORS(app)


# ==========================
# Dossier des images
# ==========================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(__file__),
    "uploads"
)


# ==========================
# Afficher les images
# ==========================

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ==========================
# Routes Actualités
# ==========================

app.register_blueprint(actualites_bp)


# ==========================
# Routes Projets
# ==========================

app.register_blueprint(projets_bp)

# ==========================
# Routes Messages
# ==========================

app.register_blueprint(messages_bp)

# ==========================
# Routes Dashboard
# ==========================

app.register_blueprint(dashboard_bp)

# ==========================
# Routes Partenaires
# ==========================

app.register_blueprint(partenaires_bp)


# ==========================
# Route principale
# ==========================

@app.route("/")
def home():
    return {
        "message": "API VFTM fonctionne !"
    }


# ==========================
# Lancer Flask
# ==========================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)