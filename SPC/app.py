from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.utils import secure_filename
import psycopg2
import os
import json

app = Flask(__name__)
app.secret_key = "secret123"


# ---------- DB ----------
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="gallary",
        user="postgres",
        password="Aniket1773"
    )


# ---------- HOME ----------
@app.route("/")
def home():
    return redirect(url_for("login"))


# ---------- LOGIN ----------
@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM users WHERE username=%s AND password=md5(%s)",
            (username, password)
            )
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            session["user"] = username
            return redirect(url_for("dashboard"))
        else:
            error = "Invalid username or password"

    return render_template("login.html", error=error)


# ---------- REGISTER ----------
@app.route("/register", methods=["GET", "POST"])
def register():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO users (username, password) VALUES (%s, md5(%s))",
                (username, password)
            )
            conn.commit()
            return redirect(url_for("login"))
        except:
            error = "Username already exists"
        finally:
            cur.close()
            conn.close()

    return render_template("register.html", error=error)


# ---------- LOGOUT ----------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------- DASHBOARD ----------
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login"))

    user_folder = os.path.join("slideshows", session["user"])
    os.makedirs(user_folder, exist_ok=True)
    files = [f for f in os.listdir(user_folder) if f.endswith(".json")]
    return render_template("dashboard.html", files=files)

# ---------- CREATE CATEGORY ----------
@app.route("/create-category", methods=["POST"])
def create_category():

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    req = request.get_json()

    category = req.get("category", "").strip()

    if not category:
        return jsonify({"error": "Category required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:

        # Save in DB
        cur.execute(
            "INSERT INTO categories (name) VALUES (%s)",
            (category,)
        )

        conn.commit()

        # Create folder automatically
        folder_path = os.path.join(
            "static",
            "gallery",
            category.lower()
        )

        os.makedirs(folder_path, exist_ok=True)

        return jsonify({"ok": True})

    except Exception as e:

        conn.rollback()

        return jsonify({
            "error": "Category already exists"
        }), 400

    finally:
        cur.close()
        conn.close()


# ---------- INDEX (Image Selector) ----------
@app.route("/index")
def index():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("index.html")


# ---------- SAVE IMAGES → go to preview ----------
@app.route("/save", methods=["POST"])
def save():
    if "user" not in session:
        return "Unauthorized", 401

    req = request.get_json()
    filename = req.get("filename")
    data = req.get("data")

    if not filename or not data:
        return "Invalid data", 400

    user_folder = os.path.join("slideshows", session["user"])
    os.makedirs(user_folder, exist_ok=True)
    path = os.path.join(user_folder, filename)

    with open(path, "w") as f:
        json.dump(data, f, indent=2)

    return jsonify({"ok": True, "filename": filename})


# ---------- PREVIEW ----------
@app.route("/preview")
def preview():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("preview.html")


# ---------- SLIDESHOW (from preview, uses localStorage) ----------
@app.route("/slideshow")
def slideshow():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("slideshow.html")


# ---------- RUN saved JSON ----------
@app.route("/run/<filename>")
def run(filename):
    if "user" not in session:
        return redirect(url_for("login"))

    path = os.path.join("slideshows", session["user"], filename)
    if not os.path.exists(path):
        return "File not found", 404

    # Store only the filename — not the full base64 data (too large for session cookie)
    session["runFile"] = filename

    return redirect(url_for("run_slideshow"))


# ---------- RUN SLIDESHOW (session-based) ----------
@app.route("/run-slideshow")
def run_slideshow():
    if "user" not in session:
        return redirect(url_for("login"))

    filename = session.get("runFile")
    if not filename:
        return redirect(url_for("dashboard"))

    path = os.path.join("slideshows", session["user"], filename)
    if not os.path.exists(path):
        return redirect(url_for("dashboard"))

    with open(path) as f:
        data = json.load(f)

    # Pass data directly to template via render_template (not session)
    images = data.get("images", [])
    speed = data.get("slideSpeed", 2)

    return render_template("run_slideshow.html", images=images, speed=speed)


# ---------- DELETE ----------
@app.route("/delete/<filename>")
def delete(filename):
    if "user" not in session:
        return redirect(url_for("login"))

    path = os.path.join("slideshows", session["user"], filename)
    if os.path.exists(path):
        os.remove(path)

    return redirect(url_for("dashboard"))


# ---------- IMPORT JSON → go to preview ----------
@app.route("/import-json", methods=["POST"])
def import_json():
    if "user" not in session:
        return "Unauthorized", 401

    req = request.get_json()
    images = req.get("images", [])
    speed = req.get("slideSpeed", 2)

    session["previewImages"] = images
    session["previewSpeed"] = speed

    return jsonify({"ok": True})

@app.route("/download/<filename>")
def download(filename):
    if "user" not in session:
        return "Unauthorized", 401

    path = os.path.join("slideshows", session["user"], filename)
    if not os.path.exists(path):
        return "File not found", 404

    with open(path) as f:
        data = json.load(f)

    return jsonify(data)    

# ---------- GET GALLERY ----------
@app.route("/get-gallery")
def get_gallery():

    if "user" not in session:
        return jsonify({})

    gallery = {}

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT name FROM categories")

    categories = cur.fetchall()

    cur.close()
    conn.close()

    for row in categories:

        category = row[0]

        category_path = os.path.join(
            "static",
            "gallery",
            category.lower()
        )

        images = []

        if os.path.exists(category_path):

            for file in os.listdir(category_path):

                if file.lower().endswith((
                    ".png",
                    ".jpg",
                    ".jpeg",
                    ".gif",
                    ".webp"
                )):

                    image_path = (
                        f"/static/gallery/"
                        f"{category.lower()}/{file}"
                    )

                    images.append(image_path)

        gallery[category] = images

    return jsonify(gallery)

#--------------------------

@app.route("/upload-category-images", methods=["POST"])
def upload_category_images():

    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    category = request.form.get("category")

    if not category:
        return jsonify({"error": "Category required"}), 400

    files = request.files.getlist("images")

    if not files:
        return jsonify({"error": "No images uploaded"}), 400

    folder_path = os.path.join(
        "static",
        "gallery",
        category.lower()
    )

    os.makedirs(folder_path, exist_ok=True)

    for file in files:

        filename = secure_filename(file.filename)

        save_path = os.path.join(
            folder_path,
            filename
        )

        file.save(save_path)

    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True)