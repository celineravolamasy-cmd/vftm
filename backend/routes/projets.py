
from flask import Blueprint, jsonify, request
from config import get_connection
from auth_utils import admin_required
from werkzeug.utils import secure_filename

import cloudinary
import cloudinary.uploader
import os


projets_bp = Blueprint("projets", __name__)


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
    "jpg", "jpeg", "jfif", "png", "webp", "gif", "bmp"
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
        folder="vftm/projets",
        resource_type="image"
    )

    url_image = resultat.get("secure_url")

    if not url_image:
        raise RuntimeError(
            "Cloudinary n'a pas retourné l'URL de l'image."
        )

    return url_image


# ==========================================
# RECUPERER LES IMAGES D'UN PROJET
# ==========================================

def recuperer_images(cur, projet_id, image_principale):

    cur.execute("""
        SELECT nom_fichier
        FROM projet_images
        WHERE projet_id = %s
        ORDER BY ordre ASC, id ASC
    """, (projet_id,))

    images = [ligne[0] for ligne in cur.fetchall()]

    if image_principale and image_principale not in images:
        images.insert(0, image_principale)

    return images


# ==========================================
# FORMATER UN PROJET
# ==========================================

def formater_projet(cur, ligne):

    images = recuperer_images(
        cur,
        ligne[0],
        ligne[4]
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


# ==========================================
# GET : TOUS LES PROJETS
# ACCES PUBLIC
# ==========================================

@projets_bp.route("/projets", methods=["GET"])
def get_projets():

    conn = get_connection()

    try:
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

        lignes = cur.fetchall()

        projets = [
            formater_projet(cur, ligne)
            for ligne in lignes
        ]

        cur.close()

        return jsonify(projets), 200

    finally:
        conn.close()


# ==========================================
# GET : UN PROJET
# ACCES PUBLIC
# ==========================================

@projets_bp.route("/projets/<int:id>", methods=["GET"])
def get_projet(id):

    conn = get_connection()

    try:
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

        ligne = cur.fetchone()

        if ligne is None:
            cur.close()

            return jsonify({
                "message": "Projet introuvable."
            }), 404

        projet = formater_projet(cur, ligne)

        cur.close()

        return jsonify(projet), 200

    finally:
        conn.close()


# ==========================================
# POST : AJOUTER UN PROJET
# ADMIN UNIQUEMENT
# ==========================================

@projets_bp.route("/projets", methods=["POST"])
@admin_required
def ajouter_projet():

    titre = request.form.get("titre", "").strip()
    description = request.form.get("description", "").strip()
    date = request.form.get("date")

    objectifs = request.form.get("objectifs", "")
    beneficiaires = request.form.get("beneficiaires", "")
    zone_intervention = request.form.get("zone_intervention", "")
    partenaires = request.form.get("partenaires", "")

    if not titre:
        return jsonify({
            "message": "Le titre du projet est obligatoire."
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
            INSERT INTO projets (
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
            RETURNING id
        """, (
            titre,
            description,
            date,
            image_principale,
            objectifs,
            beneficiaires,
            zone_intervention,
            partenaires
        ))

        projet_id = cur.fetchone()[0]

        for ordre, url in enumerate(noms_images):

            cur.execute("""
                INSERT INTO projet_images (
                    projet_id,
                    nom_fichier,
                    ordre
                )
                VALUES (%s, %s, %s)
            """, (
                projet_id,
                url,
                ordre
            ))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Projet ajouté avec succès.",
            "id": projet_id,
            "image": image_principale,
            "images": noms_images
        }), 201

    except Exception as erreur:
        conn.rollback()
        print("Erreur ajout projet :", erreur)

        return jsonify({
            "message": "Erreur lors de l'enregistrement du projet dans la base de données."
        }), 500

    finally:
        conn.close()


# ==========================================
# PUT : MODIFIER UN PROJET
# ADMIN UNIQUEMENT
# ==========================================

@projets_bp.route("/projets/<int:id>", methods=["PUT"])
@admin_required
def modifier_projet(id):

    titre = request.form.get("titre", "").strip()
    description = request.form.get("description", "").strip()
    date = request.form.get("date")

    objectifs = request.form.get("objectifs", "")
    beneficiaires = request.form.get("beneficiaires", "")
    zone_intervention = request.form.get("zone_intervention", "")
    partenaires = request.form.get("partenaires", "")

    if not titre:
        return jsonify({
            "message": "Le titre du projet est obligatoire."
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

        # Vérifier que le projet existe
        cur.execute("""
            SELECT image
            FROM projets
            WHERE id = %s
            FOR UPDATE
        """, (id,))

        ligne = cur.fetchone()

        if ligne is None:
            cur.close()

            return jsonify({
                "message": "Projet introuvable."
            }), 404

        ancienne_image = ligne[0]

        # Récupérer les images existantes
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

        # Combiner les anciennes et les nouvelles images
        images_finales = images_conservees + nouvelles_images

        # Supprimer les anciennes références
        cur.execute("""
            DELETE FROM projet_images
            WHERE projet_id = %s
        """, (id,))

        # Enregistrer les images finales
        for ordre, url in enumerate(images_finales):

            cur.execute("""
                INSERT INTO projet_images (
                    projet_id,
                    nom_fichier,
                    ordre
                )
                VALUES (%s, %s, %s)
            """, (
                id,
                url,
                ordre
            ))

        image_principale = (
            images_finales[0] if images_finales else None
        )

        # Mettre à jour le projet
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
            image_principale,
            objectifs,
            beneficiaires,
            zone_intervention,
            partenaires,
            id
        ))

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Projet modifié avec succès.",
            "image": image_principale,
            "images": images_finales
        }), 200

    except Exception as erreur:
        conn.rollback()
        print("Erreur modification projet :", erreur)

        return jsonify({
            "message": "Erreur lors de la modification du projet."
        }), 500

    finally:
        conn.close()


# ==========================================
# DELETE : SUPPRIMER UN PROJET
# ADMIN UNIQUEMENT
# ==========================================

@projets_bp.route("/projets/<int:id>", methods=["DELETE"])
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
            cur.close()

            return jsonify({
                "message": "Projet introuvable."
            }), 404

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Projet supprimé avec succès."
        }), 200

    except Exception as erreur:
        conn.rollback()
        print("Erreur suppression projet :", erreur)

        return jsonify({
            "message": "Erreur lors de la suppression du projet."
        }), 500

    finally:
        conn.close()
