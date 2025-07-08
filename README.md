# hashing-jwt

# Messagely (hashing-jwt)

A simple messaging API server built with Node.js, Express, PostgreSQL, and JWT authentication.

## Features

- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication with middleware protection
- Send and receive private messages between users
- Tracks message read status
- Full Express routing and error handling

## Setup

1. **Clone the repo**

```bash
git clone https://github.com/your-username/hashing-jwt.git
cd hashing-jwt
```



2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory with the following variables:
```
touch .env
```
Add the following lines to the `.env` file:
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=messagely
SECRET_KEY=your_jwt_secret
BCRYPT_WORK_FACTOR=12
```
4. **Create the database**
```bash
createdb messagely
```

5. **Seed with optional data**
```bash
psql messagely < data.sql
```

6. **Start the server**
```bash
node server.js
```
## Usage
### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "noobmaster",
    "password": "password123",
    "first_name": "Noob",
    "last_name": "Master",
    "phone": "555-5555"
  }'
```
### Log in and get a JWT token`
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "noobmaster",
    "password": "password123"
  }'
```

### Access authenticated route
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer your_jwt_token"
  ```


### Project Structure
.
├── app.js               # Express app definition
├── server.js            # Server start script
├── config.js            # Loads .env variables
├── db.js                # PostgreSQL DB connection
├── routes/              # API route modules
│   ├── auth.js
│   ├── users.js
│   └── messages.js
├── models/              # Database models
│   ├── user.js
│   └── message.js
├── middleware/          # Authentication middleware
├── expressError.js      # Custom error class
├── .env                 # Your local environment variables
├── package.json
└── data.sql             # Seed data (optional)

### Notes

Passwords are hashed with bcrypt before storing.

JWT tokens are signed with your SECRET_KEY.

Message access is restricted to sender/recipient.

Only the recipient can mark a message as read.

API returns JSON-formatted error messages.

