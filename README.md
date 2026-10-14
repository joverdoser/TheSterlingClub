# The Sterling Club

Website for **The Sterling Club** — Christmas lighting, gutter cleaning, mobile detailing, and mobile mechanic services (oil changes, brakes, tune-ups).

## Files

| File | What it is |
|------|------------|
| `index.html` | All the page content (text, services, FAQ, contact form) |
| `styles.css` | Colors, fonts, and layout |
| `script.js`  | Interactive parts: estimate calculator, service tabs, reviews carousel, ZIP check, booking form |
| `images/`    | Photos (from the brand flyers, color-corrected) and generated images |

## Things to update before going live

Contact details are set: (786) 488-9561, reserve@thesterlingclub.com, Houston area.

These are still placeholders. Search `index.html` (and `script.js` where noted) and replace them:

- **Hours:** `Monday to Saturday, 8am to 6pm` (also in the `openingHours` line near the top of `index.html`)
- **Prices:** the "from $..." amounts in each service tab, **and** the `PRICING` list at the top of `script.js` that powers the instant estimate
- **Membership:** Sterling ($49 / $490) and Crown ($99 / $990) prices and what's included
- **Reviews:** the four sample reviews. Replace them with real ones before going live, and point the "Leave us a Google review" button at your Google review link
- **About section:** your story, and replace `images/team.svg` with a real photo of you or your crew
- **Before/after:** `images/detail-before.jpg` is a computer-made sample. Replace both before/after images with photos from a real job
- **Photos:** the other photos come from your flyers. Real job photos build the most trust
- **Social links:** the Instagram, Facebook, TikTok and Google icons in the footer link to `#`
- **Service area:** the city list and the ZIP check (`SERVED_PREFIXES` in `script.js`)
- **Payment answer:** the "How do I pay?" FAQ
- **Announcement bar:** the message at the very top. Change it each season

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

## If the live site looks out of date

Browsers save a copy of `styles.css` and `script.js`. After you change either one, bump the version at the end of its link in `index.html` (e.g. `styles.css?v=pro-1` → `styles.css?v=pro-2`) so every visitor gets the new file right away.
