from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect("notes.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/notes", methods=["GET"])
def get_notes():
    conn = get_db()
    notes = conn.execute(
        "SELECT * FROM notes ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(note) for note in notes])

@app.route("/api/notes", methods=["POST"])
def save_note():
    data = request.get_json()

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if not title or not content:
        return jsonify({"error": "Enter title and content"}), 400

    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO notes (title, content) VALUES (?, ?)",
        (title, content)
    )

    conn.commit()
    note_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "id": note_id,
        "title": title,
        "content": content
    }), 201

@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    cursor = conn.execute(
        "DELETE FROM notes WHERE id = ?",
        (note_id,)
    )
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({"message": "Note deleted successfully"})
init_db()

if __name__ == "__main__":
    app.run(debug=True)
