# Goperdoor Hotel App

## Image Upload Configuration
Image uploads use Cloudinary. Do NOT commit secrets. Create a `.env` in `server/` containing:

```
CLOUDINARY_CLOUD_NAME=dm4u0c7ga
CLOUDINARY_API_KEY=YOUR_KEY
CLOUDINARY_API_SECRET=YOUR_SECRET
CLOUDINARY_FOLDER=goperdoor
```

Replace `YOUR_KEY` and `YOUR_SECRET` with the real values locally only. Never expose them in client code.

## Upload Endpoint
`POST /api/upload` (auth required: owner or admin)
Form field: `image` (single file)
Response: `{ url, public_id }`

## Frontend Usage
Owner dashboard now supports selecting an image file; after successful upload the returned `url` is placed into the Image URL field before creating the menu item.

## Dependencies Added (server)
- `multer` for handling multipart form data
- `cloudinary` SDK for uploads

Run install after pulling changes:
```
cd server
npm install
```

## Notes
- File size limited to 5MB.
- Adjust allowed folder via `CLOUDINARY_FOLDER`.
- To display images publicly, Cloudinary `secure_url` returned is used directly.

## Environment Variables (Server)
Copy `server/.env.example` to `server/.env` and fill in real values.

Important:
- `MONGO_URI` example (Atlas): `mongodb+srv://USERNAME:PASSWORD@cluster0.p9tz0ts.mongodb.net/goperdoor?retryWrites=true&w=majority`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` used by `npm run seed` to create initial admin.
- Never commit `.env` (already ignored).

Seeding admin after setting vars:
```powershell
cd server
npm run seed
```

## Hotel Image Upload (Admin)
Admin can upload a hotel logo/image when creating a hotel:
- Uses same `/api/upload` endpoint (Cloudinary backend).
- Form auto-fills the resulting image URL.
- Preview thumbnail shown in hotel list.
