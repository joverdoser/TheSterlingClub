# The Sterling Club

Website for **The Sterling Club** — Christmas lighting, gutter and roofline care, private detailing, and vehicle care at home (oil changes, brakes, tune-ups).

## Files

| File | What it is |
|------|------------|
| `index.html` | The homepage: services, membership, about, service area, FAQ, appointment form |
| `privacy.html`, `terms.html`, `cookies.html`, `refunds.html`, `accessibility.html` | Policy pages, linked from every page's footer |
| `styles.css` | Colors, fonts and layout (the "Onyx" design: black, white and silver, plus the animations. Color names and the type scale are at the top) |
| `script.js` | Interactive parts: menu, the Christmas lighting house that lights up as you scroll, photo drift, scroll reveals, membership card tilt, ZIP check, appointment form |
| `js/medallion.js`, `js/mono-data.js` | The 3D silver SC monogram in the first screen (built with three.js). The flat logo shows if 3D isn't available |
| `vendor/` | three.js, the 3D library, stored on this site (MIT license in `vendor/LICENSE-three.txt`) |
| `images/` | Photos (illustrative, from the brand flyers, with car logos blurred) and generated images |
| `fonts/` | Self-hosted fonts and their open licenses |
| `crm/` | Your own CRM in Google Apps Script: saves website requests to a Google Sheet, emails and texts you, confirms to the customer, makes AI Christmas lighting mockups, and gives you a private dashboard. **Setup: `crm/SETUP.md`** |
| `print/` | Business card: `business-card.pdf` is print-ready (3.5 × 2 in card with 1/8 in bleed); `business-card.html` is its editable source |
| `COMPLIANCE.md` | **Read this.** What was checked for legal and accessibility risk, and what's left for you to do |

## Things to update

Contact details are set: (786) 488-9561, reserve@thesterlingclub.net, Houston area.

Still to do (details in `COMPLIANCE.md`):

- **Prices:** Christmas lighting shows no prices (it's sold by phone or in-person consultation). Detailing uses your real package prices. The starred "Starting at" prices for gutters ($129*) and vehicle care ($79*) are still estimates: update them in `index.html`
- **Membership:** Sterling and Sterling Reserve prices and inclusions (labeled as estimates)
- **About section:** your story, and replace `images/team.svg` with a real photo
- **Photos:** replace the illustrative photos with photos of your own jobs. The Christmas lighting section shows three homes (`images/lights-suburban.jpg`, `images/hero-lights.jpg`, `images/lights-estate.jpg`) that light up in turn as you scroll. To swap one, replace the file with a night photo the same shape (16:9) and update its caption in `index.html` (`data-label`)
- **Service area:** the city list and the ZIP check (`SERVED_PREFIXES` in `script.js`)
- **Policies:** once the business is registered, add its legal name to the policy pages, and update the "Effective" date whenever you change a policy
- **Reviews:** only add real reviews from real customers, with their permission

You can edit any file right on GitHub: open the file, click the pencil icon, make changes, then click **Commit changes**.

## Going back to the previous design

The site as it was before the luxury redesign (black and chrome silver, crown logo) is saved on the `backup/pre-luxury-redesign` branch.

## Preview it

Download the files and double-click `index.html` to open it in your browser.

## Put it on the internet (free) with GitHub Pages

1. On GitHub, go to your repository → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Pick your branch (e.g. `main`) and the `/ (root)` folder, then click **Save**.
4. After a minute or two, your site will be live at `https://<your-username>.github.io/TheSterlingClub/`.

## How the request form works

Until the CRM is connected (`CRM_ENDPOINT` at the top of `script.js` is empty), pressing the button opens the visitor's email app with the request filled in, and nothing is sent until they press send.

Once you've set up the CRM (`crm/SETUP.md`) and put its address in `CRM_ENDPOINT`, requests go straight to your Google Sheet, you get an email and text, and Christmas lighting requests can include a photo of the house for AI lighting mockups. Connect the CRM before the redesign goes live: the Privacy Policy already describes this setup.

## If the live site looks out of date

Browsers save a copy of `styles.css` and `script.js`. After you change either one, bump the version at the end of its link in `index.html` (e.g. `styles.css?v=club-1` → `styles.css?v=club-2`) so every visitor gets the new file right away.
