from flask import Blueprint, jsonify, request
from config import get_connection
from werkzeug.utils import secure_filename
import os

projets_bp = Blueprint("projets", __name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==========================
# Récupérer tous les projets
# ==========================

@projets_bp.route("/projets", methods=["GET"])
def get_projets():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            titre,
            description,
            date_projet,
            image,
            objectifs,
            beneficiaires,
            zone_intervention,
            partenaires
        FROM projets
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    projets = []

    for row in rows:
        projets.append({
            "id": row[0],
            "titre": row[1],
            "description": row[2] or "",
            "date": str(row[3]) if row[3] else "",
            "image": row[4] or "",
            "objectifs": row[5] or "",
            "beneficiaires": row[6] or "",
            "zone_intervention": row[7] or "",
            "partenaires": row[8] or ""
        })

    cur.close()
    conn.close()

    return jsonify(projets)


# ==========================
# Récupérer un projet par ID
# ==========================

@projets_bp.route("/projets/<int:id>", methods=["GET"])
def get_projet(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            titre,
            description,
            date_projet,
            image,
            objectifs,
            beneficiaires,
            zone_intervention,
            partenaires
        FROM projets
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row is None:
        return jsonify({
            "message": "Projet introuvable"
        }), 404

    return jsonify({
        "id": row[0],
        "titre": row[1],
        "description": row[2] or "",
        "date": str(row[3]) if row[3] else "",
        "image": row[4] or "",
        "objectifs": row[5] or "",
        "beneficiaires": row[6] or "",
        "zone_intervention": row[7] or "",
        "partenaires": row[8] or ""
    })


# ==========================
# Ajouter un projet
# ==========================

@projets_bp.route("/projets", methods=["POST"])
def ajouter_projet():

    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    objectifs = request.form.get("objectifs")
    beneficiaires = request.form.get("beneficiaires")
    zone_intervention = request.form.get("zone_intervention")
    partenaires = request.form.get("partenaires")

    image = request.files.get("image")

    if not titre:
        return jsonify({
            "message": "Le titre du projet est obligatoire"
        }), 400

    image_name = None

    if image and image.filename:

        image_name = secure_filename(image.filename)

        image_path = os.path.join(
            UPLOAD_FOLDER,
            image_name
        )

        image.save(image_path)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO projets
        (
            titre,
            description,
            date_projet,
            image,
            objectifs,
            beneficiaires,
            zone_intervention,
            partenaires
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        titre,
        description,
        date,
        image_name,
        objectifs,
        beneficiaires,
        zone_intervention,
        partenaires
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Projet ajouté avec succès",
        "image": image_name
    }), 201


# ==========================
# Supprimer un projet
# ==========================

@projets_bp.route("/projets/<int:id>", methods=["DELETE"])
def supprimer_projet(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT image
        FROM projets
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    if row is None:
        cur.close()
        conn.close()

        return jsonify({
            "message": "Projet introuvable"
        }), 404

    image_name = row[0]

    cur.execute("""
        DELETE FROM projets
        WHERE id = %s
    """, (id,))

    conn.commit()

    cur.close()
    conn.close()

    # Supprimer l'image du dossier uploads
    if image_name:

        image_path = os.path.join(
            UPLOAD_FOLDER,
            image_name
        )

        if os.path.exists(image_path):
            os.remove(image_path)

    return jsonify({
        "message": "Projet supprimé avec succès"
    })


# ==========================
# Modifier un projet
# ==========================

@projets_bp.route("/projets/<int:id>", methods=["PUT"])
def modifier_projet(id):

    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    objectifs = request.form.get("objectifs")
    beneficiaires = request.form.get("beneficiaires")
    zone_intervention = request.form.get("zone_intervention")
    partenaires = request.form.get("partenaires")

    nouvelle_image = request.files.get("image")
    ancienne_image = request.form.get("ancienne_image")

    if not titre:
        return jsonify({
            "message": "Le titre du projet est obligatoire"
        }), 400

    image_name = ancienne_image

    # ==========================
    # Nouvelle image
    # ==========================

    if nouvelle_image and nouvelle_image.filename:

        image_name = secure_filename(
            nouvelle_image.filename
        )

        image_path = os.path.join(
            UPLOAD_FOLDER,
            image_name
        )

        nouvelle_image.save(image_path)

    # ==========================
    # Mise à jour PostgreSQL
    # ==========================

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE projets
        SET
            titre = %s,
            description = %s,
            date_projet = %s,
            image = %s,
            objectifs = %s,
            beneficiaires = %s,
            zone_intervention = %s,
            partenaires = %s
        WHERE id = %s
    """, (
        titre,
        description,
        date,
        image_name,
        objectifs,
        beneficiaires,
        zone_intervention,
        partenaires,
        id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Projet modifié avec succès"
    })