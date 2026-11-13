from flask import Blueprint, jsonify, request
from config import get_connection
from auth_utils import admin_required
from werkzeug.utils import secure_filename
from uuid import uuid4
import os

actualites_bp = Blueprint("actualites", __name__)
# Dossier des images
UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "jpg", "jpeg", "png", "webp", "gif",
    "jfif", "bmp"
}

# Enregistrer une image
def enregistrer_image(fichier):
    if not fichier or not fichier.filename:
        return None

    nom_original = secure_filename(fichier.filename)

    if "." not in nom_original:
        raise ValueError("Format d'image non valide")

    extension = nom_original.rsplit(".", 1)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Format d'image non autorisé : .{extension}"
        )

    nom_unique = f"{uuid4().hex}.{extension}"

    chemin = os.path.join(
        UPLOAD_FOLDER,
        nom_unique
    )

    fichier.save(chemin)

    return nom_unique



# ==========================
# Récupérer les images
# ==========================

def recuperer_images(
    cur,
    actualite_id,
    image_principale
):
    cur.execute("""
        SELECT nom_fichier
        FROM actualite_images
        WHERE actualite_id = %s
        ORDER BY ordre ASC, id ASC
    """, (actualite_id,))

    images = [
        ligne[0]
        for ligne in cur.fetchall()
    ]

    # Compatibilité avec les anciennes actualités
    if (
        image_principale
        and image_principale not in images
    ):
        images.insert(0, image_principale)

    return images


# ==========================
# Formater une actualité
# ==========================

def formater_actualite(cur, ligne):
    images = recuperer_images(
        cur,
        ligne[0],
        ligne[4]
    )

    return {
        "id": ligne[0],
        "titre": ligne[1],
        "description": ligne[2],
        "date": str(ligne[3]),
        "image": ligne[4] or (
            images[0] if images else None
        ),
        "images": images
    }


# ==========================
# GET : Toutes les actualités
# ACCÈS PUBLIC
# ==========================

@actualites_bp.route(
    "/actualites",
    methods=["GET"]
)
def get_actualites():
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT id, titre, description,
                   date_actualite, image
            FROM actualites
            ORDER BY id DESC
        """)

        lignes = cur.fetchall()

        actualites = [
            formater_actualite(cur, ligne)
            for ligne in lignes
        ]

        cur.close()

        return jsonify(actualites)

    finally:
        conn.close()


# ==========================
# GET : Une actualité
# ACCÈS PUBLIC
# ==========================

@actualites_bp.route(
    "/actualites/<int:id>",
    methods=["GET"]
)
def get_actualite(id):
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT id, titre, description,
                   date_actualite, image
            FROM actualites
            WHERE id = %s
        """, (id,))

        ligne = cur.fetchone()

        if ligne is None:
            cur.close()

            return jsonify({
                "message": "Actualité introuvable"
            }), 404

        actualite = formater_actualite(
            cur,
            ligne
        )

        cur.close()

        return jsonify(actualite)

    finally:
        conn.close()
# POST : Ajouter une actualité
@actualites_bp.route(
    "/actualites",
    methods=["POST"]
)
@admin_required
def ajouter_actualite():
    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    fichiers = [
        fichier
        for fichier in request.files.getlist("images")
        if fichier and fichier.filename
    ]
    fichier_unique = request.files.get("image")

    if fichier_unique and fichier_unique.filename:
        fichiers.insert(0, fichier_unique)
    try:
        noms_images = [
            enregistrer_image(fichier)
            for fichier in fichiers
        ]
    except ValueError as erreur:
        return jsonify({
            "message": str(erreur)
        }), 400

    image_principale = (
        noms_images[0]
        if noms_images else None
    )

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO actualites
                (titre, description, date_actualite, image)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (
            titre,
            description,
            date,
            image_principale
        ))

        actualite_id = cur.fetchone()[0]

        for ordre, nom in enumerate(noms_images):
            cur.execute("""
                INSERT INTO actualite_images
                    (actualite_id, nom_fichier, ordre)
                VALUES (%s, %s, %s)
            """, (
                actualite_id,
                nom,
                ordre
            ))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Actualité ajoutée avec succès",
            "id": actualite_id,
            "image": image_principale,
            "images": noms_images
        }), 201

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ==========================
# PUT : Modifier une actualité
# ADMIN UNIQUEMENT
# ==========================

@actualites_bp.route(
    "/actualites/<int:id>",
    methods=["PUT"]
)
@admin_required
def modifier_actualite(id):
    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    # Images anciennes à conserver
    images_a_conserver = request.form.getlist(
        "images_a_conserver"
    )

    # Images nouvelles
    nouveaux_fichiers = [
        fichier
        for fichier in request.files.getlist("images")
        if fichier and fichier.filename
    ]

    # Compatibilité avec l'ancien formulaire
    fichier_unique = request.files.get("image")

    if fichier_unique and fichier_unique.filename:
        nouveaux_fichiers.insert(
            0,
            fichier_unique
        )

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT image
            FROM actualites
            WHERE id = %s
            FOR UPDATE
        """, (id,))

        ligne = cur.fetchone()

        if ligne is None:
            cur.close()

            return jsonify({
                "message": "Actualité introuvable"
            }), 404

        ancienne_image = ligne[0]

        images_existantes = recuperer_images(
            cur,
            id,
            ancienne_image
        )

        # Compatibilité avec l'ancien formulaire
        if "gestion_images" not in request.form:
            images_conservees = images_existantes

        else:
            images_conservees = [
                nom
                for nom in images_existantes
                if nom in images_a_conserver
            ]

        # Enregistrer les nouvelles images
        nouvelles_images = [
            enregistrer_image(fichier)
            for fichier in nouveaux_fichiers
        ]

        # Liste finale des images
        images_finales = (
            images_conservees
            + nouvelles_images
        )

        # Supprimer les anciennes associations
        # sans supprimer les fichiers physiques
        cur.execute("""
            DELETE FROM actualite_images
            WHERE actualite_id = %s
        """, (id,))

        # Enregistrer les images choisies
        for ordre, nom in enumerate(images_finales):
            cur.execute("""
                INSERT INTO actualite_images
                    (actualite_id, nom_fichier, ordre)
                VALUES (%s, %s, %s)
            """, (
                id,
                nom,
                ordre
            ))

        # Définir l'image principale
        image_principale = (
            images_finales[0]
            if images_finales else None
        )

        cur.execute("""
            UPDATE actualites
            SET titre = %s,
                description = %s,
                date_actualite = %s,
                image = %s
            WHERE id = %s
        """, (
            titre,
            description,
            date,
            image_principale,
            id
        ))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Actualité modifiée avec succès",
            "image": image_principale,
            "images": images_finales
        })

    except ValueError as erreur:
        conn.rollback()

        return jsonify({
            "message": str(erreur)
        }), 400

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ==========================
# DELETE : Supprimer une actualité
# ADMIN UNIQUEMENT
# ==========================

@actualites_bp.route(
    "/actualites/<int:id>",
    methods=["DELETE"]
)
@admin_required
def supprimer_actualite(id):
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM actualites
            WHERE id = %s
        """, (id,))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Actualité supprimée avec succès"
        })

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()
