DREAM KRAFT LUNGIS - UPDATED IMAGE VERSION

This version automatically uses the generated local images for:
- Header logo
- Home hero banner
- All category cards
- Product cards and product detail galleries

IMAGE LOCATION
client/public/images/

RUN IN VS CODE
1. Open this folder in VS Code.
2. Open Terminal at the project root.
3. Because PowerShell may block npm.ps1, use npm.cmd:
   npm.cmd install
   npm.cmd --prefix client install
   npm.cmd --prefix server install
4. Start both apps:
   npm.cmd run dev
5. Open:
   http://127.0.0.1:5173

BACKEND
The backend uses demo/in-memory data by default. PostgreSQL can be configured later using server/.env.

TO REPLACE IMAGES WITH YOUR OWN PHOTOS
Keep the same filenames under client/public/images/.
Product images are under client/public/images/products/.
Category images are under client/public/images/categories/.
Hero is client/public/images/hero.jpg.
Logo is client/public/images/logo.png.

Image update: replaced legacy hero, category, and product image assets with the clean DREAM KRAFT LUNGIS image set.
