
from flask import Blueprint, jsonify, request
from config import get_connection
from auth_utils import admin_required
from werkzeug.utils import secure_filename

import cloudinary
import cloudinary.uploader
import os


actualites_bp = Blueprint("actualites", __name__)


# ==========================================
# CONFIGURATION CLOUDINARY
# ==========================================

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)


ALLOWED_EXTENSIONS = {
    "jpg", "jpeg", "png", "webp", "gif",
    "jfif", "bmp"
}


# ==========================================
# VERIFIER LA CONFIGURATION CLOUDINARY
# ==========================================

def verifier_cloudinary():
    if not all([
        os.environ.get("CLOUDINARY_CLOUD_NAME"),
        os.environ.get("CLOUDINARY_API_KEY"),
        os.environ.get("CLOUDINARY_API_SECRET")
    ]):
        raise RuntimeError("Configuration Cloudinary manquante.")


# ==========================================
# ENREGISTRER UNE IMAGE SUR CLOUDINARY
# ==========================================

def enregistrer_image(fichier):

    if not fichier or not fichier.filename:
        return None

    nom_original = secure_filename(fichier.filename)

    if "." not in nom_original:
        raise ValueError("Format d'image non valide.")

    extension = nom_original.rsplit(".", 1)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Format d'image non autorisé : .{extension}"
        )

    verifier_cloudinary()

    resultat = cloudinary.uploader.upload(
        fichier.stream,
        folder="vftm/actualites",
        resource_type="image"
    )

    url_image = resultat.get("secure_url")

    if not url_image:
        raise RuntimeError("Cloudinary n'a pas retourné l'URL de l'image.")

    return url_image


# ==========================================
# RECUPERER LES IMAGES D'UNE ACTUALITE
# ==========================================

def recuperer_images(cur, actualite_id, image_principale):

    cur.execute("""
        SELECT nom_fichier
        FROM actualite_images
        WHERE actualite_id = %s
        ORDER BY ordre ASC, id ASC
    """, (actualite_id,))

    images = [ligne[0] for ligne in cur.fetchall()]

    if image_principale and image_principale not in images:
        images.insert(0, image_principale)

    return images


# ==========================================
# FORMATER UNE ACTUALITE
# ==========================================

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


# ==========================================
# GET : TOUTES LES ACTUALITES
# ACCES PUBLIC
# ==========================================

@actualites_bp.route("/actualites", methods=["GET"])
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

        return jsonify(actualites), 200

    finally:
        conn.close()


# ==========================================
# GET : UNE ACTUALITE
# ACCES PUBLIC
# ==========================================

@actualites_bp.route("/actualites/<int:id>", methods=["GET"])
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
                "message": "Actualité introuvable."
            }), 404

        actualite = formater_actualite(cur, ligne)

        cur.close()

        return jsonify(actualite), 200

    finally:
        conn.close()


# ==========================================
# POST : AJOUTER UNE ACTUALITE
# ADMIN UNIQUEMENT
# ==========================================

@actualites_bp.route("/actualites", methods=["POST"])
@admin_required
def ajouter_actualite():

    titre = request.form.get("titre", "").strip()
    description = request.form.get("description", "").strip()
    date = request.form.get("date")

    if not titre or not description or not date:
        return jsonify({
            "message": "Veuillez remplir tous les champs obligatoires."
        }), 400

    fichiers = [
        f for f in request.files.getlist("images")
        if f and f.filename
    ]

    fichier_unique = request.files.get("image")

    if fichier_unique and fichier_unique.filename:
        fichiers.insert(0, fichier_unique)

    # Envoyer les images vers Cloudinary
    try:
        noms_images = []

        for fichier in fichiers:
            url = enregistrer_image(fichier)

            if url:
                noms_images.append(url)

    except ValueError as erreur:
        return jsonify({
            "message": str(erreur)
        }), 400

    except Exception as erreur:
        print("Erreur Cloudinary :", erreur)

        return jsonify({
            "message": "Erreur lors de l'envoi des images vers Cloudinary. Vérifiez la configuration."
        }), 502

    image_principale = (
        noms_images[0] if noms_images else None
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

        for ordre, url in enumerate(noms_images):
            cur.execute("""
                INSERT INTO actualite_images
                    (actualite_id, nom_fichier, ordre)
                VALUES (%s, %s, %s)
            """, (
                actualite_id,
                url,
                ordre
            ))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Actualité ajoutée avec succès.",
            "id": actualite_id,
            "image": image_principale,
            "images": noms_images
        }), 201

    except Exception as erreur:
        conn.rollback()
        print("Erreur ajout actualité :", erreur)

        return jsonify({
            "message": "Erreur lors de l'enregistrement de l'actualité dans la base de données."
        }), 500

    finally:
        conn.close()


