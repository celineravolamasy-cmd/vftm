from flask import Blueprint, jsonify, request
from config import get_connection
from werkzeug.utils import secure_filename
import os

partenaires_bp = Blueprint("partenaires", __name__)


# ==========================
# Dossier des logos
# ==========================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==========================
# Récupérer tous les partenaires
# ==========================

@partenaires_bp.route("/partenaires", methods=["GET"])
def get_partenaires():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nom, description, logo, site_web
        FROM partenaires
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    partenaires = []

    for row in rows:

        partenaires.append({
            "id": row[0],
            "nom": row[1],
            "description": row[2] or "",
            "logo": row[3] or "",
            "site_web": row[4] or ""
        })

    cur.close()
    conn.close()

    return jsonify(partenaires)


# ==========================
# Récupérer un partenaire par ID
# ==========================

@partenaires_bp.route("/partenaires/<int:id>", methods=["GET"])
def get_partenaire(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nom, description, logo, site_web
        FROM partenaires
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row is None:
        return jsonify({
            "message": "Partenaire introuvable"
        }), 404

    return jsonify({
        "id": row[0],
        "nom": row[1],
        "description": row[2] or "",
        "logo": row[3] or "",
        "site_web": row[4] or ""
    })


# ==========================
# Ajouter un partenaire
# ==========================

@partenaires_bp.route("/partenaires", methods=["POST"])
def ajouter_partenaire():

    nom = request.form.get("nom")
    description = request.form.get("description")
    site_web = request.form.get("site_web")

    logo = request.files.get("logo")

    if not nom:
        return jsonify({
            "message": "Le nom du partenaire est obligatoire"
        }), 400

    logo_name = None

    if logo and logo.filename:

        logo_name = secure_filename(logo.filename)

        logo_path = os.path.join(
            UPLOAD_FOLDER,
            logo_name
        )

        logo.save(logo_path)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO partenaires
        (nom, description, logo, site_web)
        VALUES (%s, %s, %s, %s)
    """, (
        nom,
        description,
        logo_name,
        site_web if site_web else None
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Partenaire ajouté avec succès",
        "logo": logo_name
    }), 201


# ==========================
# Modifier un partenaire
# ==========================

@partenaires_bp.route("/partenaires/<int:id>", methods=["PUT"])
def modifier_partenaire(id):

    nom = request.form.get("nom")
    description = request.form.get("description")
    site_web = request.form.get("site_web")

    logo = request.files.get("logo")

    if not nom:
        return jsonify({
            "message": "Le nom du partenaire est obligatoire"
        }), 400

    conn = get_connection()
    cur = conn.cursor()

    # Récupérer l'ancien logo
    cur.execute("""
        SELECT logo
        FROM partenaires
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    if row is None:
        cur.close()
        conn.close()

        return jsonify({
            "message": "Partenaire introuvable"
        }), 404

    ancien_logo = row[0]

    logo_name = ancien_logo

    # Nouveau logo
    if logo and logo.filename:

        logo_name = secure_filename(logo.filename)

        logo_path = os.path.join(
            UPLOAD_FOLDER,
            logo_name
        )

        logo.save(logo_path)

    cur.execute("""
        UPDATE partenaires
        SET
            nom = %s,
            description = %s,
            logo = %s,
            site_web = %s
        WHERE id = %s
    """, (
        nom,
        description,
        logo_name,
        site_web if site_web else None,
        id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Partenaire modifié avec succès"
    })


# ==========================
# Supprimer un partenaire
# ==========================

@partenaires_bp.route("/partenaires/<int:id>", methods=["DELETE"])
def supprimer_partenaire(id):

    conn = get_connection()
    cur = conn.cursor()

    # Récupérer le logo avant suppression
    cur.execute("""
        SELECT logo
        FROM partenaires
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    if row is None:
        cur.close()
        conn.close()

        return jsonify({
            "message": "Partenaire introuvable"
        }), 404

    logo_name = row[0]

    # Supprimer de la base
    cur.execute("""
        DELETE FROM partenaires
        WHERE id = %s
    """, (id,))

    conn.commit()

    cur.close()
    conn.close()

    # Supprimer le fichier logo
    if logo_name:

        logo_path = os.path.join(
            UPLOAD_FOLDER,
            logo_name
        )

        if os.path.exists(logo_path):
            os.remove(logo_path)

    return jsonify({
        "message": "Partenaire supprimé avec succès"
    })