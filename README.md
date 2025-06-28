# ClientConnect API

**ClientConnect** is an async FastAPI backend designed to manage clients, projects, payments, notes, and dashboard analytics. It uses JWT-based authentication, PostgreSQL for data persistence, and Alembic for migrations.

## 🚀 Features

* ✅ JWT authentication (register/login/reset password)
* ✅ PostgreSQL with SQLAlchemy ORM (async)
* ✅ Dashboard analytics (KPIs and activity feed)
* ✅ Modular route structure (clients, projects, payments, notes)
* ✅ Pydantic v2 schemas and validation
* ✅ CORS support for frontend integration (React)
* ✅ Fully async, scalable, and production-ready

## 🧰 Tech Stack

| Category   | Tech Stack                          |
| ---------- | ----------------------------------- |
| Backend    | FastAPI                             |
| Database   | PostgreSQL 16.9                     |
| ORM        | SQLAlchemy (async)                  |
| Migrations | Alembic                             |
| Auth       | JWT (python-jose), bcrypt (passlib) |
| Validation | Pydantic Settings                   |
| Server     | Uvicorn                             |

---

## 🖥️ Prerequisites

* Python 3.10+
* PostgreSQL 16.9
* pip + virtualenv
* Git

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/clientconnect-backend.git
cd clientconnect-backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure PostgreSQL

Ensure PostgreSQL is running on port `5433`. Update these files if needed:

* `/etc/postgresql/16/main/postgresql.conf`:

  ```
  port = 5433
  listen_addresses = 'localhost'
  ```
* `/etc/postgresql/16/main/pg_hba.conf`:

  ```
  host    all             all             127.0.0.1/32            md5
  ```

Then restart:

```bash
sudo systemctl restart postgresql
```

### 5. Create database and user

```bash
sudo -u postgres psql -p 5433
```

Inside the psql shell:

```sql
CREATE DATABASE frexta_db;
CREATE USER myuser WITH PASSWORD 'securepassword123';
ALTER DATABASE frexta_db OWNER TO myuser;
GRANT ALL PRIVILEGES ON DATABASE frexta_db TO myuser;
```

---

### 6. Configure environment variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql+asyncpg://myuser:securepassword123@localhost:5433/frexta_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

### 7. Run migrations

If you haven't already:

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

### 8. Start the development server

```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🔀 API Endpoints

### Auth Routes (`/api`)

* `POST /api/register`
* `POST /api/login`
* `POST /api/forgot-password`
* `POST /api/reset-password`

### Core Resources

* `GET /api/clients`
* `GET /api/projects`
* `GET /api/payments`
* `GET /api/notes`
* `GET /api/users`

### Dashboard

* `GET /api/dashboard/kpis`
* `GET /api/dashboard/activities`

---

## 🗂️ Project Structure

```
frexta-backend/
├── app/
│   ├── api/
│   │   ├── authy.py
│   │   ├── users.py
│   │   ├── clients.py
│   │   ├── projects.py
│   │   ├── payments.py
│   │   ├── notes.py
│   │   └── dashboard.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   ├── schemas/
│   ├── main.py
├── migrations/
├── .env
├── alembic.ini
├── requirements.txt
```

---

## 🐛 Troubleshooting

### `ModuleNotFoundError`

```bash
pip install -r requirements.txt
```

### Alembic errors

```bash
alembic -x loglevel=DEBUG revision --autogenerate -m "fix migration"
```

### PostgreSQL issues

```bash
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 👥 Contributing

1. Fork the project
2. Create a new branch: `git checkout -b feature/xyz`
3. Commit changes: `git commit -m "feat: add xyz"`
4. Push to GitHub: `git push origin feature/xyz`
5. Create a pull request

---

## 📄 License

MIT License
