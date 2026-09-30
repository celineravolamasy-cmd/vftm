from flask import Blueprint, jsonify
from config import get_connection

dashboard_bp = Blueprint("dashboard", __name__)


# ==========================
# Statistiques Dashboard
# ==========================

@dashboard_bp.route("/dashboard/stats", methods=["GET"])
def get_stats():

    conn = get_connection()
    cur = conn.cursor()

    # Nombre d'actualités
    cur.execute("SELECT COUNT(*) FROM actualites")
    actualites = cur.fetchone()[0]

    # Nombre de projets
    cur.execute("SELECT COUNT(*) FROM projets")
    projets = cur.fetchone()[0]

    # Nombre de messages
    cur.execute("SELECT COUNT(*) FROM messages")
    messages = cur.fetchone()[0]

    # Nombre de partenaires
    partenaires = 0

    # ==========================
    # Dernières activités
    # ==========================

    cur.execute("""
        SELECT
            date_actualite AS date_action,
            'Nouvelle actualité' AS action,
            titre AS element
        FROM actualites

        UNION ALL

        SELECT
            date_projet AS date_action,
            'Nouveau projet' AS action,
            titre AS element
        FROM projets

        UNION ALL

        SELECT
            date_message AS date_action,
            'Nouveau message' AS action,
            sujet AS element
        FROM messages

        ORDER BY date_action DESC
        LIMIT 10
    """)

    rows = cur.fetchall()

    activites = []

    for row in rows:

        date_action = row[0]

        # ==========================
        # Format professionnel
        # ==========================

        if date_action:

            if row[1] == "Nouveau message":
                date_formatee = date_action.strftime(
                    "%d/%m/%Y à %H:%M:%S"
                )
            else:
                date_formatee = date_action.strftime(
                    "%d/%m/%Y"
                )

        else:
            date_formatee = ""

        activites.append({
            "date": date_formatee,
            "action": row[1],
            "element": row[2]
        })

    cur.close()
    conn.close()

    return jsonify({
        "actualites": actualites,
        "projets": projets,
        "partenaires": partenaires,
        "messages": messages,
        "activites": activites
    })