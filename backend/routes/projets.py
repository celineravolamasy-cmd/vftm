
from flask import Blueprint, jsonify, request
from config import get_connection
from auth_utils import admin_required
from werkzeug.utils import secure_filename
from uuid import uuid4
import os


projets_bp = Blueprint("projets", __name__)


# ==========================
# Dossier des images
# ==========================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "jpg", "jpeg", "jfif", "png", "webp", "gif"
}


# ==========================
# Enregistrer une image
# ==========================

def enregistrer_image(fichier):
    if not fichier or not fichier.filename:
        return None

    nom_original = secure_filename(fichier.filename)

    if "." not in nom_original:
        raise ValueError("Format d'image non valide")

    extension = nom_original.rsplit(".", 1)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Format d'image non autorisé")

    nom_unique = f"{uuid4().hex}.{extension}"

    chemin = os.path.join(UPLOAD_FOLDER, nom_unique)
    fichier.save(chemin)

    return nom_unique


# ==========================
# Récupérer les images
# ==========================

def recuperer_images(cur, projet_id, image_principale):
    cur.execute("""
        SELECT nom_fichier
        FROM projet_images
        WHERE projet_id = %s
        ORDER BY ordre ASC, id ASC
    """, (projet_id,))

    images = [ligne[0] for ligne in cur.fetchall()]

    # Compatibilité avec les anciens projets
    if image_principale and image_principale not in images:
        images.insert(0, image_principale)

    return images


# ==========================
# Formater un projet
# ==========================

def formater_projet(cur, ligne):
    images = recuperer_images(
        cur, ligne[0], ligne[4]
    )

    return {
        "id": ligne[0],
        "titre": ligne[1],
        "description": ligne[2] or "",
        "date": str(ligne[3]) if ligne[3] else "",
        "image": ligne[4] or (
            images[0] if images else None
        ),
        "images": images,
        "objectifs": ligne[5] or "",
        "beneficiaires": ligne[6] or "",
        "zone_intervention": ligne[7] or "",
        "partenaires": ligne[8] or ""
    }


# ==========================
# GET : Tous les projets
# ACCES PUBLIC
# ==========================

@projets_bp.route("/projets", methods=["GET"])
def get_projets():
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT
                id, titre, description,
                date_projet, image, objectifs,
                beneficiaires, zone_intervention,
                partenaires
            FROM projets
            ORDER BY id DESC
        """)

        lignes = cur.fetchall()

        projets = [
            formater_projet(cur, ligne)
            for ligne in lignes
        ]

        cur.close()

        return jsonify(projets)

    finally:
        conn.close()


# ==========================
# GET : Un projet par ID
# ACCES PUBLIC
# ==========================

@projets_bp.route(
    "/projets/<int:id>",
    methods=["GET"]
)
def get_projet(id):
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT
                id, titre, description,
                date_projet, image, objectifs,
                beneficiaires, zone_intervention,
                partenaires
            FROM projets
            WHERE id = %s
        """, (id,))

        ligne = cur.fetchone()

        if ligne is None:
            return jsonify({
                "message": "Projet introuvable"
            }), 404

        projet = formater_projet(cur, ligne)

        cur.close()

        return jsonify(projet)

    finally:
        conn.close()


# ==========================
# POST : Ajouter un projet
# ADMIN UNIQUEMENT
# ==========================

