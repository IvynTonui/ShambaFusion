# Fictional demo data — verified local database

The backend was verified against local MySQL port 3306, database `shamba_fusion`.
The live schema is the source of truth for the seed. No schema import, migration,
DROP, TRUNCATE or ALTER is performed. All original accounts are preserved.

## Run safely

From `backend/`, using a working Node.js installation:

```sh
npm run demo:seed -- --confirm-local
```

The script reads the existing private `.env`; it refuses a remote host or any
other database name. Review the target before running. A named database lock
serializes seed runs. Inserts run in an InnoDB transaction and roll back on error.
The script validates required columns, relies on live foreign keys, and checks
that every pre-existing user record is unchanged before committing.

Four fictional participant accounts use `community1@shambafusion.example.test`
through `community4@shambafusion.example.test`. Names are marked Demo.
Passwords are generated randomly, hashed with bcrypt, and stored locally for
login in **`backend/.demo-credentials.json`**, an ignored file with owner-only
permissions. Read that file privately in your editor; never publish it or paste
its contents into screenshots. No administrators are created or promoted.

Keep the credentials file for repeat runs. If it is lost, the script refuses an
identity/password collision rather than changing any existing password.
Categories use their unique names; posts use author + title; comments use
post + author + exact comment; likes use the database's composite primary key;
resources use uploader + name; notifications use recipient + type + related
post + exact message. Existing matching records are reused without updates.
If demo records are intentionally edited later, a rerun can restore missing
original sample content; it does not overwrite the edited records.

The seed inserts 6 categories, 12 discussions, 24 comments, 24 likes, 3 resources
and 3 comment notifications. All are fictional. Notifications belong to demo
post authors and point to seeded discussion IDs, matching the application's
`comment` notification behavior. Original users receive no seeded notifications.

Resources are original plain-text educational worksheets. The seed writes real
files under ignored `backend/uploads/` using exclusive creation; existing files
must match expected contents and are never overwritten. These text fixtures are
not uploaded through the administrator upload form (which allows PDF/JPEG/PNG).
Downloads were verified through API and browser. Filesystem writes cannot share
a MySQL transaction; a failed seed may leave harmless files for a repeat run.

## Live schema versus reconstructed fresh schema

`backend/database/schema.sql` remains an **unverified reconstruction for fresh
installations only**. It must not be imported into the existing database.

| Area | Verified live database | Reconstruction |
|---|---|---|
| IDs | Unsigned integers | Signed integers |
| Post category | Required, restrictive foreign key | Nullable, SET NULL |
| User deletion | Several restrictive foreign keys | Several cascading deletes |
| Category name | 150 characters | 255 characters |
| User name/email/role | 150 / 255 / 40 characters | 120 / 254 / 30 |
| Resource uploader | Required | Nullable |
| Resource description | Nullable | Required |
| Resource file URL | 1024 characters | 512 characters |

The seed uses compatible lengths, required relationships and explicit uploader
IDs. Existing tables are not modified. Fresh schema import and seeding on a
fresh server are not claimed as verified.

## Repeatability and preservation evidence

Two initial runs both returned 7 users, 6 categories, 12 posts, 24 comments,
24 likes, 3 resources and 3 notifications. Both verified existing users unchanged.
API registration verification then added one more fictional participant, bringing
the final user count to 8. The original three accounts retain all fields,
password hashes and roles unchanged.

## Live API verification

```sh
node scripts/verify-demo.js --confirm-local
```

This optional script uses the private demo credentials and API at localhost:3001.
It registers one stable verification participant if absent, and creates, edits,
comments on, likes/unlikes and deletes **only its newly created test discussion**.
No pre-existing post or account is edited/deleted. It also verifies participant
administrative restrictions and all sample resource downloads. Output contains
statuses only; credentials and JWTs are never printed. Results are saved in
`docs/API_VERIFICATION.json`. Do not run it against a public deployment.
