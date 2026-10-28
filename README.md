# The Sterling Club

Website for **The Sterling Club** — Christmas lighting, gutter cleaning, mobile detailing, and mobile mechanic services (oil changes, brakes, tune-ups).

## Files

| File | What it is |
|------|------------|
| `index.html` | The homepage: services, estimate tool, membership, service area, FAQ, quote form |
| `privacy.html`, `terms.html`, `cookies.html`, `refunds.html`, `accessibility.html` | Policy pages, linked from every page's footer |
| `styles.css` | Colors, fonts and layout |
| `script.js` | Interactive parts: estimate calculator, service tabs, ZIP check, quote form |
| `images/` | Photos (illustrative, from the brand flyers, with car logos blurred) and generated images |
| `fonts/` | Self-hosted fonts and their open licenses |
| `COMPLIANCE.md` | **Read this.** What was checked for legal and accessibility risk, and what's left for you to do |

## Things to update

Contact details are set: (786) 488-9561, reserve@thesterlingclub.com, Houston area.

Still to do (details in `COMPLIANCE.md`):

- **Prices:** the starred "from $..." estimates in each service tab, **and** `PRICING` at the top of `script.js`
- **Membership:** Sterling and Crown prices and inclusions (labeled as estimates)
- **About section:** your story, and replace `images/team.svg` with a real photo
- **Photos:** replace the illustrative photos with photos of your own jobs
- **Service area:** the city list and the ZIP check (`SERVED_PREFIXES` in `script.js`)
- **Policies:** once the business is registered, add its legal name to the policy pages, and update the "Effective" date whenever you change a policy
- **Reviews:** only add real reviews from real customers, with their permission

You can edit any file right on GitHub: open the file, click the pencil icon, make changes, then click **Commit changes**.

## Preview it

Download the files and double-click `index.html` to open it in your browser.

## Put it on the internet (free) with GitHub Pages

1. On GitHub, go to your repository → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Pick your branch (e.g. `main`) and the `/ (root)` folder, then click **Save**.
4. After a minute or two, your site will be live at `https://<your-username>.github.io/TheSterlingClub/`.

## How the quote form works

When a visitor submits the form (after checking the consent box), it opens their email app with a message to you already filled in. The website itself stores nothing. If you later switch to a form service such as Formspree, that service will receive visitors' details, so update the Privacy Policy first.

## If the live site looks out of date

Browsers save a copy of `styles.css` and `script.js`. After you change either one, bump the version at the end of its link in `index.html` (e.g. `styles.css?v=legal-1` → `styles.css?v=legal-2`) so every visitor gets the new file right away.
