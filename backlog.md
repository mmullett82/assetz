# assetZ Backlog

## Completed — Asset Essentials Import Fields (2026-03-14)

Added fields to support mass import from Asset Essentials:

- **Prisma schema:** 4 new Asset fields (`category`, `electrical_panel_specs`, `imported_photo_ref`, `imported_document_ref`), 2 new models (`AssetPhoto`, `AssetDocument`)
- **Import field maps:** 5 new field defs + pattern entries for auto-mapping AE columns (Barcode, Category, Electrical Panel, Photos, Documents)
- **Photo/Document upload APIs:** Full CRUD with local filesystem storage (`public/uploads/`), multipart FormData upload, file type/size validation
- **AssetForm:** Category input in Basic Info, Electrical Panel fieldset, real photo upload with thumbnail grid + delete, real document upload with file list + download/delete
- **Asset detail page:** Category in Equipment Details, Electrical Panel section, Photos gallery, Documents file list with download links, import reference display
- **Asset table:** Category column (hidden by default, toggleable via ColumnChooser)
- **Category filter:** Added to FilterBar with 7 initial AE categories
- **Seed data:** All 9 assets now have category values
