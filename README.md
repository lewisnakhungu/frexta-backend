# ClientConnect API

ClientConnect is a FastAPI-based backend for managing clients, projects, payments, and notes, with JWT authentication. It uses PostgreSQL for data storage and Alembic for database migrations.

## Features

* RESTful API for authentication, users, clients, projects, payments, and notes.
* JWT-based authentication with password hashing.
* PostgreSQL database with Alembic migrations.
* Pydantic V2 for data validation.
* Scalable project structure.

## Tech Stack

* **Backend:** FastAPI, Python 3.8.13
* **Database:** PostgreSQL 16.9
* **ORM:** SQLAlchemy
* **Migrations:** Alembic
* **Authentication:** python-jose, passlib (bcrypt)
* **Validation:** pydantic-settings

## Prerequisites

* Python 3.8.13
* PostgreSQL 16.9
* pip
* Virtualenv
* Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/clientconnect-backend.git
cd clientconnect-backend
```

### 2. Set Up Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic-settings python-jose[cryptography] passlib[bcrypt]
```

### 4. Configure PostgreSQL

Ensure PostgreSQL is running on port 5433:

```bash
sudo systemctl status postgresql
netstat -tuln | grep 5433
```

Edit `/etc/postgresql/16/main/pg_hba.conf`:

```
host    all             myuser          127.0.0.1/32            md5
host    all             postgres        127.0.0.1/32            md5
```

Edit `/etc/postgresql/16/main/postgresql.conf`:

```
port = 5433
listen_addresses = 'localhost'
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

Create database and user:

```bash
sudo -u postgres psql -p 5433
```

Inside `psql` shell:

```sql
CREATE DATABASE frexta_db;
ALTER DATABASE frexta_db OWNER TO myuser;
ALTER USER myuser WITH PASSWORD 'securepassword123';
GRANT ALL PRIVILEGES ON DATABASE frexta_db TO myuser;
\connect frexta_db
GRANT ALL ON SCHEMA public TO myuser;
```

### 5. Configure Environment

Create `.env` in project root:

```bash
nano .env
```

Add:

```env
DATABASE_URL=postgresql://myuser:securepassword123@localhost:5433/frexta_db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 6. Run Migrations

Move `migrations/` and `alembic.ini` to project root if needed:

```bash
mv app/migrations .
mv app/alembic.ini .
```

Update `alembic.ini`:

```ini
[alembic]
script_location = migrations
sqlalchemy.url = postgresql://myuser:securepassword123@localhost:5433/frexta_db
```

Run migrations:

```bash
alembic revision --autogenerate -m "initial migration"
alembic upgrade head
```

Verify tables:

```bash
psql -U myuser -d frexta_db -h localhost -p 5433
\dt
```

### 7. Start the Server

```bash
cd app
uvicorn app.main:app --reload --port 8000
```

Access:

* API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Root: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Project Structure

```
frexta-backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── authy.py
│   │   ├── users.py
│   │   ├── clients.py
│   │   ├── projects.py
│   │   ├── payments.py
│   │   ├── notes.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── project.py
│   │   ├── payment.py
│   │   ├── note.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── project.py
│   │   ├── payment.py
│   │   ├── note.py
│   ├── main.py
│   ├── test_db.py
├── migrations/
│   ├── env.py
│   ├── versions/
├── .env
├── alembic.ini
├── README.md
```

## API Endpoints

* **Auth:** `/auth/register`, `/auth/token`, `/auth/forgot-password`
* **Users:** `/users/`
* **Clients:** `/clients/`
* **Projects:** `/projects/`
* **Payments:** `/payments/`
* **Notes:** `/notes/`

## Troubleshooting

### ModuleNotFoundError:

```bash
pip list | grep -E 'pydantic|fastapi|jose|passlib'
```

### Database Issues:

```bash
psql -U myuser -d frexta_db -h localhost -p 5433
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Alembic Errors:

```bash
alembic -x loglevel=DEBUG revision --autogenerate -m "initial migration"
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request.

## License

MIT License
