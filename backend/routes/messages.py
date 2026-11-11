
from flask import Blueprint, jsonify, request
from config import get_connection
from auth_utils import admin_required


messages_bp = Blueprint("messages", __name__)


# ==========================
# Envoyer un message
# ACCES PUBLIC
# ==========================

@messages_bp.route("/messages", methods=["POST"])
def ajouter_message():

    data = request.get_json(silent=True) or {}

    nom = data.get("nom")
    email = data.get("email")
    sujet = data.get("sujet")
    message = data.get("message")

    if not nom or not email or not sujet or not message:
        return jsonify({
            "message": "Tous les champs sont obligatoires"
        }), 400

    conn = get_connection()
    cur = conn.cursor()

    try:
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

        return jsonify({
            "message": "Message envoyé avec succès"
        }), 201

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()


# ==========================
# Récupérer tous les messages
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
# Récupérer un message par ID
# ADMIN UNIQUEMENT
# ==========================

@messages_bp.route(
    "/messages/<int:id>",
    methods=["GET"]
)
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
# Supprimer un message
# ADMIN UNIQUEMENT
# ==========================

@messages_bp.route(
    "/messages/<int:id>",
    methods=["DELETE"]
)
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
