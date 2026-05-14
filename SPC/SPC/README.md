# Slideshow Web Application

A full-featured slideshow web application built using **Flask (Python)**, **PostgreSQL**, and **JavaScript**.
This project allows users to create, customize, save, and run image slideshows with adjustable speed and controls.


## Features

### Authentication

* User registration and login system
* Passwords stored securely using hashing (MD5 in current version)
* Session-based authentication

### Image Selection

* Upload multiple images
* Add/remove images dynamically
* Duplicate images using counter (+ / − buttons)

### Slideshow Customization

* Drag-and-drop image reordering
* Adjustable slideshow speed (in seconds)
* Custom button positioning (drag UI controls)

### Save & Load

* Save slideshow as JSON file
* Load saved slideshows from dashboard
* Import slideshow JSON file
* Download slideshow JSON

###  Slideshow Controls

* Start / Stop autoplay
* Next / Previous navigation
* Fullscreen mode
* Slide counter display

---

## Tech Stack

* **Backend:** Flask (Python)
* **Database:** PostgreSQL (psycopg2)
* **Frontend:** HTML, CSS, JavaScript
* **Storage:** JSON files per user
* **Session Management:** Flask sessions

---

##  Project Structure

```
project/
│
├── app.py                  # Main Flask application
├── templates/             # HTML files
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── index.html
│   ├── preview.html
│   ├── slideshow.html
│   ├── run_slideshow.html
│
├── static/                # CSS & JS
│   ├── style.css
│   ├── script.js
│
├── slideshows/            # User-specific slideshow JSON files
│   └── <username>/
│       └── *.json
│
└── README.md
```

---

## Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/aniketbirdawade/Software-Compression.git
cd project-folder
```

### 2. Install dependencies

```
pip install flask psycopg2
```

### 3. Setup PostgreSQL Database

Create a database:

```sql
CREATE DATABASE gallary;
```

Create users table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
```

### 4. Update Database Credentials

Edit in `app.py`:

```python
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="gallary",
        user="postgres",
        password="your_password"
    )
```

### 5. Run the Application

```
python app.py
```

Open browser:

```
http://127.0.0.1:5000
```

---

## How It Works

1. User logs in / registers
2. Uploads images and selects slideshow images
3. Saves slideshow as JSON
4. Preview page allows:

   * Reordering images
   * Customizing controls
5. Slideshow runs with:

   * Auto-play
   * Manual navigation
   * Speed control

---

## JSON Format

Example slideshow file:

```json
{
  "slideSpeed": 2,
  "images": [
    { "order": 0, "src": "base64-image-data" },
    { "order": 1, "src": "base64-image-data" }
  ]
}
```

---

## Limitations

* Uses MD5 for password hashing (not secure for production)
* Stores images as Base64 (large size)
* Session-based storage (not scalable)

---

## Future Improvements

* Use bcrypt for password hashing
* Store images in file system or cloud (AWS S3)
* Add user profile management
* Improve UI/UX with animations
* Add slideshow themes & transitions

---

## Author

**Aniket Birdawade**
