from flask import Blueprint, jsonify, request
from config import get_connection

messages_bp = Blueprint("messages", __name__)


# ==========================
# Envoyer un message
# ==========================

@messages_bp.route("/messages", methods=["POST"])
def ajouter_message():

    data = request.get_json()

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

    cur.close()
    conn.close()

    return jsonify({
        "message": "Message envoyé avec succès"
    }), 201


# ==========================
# Récupérer tous les messages
# ==========================

@messages_bp.route("/messages", methods=["GET"])
def get_messages():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nom, email, sujet, message, date_message
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
            "date": row[5].strftime("%d/%m/%Y à %H:%M:%S")
                if row[5] else ""
        })

    cur.close()
    conn.close()

    return jsonify(messages)


# ==========================
# Récupérer un message par ID
# ==========================

@messages_bp.route("/messages/<int:id>", methods=["GET"])
def get_message(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nom, email, sujet, message, date_message
        FROM messages
        WHERE id = %s
    """, (id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

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
        "date": row[5].strftime("%d/%m/%Y à %H:%M:%S")
            if row[5] else ""
    })


# ==========================
# Supprimer un message
# ==========================

@messages_bp.route("/messages/<int:id>", methods=["DELETE"])
def supprimer_message(id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM messages
        WHERE id = %s
    """, (id,))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Message supprimé avec succès"
    })