@projets_bp.route(
    "/projets",
    methods=["POST"]
)
@admin_required
def ajouter_projet():
    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    objectifs = request.form.get("objectifs")
    beneficiaires = request.form.get("beneficiaires")
    zone_intervention = request.form.get("zone_intervention")
    partenaires = request.form.get("partenaires")

    if not titre:
        return jsonify({
            "message": "Le titre du projet est obligatoire"
        }), 400

    fichiers = [
        fichier
        for fichier in request.files.getlist("images")
        if fichier and fichier.filename
    ]

    # Compatibilité avec l'ancien formulaire
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
        noms_images[0] if noms_images else None
    )

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO projets (
                titre, description, date_projet,
                image, objectifs, beneficiaires,
                zone_intervention, partenaires
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            titre, description, date,
            image_principale, objectifs,
            beneficiaires, zone_intervention,
            partenaires
        ))

        projet_id = cur.fetchone()[0]

        for ordre, nom in enumerate(noms_images):
            cur.execute("""
                INSERT INTO projet_images
                    (projet_id, nom_fichier, ordre)
                VALUES (%s, %s, %s)
            """, (projet_id, nom, ordre))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Projet ajouté avec succès",
            "id": projet_id,
            "image": image_principale,
            "images": noms_images
        }), 201

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ==========================
# PUT : Modifier un projet
# ADMIN UNIQUEMENT
# ==========================

@projets_bp.route(
    "/projets/<int:id>",
    methods=["PUT"]
)
@admin_required
def modifier_projet(id):
    titre = request.form.get("titre")
    description = request.form.get("description")
    date = request.form.get("date")

    objectifs = request.form.get("objectifs")
    beneficiaires = request.form.get("beneficiaires")
    zone_intervention = request.form.get("zone_intervention")
    partenaires = request.form.get("partenaires")

    if not titre:
        return jsonify({
            "message": "Le titre du projet est obligatoire"
        }), 400

    images_a_conserver = request.form.getlist(
        "images_a_conserver"
    )

    nouveaux_fichiers = [
        fichier
        for fichier in request.files.getlist("images")
        if fichier and fichier.filename
    ]

    # Compatibilité avec l'ancien formulaire
    fichier_unique = request.files.get("image")

    if fichier_unique and fichier_unique.filename:
        nouveaux_fichiers.insert(0, fichier_unique)

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT image
            FROM projets
            WHERE id = %s
            FOR UPDATE
        """, (id,))

        ligne = cur.fetchone()

        if ligne is None:
            return jsonify({
                "message": "Projet introuvable"
            }), 404

        ancienne_image = ligne[0]

        images_existantes = recuperer_images(
            cur, id, ancienne_image
        )

        # Ancien formulaire : conserver les images
        if "gestion_images" not in request.form:
            images_conservees = images_existantes

        else:
            images_conservees = [
                nom
                for nom in images_existantes
                if nom in images_a_conserver
            ]

        try:
            nouvelles_images = [
                enregistrer_image(fichier)
                for fichier in nouveaux_fichiers
            ]

        except ValueError as erreur:
            conn.rollback()

            return jsonify({
                "message": str(erreur)
            }), 400

        images_finales = (
            images_conservees + nouvelles_images
        )

        # Remplacer les associations d'images
        cur.execute("""
            DELETE FROM projet_images
            WHERE projet_id = %s
        """, (id,))

        for ordre, nom in enumerate(images_finales):
            cur.execute("""
                INSERT INTO projet_images
                    (projet_id, nom_fichier, ordre)
                VALUES (%s, %s, %s)
            """, (id, nom, ordre))

        image_principale = (
            images_finales[0]
            if images_finales else None
        )

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
            titre, description, date,
            image_principale, objectifs,
            beneficiaires, zone_intervention,
            partenaires, id
        ))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Projet modifié avec succès",
            "image": image_principale,
            "images": images_finales
        })

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ==========================
# DELETE : Supprimer un projet
# ADMIN UNIQUEMENT
# ==========================

@projets_bp.route(
    "/projets/<int:id>",
    methods=["DELETE"]
)
@admin_required
def supprimer_projet(id):
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM projets
            WHERE id = %s
            RETURNING id
        """, (id,))

        ligne = cur.fetchone()

        if ligne is None:
            conn.rollback()

            return jsonify({
                "message": "Projet introuvable"
            }), 404

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Projet supprimé avec succès"
        })

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()
