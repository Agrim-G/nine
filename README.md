# Eventify (demo)

A demo event discovery and ticket booking website built with plain HTML, CSS and JavaScript.
All events are sample data. No real tickets are sold, no payments are taken, and nothing is sent to any venue.
Demo bookings are stored only in the visitor's browser (localStorage).

## Run locally

Open `index.html` in a browser, or serve the folder:

    npx serve .
    # or
    python3 -m http.server 8000

## Deploy

**GitHub Pages:** push the folder contents to a repository, then Settings > Pages > Deploy from branch (main, root).

**Netlify:** drag the folder onto app.netlify.com/drop, or connect the repository (no build command, publish directory `.`).

## Files

- `index.html` page shell
- `styles.css` styling
- `data.js` sample events (dates are relative to today so they stay upcoming)
- `app.js` routing, search/filters, ticket selection, checkout, bookings
