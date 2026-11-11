
from functools import wraps
from flask import session, jsonify


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if (
            not session.get("user_id")
            or session.get("role") != "admin"
        ):
            return jsonify({
                "success": False,
                "message": "Accès non autorisé"
            }), 401

        return f(*args, **kwargs)

    return decorated_function

from functools import wraps
from flask import session, jsonify


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if (
            not session.get("user_id")
            or session.get("role") != "admin"
        ):
            return jsonify({
                "success": False,
                "message": "Accès non autorisé"
            }), 401

        return f(*args, **kwargs)

    return decorated_function

from functools import wraps
from flask import session, jsonify


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if (
            not session.get("user_id")
            or session.get("role") != "admin"
        ):
            return jsonify({
                "success": False,
                "message": "Accès non autorisé"
            }), 401

        return f(*args, **kwargs)

    return decorated_function

from functools import wraps
from flask import session, jsonify


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if (
            not session.get("user_id")
            or session.get("role") != "admin"
        ):
            return jsonify({
                "success": False,
                "message": "Accès non autorisé"
            }), 401

        return f(*args, **kwargs)

    return decorated_function
