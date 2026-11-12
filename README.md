# Carlito Connect — Delta Reign Binder

A GitHub Pages-ready Pokémon card binder based on the supplied Delta Reign HTML.

## Files
- `index.html` — page structure
- `style.css` — styling
- `cards.js` — the 58 supplied card entries and image URLs
- `app.js` — binder, card editor, pull history, stream library and browser storage

## Publish with GitHub Pages
1. Upload all four files (plus this README) into the root of your repository.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. Open the Pages URL after deployment completes.

## Storage
The binder uses browser `localStorage` for owned cards, card edits, pull history, saved stream records, Delta Reign pack preset and default stream settings. Data is local to the browser/device. Use the browser's export/backup facilities before clearing site data or changing devices. GitHub Pages is static hosting and does not provide cross-device account sync.

## Artwork
The original card image URLs from the supplied HTML are retained and load over the internet.

## Pull logging
When logging a card pull, enter the buyer's eBay username and order number, the person who packed it, the stream and the pull date/time. The card's pull history displays those details, newest first.


## Important storage fix
Card details and pull histories are now saved separately in `delta-reign-card-data-v1`, as well as the owned-card and stream records. This prevents pull histories from disappearing when the page reloads. Browser storage is still device/browser-specific.
