# The Sterling Club

Website for **The Sterling Club** — Christmas lighting, gutter cleaning, mobile detailing, and mobile mechanic services (oil changes, brakes, tune-ups).

## Files

| File | What it is |
|------|------------|
| `index.html` | All the page content (text, services, FAQ, contact form) |
| `styles.css` | Colors, fonts, and layout |
| `script.js`  | Mobile menu and the quote form |
| `images/`    | Photos used on the site (cropped from the brand flyers) |

## Things to update before going live

Contact details are set: (786) 488-9561, reserve@thesterlingclub.com, Houston area.

These are still placeholders. Search `index.html` for them and replace them with your real info:

- **Hours:** `Monday to Saturday, 8am to 6pm`
- **Prices:** the "from $..." amounts at the bottom of each service column
- **Membership:** the Sterling ($49) and Crown ($99) prices and what's included
- **Reviews:** the three sample reviews under "What members say". Swap in real customer reviews. Don't publish the samples.
- **Photos:** to swap a photo, upload a new one into `images/` with the same file name (e.g. `lights.jpg`), or add a new one and change the `src="images/..."` in `index.html`.

You can edit any file right on GitHub: open the file, click the pencil icon, make changes, then click **Commit changes**.

## Preview it

Download the files and double-click `index.html` to open it in your browser.

## Put it on the internet (free) with GitHub Pages

1. On GitHub, go to your repository → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Pick your branch (e.g. `main`) and the `/ (root)` folder, then click **Save**.
4. After a minute or two, your site will be live at `https://<your-username>.github.io/TheSterlingClub/`.

## How the quote form works

When a visitor submits the form, it opens their email app with a message to you already filled in. If you'd rather receive submissions without the visitor's email app, a free service like [Formspree](https://formspree.io) can be plugged in later.
