from flask import Blueprint, jsonify, request
from config import get_connection
from werkzeug.utils import secure_filename
import os

actualites_bp = Blueprint("actualites", __name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==========================
# Récupérer toutes les actualités
# ==========================

@actualites_bp.route("/actualites", methods=["GET"])
def get_actualites():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, titre, description, date_actualite, image
        FROM actualites
        ORDER BY id DESC
    """)

    rows = cur.fetchall()

    actualites = []

    for row in rows:
        actualites.append({
            "id": row[0],
            "titre": row[1],
            "description": row[2],
            "date": str(row[3]),
            "image": row[4]
        })

    cur.close()
    conn.close()

    return jsonify(actualites)


# ==========================
# Récupérer une actualité par ID
# ==========================

@actualites_bp.route("/actualites/<int:id>", methods=["GET"])
def get_actualite(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, titre, description, date_actualite, image
        FROM actualites
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row is None:
        return jsonify({
            "message": "Actualité introuvable"
        }), 404

    return jsonify({
        "id": row[0],
        "titre": row[1],
        "description": row[2],
        "date": str(row[3]),
        "image": row[4]
    })


# ==========================
# Ajouter une actualité
# ==========================

@actualites_bp.route("/actualites", methods=["POST"])
def ajouter_actualite():

    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    image = request.files.get("image")

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
        INSERT INTO actualites
        (titre, description, date_actualite, image)
        VALUES (%s, %s, %s, %s)
    """, (
        titre,
        description,
        date,
        image_name
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Actualité ajoutée avec succès",
        "image": image_name
    }), 201


# ==========================
# Modifier une actualité
# ==========================
@actualites_bp.route("/actualites/<int:id>", methods=["PUT"])
def modifier_actualite(id):

    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    nouvelle_image = request.files.get("image")
    ancienne_image = request.form.get("ancienne_image")

    image_name = ancienne_image

    # Raha misy nouvelle image
    if nouvelle_image and nouvelle_image.filename:

        image_name = secure_filename(nouvelle_image.filename)

        image_path = os.path.join(
            UPLOAD_FOLDER,
            image_name
        )

        nouvelle_image.save(image_path)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE actualites
        SET
            titre = %s,
            description = %s,
            date_actualite = %s,
            image = %s
        WHERE id = %s
    """, (
        titre,
        description,
        date,
        image_name,
        id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Actualité modifiée avec succès"
    })

    # ==========================
# Supprimer une actualité
# ==========================

@actualites_bp.route("/actualites/<int:id>", methods=["DELETE"])
def supprimer_actualite(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM actualites
        WHERE id = %s
    """, (id,))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Actualité supprimée avec succès"
    })