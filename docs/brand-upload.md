# Brand image upload

The authenticated manager endpoints accept `multipart/form-data`:

- `POST /api/manager/brands`
- `POST /api/brands`
- `PUT /api/manager/brands/:id`

Text fields: `name`, `code`, `categoryId`, `rating`, `description`, `address`.
File fields: `logo` and `coverImage` (one file each, optional).
Supported formats: JPEG, PNG, WebP. Maximum size: 5 MB per file.
Do not set the multipart boundary manually; let the HTTP client generate it.

The API stores files in `public/uploads/brands/` with generated filenames.
The response keeps `logo_url` and `cover_image_url` so existing image views can use them.
Files are publicly available at `/uploads/brands/<filename>`.
Failed requests remove newly written files. Existing JSON requests remain supported.

Set `PUBLIC_BASE_URL` to the externally reachable backend origin in production,
for example `https://api.example.com` (without `/api`). If unset, the request's
protocol and host are used. On a phone, access the backend through its LAN IP
or public hostname, rather than localhost.
Mount `public/uploads` on persistent storage when deploying to a server with
an ephemeral filesystem.

Validation: `node --test test/brand_upload_test.js test/voucher_detail_test.js`.
