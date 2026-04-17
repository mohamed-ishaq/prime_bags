# Prime Bags - Backend

This is the backend API for the Prime Bags e-commerce platform.

## Architecture Structure
- **Controllers**: Responsible for direct business logic and SQL database querying.
- **Routes**: Define the RESTful pathways.
- **Models**: Defines JS class schemas for documentation and type alignment, complementing `database.sql`.
- **Middleware**: Used for JWT authentication and checking for Admin access privileges.

## Running the Backend

Ensure you have your `.env` configured properly with the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

## Demo Users

If you import `database.sql`, it seeds these demo accounts:
- Customer: `customer@example.com` / `PrimeBagsCustomer#2026`
- Admin: `admin@primebags.com` / `PrimeBagsAdmin#2026`

If you previously imported an older `database.sql`, re-run the two `INSERT INTO users ... ON DUPLICATE KEY UPDATE ...` statements (or re-import the file) so the demo password hashes are updated.

### Auto-fix for demo logins (dev)

In non-production mode, the `/api/auth/login` endpoint will automatically (re)seed these two demo users if you log in with the demo credentials but the DB contains older/incorrect hashes.

Optional env vars:
- `DEMO_ADMIN_PASSWORD` / `DEMO_CUSTOMER_PASSWORD`: override the demo passwords.
- `ALLOW_DEMO_SEED=false`: disable auto-seeding behavior.

1. Install dependencies: `npm install`
2. Start the server (Dev Mode): `npm run dev`
3. The server will run on port `5000` locally.
