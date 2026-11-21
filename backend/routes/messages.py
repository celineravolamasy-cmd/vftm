
import os
import smtplib
import logging

from email.message import EmailMessage
from flask import Blueprint, jsonify, request
from config import get_connection
from auth_utils import admin_required


messages_bp = Blueprint("messages", __name__)

logging.basicConfig(level=logging.INFO)


# ==========================
# FANDefasana EMAIL
# ==========================

def envoyer_email(nom, email_client, sujet, message_client):

    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_login = os.getenv("SMTP_LOGIN")
    smtp_password = os.getenv("SMTP_PASSWORD")

    expediteur = os.getenv("EMAIL_EXPEDITEUR")
    destinataire = os.getenv("EMAIL_DESTINATAIRE")

    if not all([
        smtp_server,
        smtp_login,
        smtp_password,
        expediteur,
        destinataire
    ]):
        raise ValueError("Configuration SMTP incomplète")

    email = EmailMessage()

    email["Subject"] = "Nouveau message depuis le site VFTM"
    email["From"] = f"VFTM - Site web <{expediteur}>"
    email["To"] = destinataire
    email["Reply-To"] = email_client

    email.set_content(f"""
Vous avez reçu un nouveau message depuis le site web du VFTM.

Nom : {nom}
Email : {email_client}
Sujet : {sujet}

Message :
{message_client}
""")

    with smtplib.SMTP(smtp_server, smtp_port, timeout=20) as serveur:
        serveur.starttls()
        serveur.login(smtp_login, smtp_password)
        serveur.send_message(email)


# ==========================
# ENVOYER UN MESSAGE
# ACCES PUBLIC
# ==========================

@messages_bp.route("/messages", methods=["POST"])
def ajouter_message():

    data = request.get_json(silent=True) or {}

    nom = data.get("nom")
    email = data.get("email")
    sujet = data.get("sujet")
    message = data.get("message")

    if not all([
        isinstance(nom, str) and nom.strip(),
        isinstance(email, str) and email.strip(),
        isinstance(sujet, str) and sujet.strip(),
        isinstance(message, str) and message.strip()
    ]):
        return jsonify({
            "message": "Tous les champs sont obligatoires"
        }), 400

    nom = nom.strip()
    email = email.strip()
    sujet = sujet.strip()
    message = message.strip()

    conn = get_connection()
    cur = conn.cursor()

    try:
        # Enregistrement dans PostgreSQL
        cur.execute("""
            INSERT INTO messages
                (nom, email, sujet, message)
            VALUES (%s, %s, %s, %s)
        """, (
            nom,
            email,
            sujet,
            message
        ))

        conn.commit()

    except Exception:
        conn.rollback()
        logging.exception("Erreur lors de l'enregistrement du message")

        return jsonify({
            "message": "Impossible d'enregistrer votre message."
        }), 500

    finally:
        cur.close()
        conn.close()

    # Envoi de la notification par email
    try:
        envoyer_email(nom, email, sujet, message)

        return jsonify({
            "message": "Votre message a été envoyé avec succès.",
            "email_envoye": True
        }), 201

    except Exception:
        logging.exception("Erreur lors de l'envoi de l'email")

        return jsonify({
            "message": "Votre message est bien enregistré. Toutefois, la notification par email n'a pas pu être envoyée.",
            "email_envoye": False
        }), 201


# ==========================
# RECUPERER TOUS LES MESSAGES
# ADMIN UNIQUEMENT
# ==========================

@messages_bp.route("/messages", methods=["GET"])
@admin_required
def get_messages():

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT
                id,
                nom,
                email,
                sujet,
                message,
                date_message
            FROM messages
            ORDER BY id DESC
        """)

        rows = cur.fetchall()

        messages = []

        for row in rows:
            messages.append({
                "id": row[0],
                "nom": row[1],
                "email": row[2],
                "sujet": row[3],
                "message": row[4],
                "date": (
                    row[5].strftime("%d/%m/%Y à %H:%M:%S")
                    if row[5] else ""
                )
            })

        return jsonify(messages)

    finally:
        cur.close()
        conn.close()


# ==========================
# RECUPERER UN MESSAGE PAR ID
# ADMIN UNIQUEMENT
# ==========================

@messages_bp.route("/messages/<int:id>", methods=["GET"])
@admin_required
def get_message(id):

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT
                id,
                nom,
                email,
                sujet,
                message,
                date_message
            FROM messages
            WHERE id = %s
        """, (id,))

        row = cur.fetchone()

        if row is None:
            return jsonify({
                "message": "Message introuvable"
            }), 404

        return jsonify({
            "id": row[0],
            "nom": row[1],
            "email": row[2],
            "sujet": row[3],
            "message": row[4],
            "date": (
                row[5].strftime("%d/%m/%Y à %H:%M:%S")
                if row[5] else ""
            )
        })

    finally:
        cur.close()
        conn.close()


# ==========================
# SUPPRIMER UN MESSAGE
# ADMIN UNIQUEMENT
# ==========================

@messages_bp.route("/messages/<int:id>", methods=["DELETE"])
@admin_required
def supprimer_message(id):

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            DELETE FROM messages
            WHERE id = %s
            RETURNING id
        """, (id,))

        row = cur.fetchone()

        if row is None:
            conn.rollback()

            return jsonify({
                "message": "Message introuvable"
            }), 404

        conn.commit()

        return jsonify({
            "message": "Message supprimé avec succès"
        })

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()
