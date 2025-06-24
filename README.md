# frexta-backend

**Frexta** is a fullstack client and project management web application built for freelancers and small agencies to help organize their clients, projects, payments, and notes in one place.

This repository contains the **Flask REST API backend** for the Frexta app.

---

## 🔧 Tech Stack

- **Flask** (API Framework)
- **Flask SQLAlchemy** (ORM)
- **Flask Migrate** (Database migrations)
- **Flask-JWT-Extended** (Authentication)
- **Flask-CORS**
- **SQLite** (Local dev) / PostgreSQL (Production)
- **Python Dotenv** (Environment variables)

---

## 📁 Folder Structure

frexta-backend/
├── app/
│ ├── auth/ # Auth logic (register, login)
│ ├── models/ # SQLAlchemy models
│ ├── routes/ # Flask route Blueprints
│ ├── schemas/ # Marshmallow schemas (validation)
│ ├── utils/ # Helper functions
│ ├── config.py # App configuration
│ ├── extensions.py # Extension initialization (db, jwt, etc.)
│ └── init.py # create_app() function
├── .env # Secret keys and DB URL
├── run.py # Entry point
├── requirements.txt # Python dependencies
├── LICENSE
└── README.md


---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/elizabeth-7664/frexta-backend.git
cd frexta-backend

2. Create a Virtual Environment & Install Dependencies

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

3. Set Up Environment Variables

Create a .env file in the root:

DATABASE_URL=sqlite:///frexta.db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

4. Run the Application (for development)

python run.py

The API will be available at: http://127.0.0.1:5000
🔐 Authentication

This project uses JWT (JSON Web Tokens) for user authentication. Tokens are issued on login and are required for accessing protected routes.
🧪 API Features (MVP)
Feature	Method	Endpoint
Register	POST	/register
Login	POST	/login
Create Client	POST	/clients
Get Clients	GET	/clients
Update Client	PATCH	/clients/<id>
Delete Client	DELETE	/clients/<id>
Add Project	POST	/projects
Log Payment	POST	/payments
Add Notes	POST	/notes

✅ More endpoints are added as the project evolves.
🌐 Deployment

    Frontend: Netlify

    Backend: Render or Railway

    Database (prod): PostgreSQL

📄 License

This project is licensed under the MIT License.
🤝 Collaborators

    [Lewis  Robert  Nakhungu] (Backend & Architecture)

    [Elizabeth Ndinda] (Frontend & UI/UX)

🧠 Purpose

Built as a Phase 4 Final Project at Moringa School, demonstrating fullstack skills in building modern, scalable web applications using Flask + React.