# ==========================================
# PUT : MODIFIER UNE ACTUALITE
# ADMIN UNIQUEMENT
# ==========================================

@actualites_bp.route("/actualites/<int:id>", methods=["PUT"])
@admin_required
def modifier_actualite(id):

    titre = request.form.get("titre", "").strip()
    description = request.form.get("description", "").strip()
    date = request.form.get("date")

    if not titre or not description or not date:
        return jsonify({
            "message": "Veuillez remplir tous les champs obligatoires."
        }), 400

    images_a_conserver = request.form.getlist(
        "images_a_conserver"
    )

    nouveaux_fichiers = [
        f for f in request.files.getlist("images")
        if f and f.filename
    ]

    fichier_unique = request.files.get("image")

    if fichier_unique and fichier_unique.filename:
        nouveaux_fichiers.insert(0, fichier_unique)

    conn = get_connection()

    try:
        cur = conn.cursor()

        # Vérifier que l'actualité existe
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
                "message": "Actualité introuvable."
            }), 404

        ancienne_image = ligne[0]

        # Récupérer les anciennes images
        images_existantes = recuperer_images(
            cur,
            id,
            ancienne_image
        )

        # Déterminer les images à conserver
        if "gestion_images" not in request.form:

            images_conservees = images_existantes

        else:

            images_conservees = [
                image
                for image in images_existantes
                if image in images_a_conserver
            ]

        # Envoyer les nouvelles images vers Cloudinary
        try:
            nouvelles_images = []

            for fichier in nouveaux_fichiers:
                url = enregistrer_image(fichier)

                if url:
                    nouvelles_images.append(url)

        except ValueError as erreur:
            conn.rollback()

            return jsonify({
                "message": str(erreur)
            }), 400

        except Exception as erreur:
            conn.rollback()
            print("Erreur Cloudinary :", erreur)

            return jsonify({
                "message": "Erreur lors de l'envoi des nouvelles images vers Cloudinary."
            }), 502

        # Combiner les images conservées et les nouvelles
        images_finales = images_conservees + nouvelles_images

        # Supprimer les anciennes références dans la table images
        cur.execute("""
            DELETE FROM actualite_images
            WHERE actualite_id = %s
        """, (id,))

        # Réenregistrer les images dans le bon ordre
        for ordre, url in enumerate(images_finales):

            cur.execute("""
                INSERT INTO actualite_images
                    (actualite_id, nom_fichier, ordre)
                VALUES (%s, %s, %s)
            """, (
                id,
                url,
                ordre
            ))

        image_principale = (
            images_finales[0] if images_finales else None
        )

        # Mettre à jour l'actualité
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
            "message": "Actualité modifiée avec succès.",
            "image": image_principale,
            "images": images_finales
        }), 200

    except Exception as erreur:
        conn.rollback()
        print("Erreur modification actualité :", erreur)

        return jsonify({
            "message": "Erreur lors de la modification de l'actualité."
        }), 500

    finally:
        conn.close()


# ==========================================
# DELETE : SUPPRIMER UNE ACTUALITE
# ADMIN UNIQUEMENT
# ==========================================

@actualites_bp.route("/actualites/<int:id>", methods=["DELETE"])
@admin_required
def supprimer_actualite(id):

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM actualites
            WHERE id = %s
        """, (id,))

        if cur.rowcount == 0:
            conn.rollback()
            cur.close()

            return jsonify({
                "message": "Actualité introuvable."
            }), 404

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Actualité supprimée avec succès."
        }), 200

    except Exception as erreur:
        conn.rollback()
        print("Erreur suppression actualité :", erreur)

        return jsonify({
            "message": "Erreur lors de la suppression de l'actualité."
        }), 500

    finally:
        conn.close()
