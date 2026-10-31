# Website compliance review

**Date:** October 28, 2026
**Scope:** everything in this repository (the homepage, five policy pages, images, fonts and scripts)

> **This is not legal advice.** It's a careful technical and plain-language review. The policies were written to match what this website and business actually do, as described by the owner. Before you rely on them, especially once the business is registered, have a Texas attorney review the Terms and the Deposit & Refund Policy.

## What was checked, and the results

| Area | Result |
|---|---|
| **Analytics and tracking** | None. No Google Analytics, no ad pixels, no social trackers. |
| **Third-party connections** | None. The 3D logo uses three.js, which is stored on this site (MIT license, `vendor/LICENSE-three.txt`), so it sends nothing to an outside company. Rechecked October 30, 2026: 0 outside requests on all 6 pages. Google Fonts was replaced with fonts stored on the site itself. The pages now make **0 requests** to outside companies (checked in a browser on all 6 pages). |
| **Cookies and browser storage** | **0 cookies**, and no local or session storage. The announcement bar no longer remembers being closed, so nothing is stored. |
| **Cookie consent banner** | **Not needed.** Consent banners exist to ask permission for non-essential cookies or trackers, and this site has neither. If you ever add analytics, ads, a chat widget, maps, videos or social embeds, update the Cookie Policy and add consent first. |
| **Third-party embeds** | None (no maps, videos, widgets or iframes). |
| **Privacy Policy** | Added (`privacy.html`). It covers what's collected, how it's used, texting, sharing (no selling), retention, rights requests, Do Not Track / Global Privacy Control, children, and the hosting provider. California's online privacy law (CalOPPA) requires a privacy policy for any site where California residents can submit personal information, so this is useful even for a Texas business. |
| **Terms & Conditions** | Added (`terms.html`). Estimates aren't binding, written quotes control, no electrical wiring work, a membership never renews without written agreement, Texas law with Harris County venue, and Texas consumer rights (DTPA) are preserved. |
| **Cookie Policy** | Added (`cookies.html`). |
| **Refund policy** | Added (`refunds.html`), as you chose: deposits are refundable 48+ hours before the appointment and non-refundable within 48 hours; workmanship issues reported within 7 days are re-serviced at no charge. |
| **Form consent** | A required checkbox to be contacted by call, text or email, with links to the Privacy Policy and Terms, "Message and data rates may apply", "Reply STOP", and "not consent to marketing". The form explains that it opens the visitor's email app and that nothing is sent until they press send. |
| **Booking form and CRM** | Added October 31, 2026. With the CRM connected, requests go to the owner's Google account (Sheets, Drive, Gmail) through Google Apps Script; the owner gets email and text alerts and the customer an email confirmation. Christmas lighting requests can include an optional photo of the home, which may be sent to OpenAI's image API to make lighting previews; previews go to the customer only after the owner reviews and chooses to send them. The Privacy Policy names Google and OpenAI, and says photos of non-customers are deleted within 12 months. A hidden spam-trap field drops bot submissions, and automatic mockups are capped per day to limit cost. |
| **Data minimization** | Only name, phone, service and consent are required; everything else is optional. Nothing is stored by the website. |
| **Fake reviews** | **Removed.** The four sample reviews and star ratings are gone, along with the dead "Leave a Google review" link. The FTC's rule on consumer reviews (16 CFR Part 465, in effect since Oct. 2024) bans fake or AI-generated reviews, with civil penalties per violation. |
| **Unsupported claims** | Removed "Satisfaction guaranteed", "100% satisfaction guarantee", "Make-it-right guarantee", "Most popular", "same day" replies, on-time and clean-up promises, before/after photo promises, invented hours, and the computer-made before/after slider. |
| **Prices** | Christmas lighting shows no prices on the site; it's quoted after a phone or in-person consultation. Detailing shows your real package prices (Signature and Sterling), with upcharges confirmed before the work. Gutter and vehicle care show one estimated "Starting at" price each, marked with an asterisk. The estimate calculator was removed (October 30, 2026). |
| **Business details** | The footer on every page shows the name, Houston, Texas, phone, email and "Call or text to schedule". Placeholder hours were removed from the page and from the search-engine data. |
| **Accessibility (WCAG 2.1 AA)** | axe-core scan: **0 violations** on all 6 pages at desktop and phone sizes. Keyboard test: **22/22 passed** (skip link, no keyboard traps, visible focus on every control, arrow keys in tabs and options, Escape closes the menu, form errors announced and focused). Contrast: **1,054 text elements measured pixel-by-pixel, 0 below AA**, including text over all three hero photos. The 3D logo's automatic motion settles within about 5 seconds (after that it only moves with the pointer or scroll), the house lights only change as the visitor scrolls, and all motion is off when the device asks for reduced motion. An accessibility statement was added (`accessibility.html`). |
| **Alt text** | Every meaningful image has a description. Decorative images (the panel photos, whose links already have text) are hidden from screen readers. |
| **Images and copyright** | Car-maker logos (a Chevrolet bowtie, a Ford oval and an "F-150" badge) and a toolbox brand mark were blurred so the photos don't suggest an affiliation. The team placeholder was drawn in code for this site. All service photos (hero, Christmas lighting, gutter, detailing and vehicle care) were made by the owner with ChatGPT image generation (October 30, 2026). The two extra Christmas lighting homes (`images/lights-suburban.jpg`, `images/lights-estate.jpg`) were also made by the owner with ChatGPT (October 31, 2026); the dark "before" look is the same photo darkened in the browser. The SC monogram logo was drawn for this site from Cinzel Decorative Bold letter shapes (SIL Open Font License, which allows logos; changed from Libre Caslon Display on October 31, 2026), based on the owner's ChatGPT concept, so the site's logo is a clean vector rather than the AI image. Every photo is labeled illustrative in its description, and the footer says "Photos are illustrative." |
| **Fonts** | Cinzel, Playfair Display and Jost are under the SIL Open Font License 1.1, which allows commercial use. License files are in `/fonts`. |

## Things only you can do

**Before you promote the site:**

1. **Make sure `reserve@thesterlingclub.net` receives mail.** It is the address on the website, the policies and the business card. Set it up as a Google Workspace mailbox, or as free forwarding to your Gmail at the company where you registered thesterlingclub.net, and send it a test email.
2. **Replace the remaining estimated prices (gutters and vehicle care) and membership details with real ones,** or remove them. They're labeled as estimates, but advertising prices you won't honor can still be a deceptive-practices problem under the Texas DTPA. Update them in `index.html`.
3. **Confirm where the photos came from.** If the flyer images were made with an AI image tool, check that tool's terms allow commercial use. AI-generated images generally can't be copyrighted, so others may reuse them. Replacing them with photos of your own jobs is best for trust and legal clarity.
4. **Register the business.** In Texas, doing business under a name other than your own legal name generally requires an assumed name (DBA) certificate filed with the county clerk (Harris County if you're there), or you can form an LLC through the Texas Secretary of State. Then add the legal name to the policies.

**Before connecting the CRM and going live:**

- Set up the CRM (`crm/SETUP.md`) and paste its address into `CRM_ENDPOINT` in `script.js`. The Privacy Policy already describes this setup, so it should be live when the redesign is.
- Confirm `reserve@thesterlingclub.net` receives mail (the site now shows it everywhere; changed from a .com address you don't own on October 31, 2026).
- In OpenAI, set a monthly budget limit before adding the API key.
- Once a year, delete house photos of people who didn't become customers (the policy promises within 12 months).

**Operating risks to look at (these aren't website issues, but they're where small service businesses get sued):**

5. **Insurance.** Get general liability insurance (ladders, roofs, property damage). Ask about garagekeepers coverage for working on customers' vehicles, and commercial auto coverage.
6. **Electrical work.** Texas requires a licensed electrician for most electrical work. The Terms say you use existing outlets only. Don't hardwire lights or add outlets unless you're licensed (check with TDLR).
7. **Wash water.** Many cities prohibit detailing runoff from reaching storm drains. Check City of Houston and Harris County rules and use containment mats if needed.
8. **Used oil and fluids.** Recycle them at an authorized facility (Texas Commission on Environmental Quality rules). The Terms promise lawful disposal.
9. **Texting customers.** Replies about a customer's own request are fine with the form's consent. Marketing texts need separate written consent. Always honor STOP. If you text from business software, carriers may require 10DLC registration.
10. **Reviews.** Only post real reviews from real customers, with permission. Never write, buy or AI-generate them, and don't offer rewards only for positive reviews.
11. **Memberships.** If you offer them, use a written agreement that states the price, what's included, billing and how to cancel, and never charge a renewal without agreement.
12. **Sales tax.** Ask the Texas Comptroller whether any of your services are taxable (some services are, depending on type and whether the property is residential).
13. **The name.** Search the USPTO trademark database for "The Sterling Club" before investing heavily in the brand.
14. **Hosting.** GitHub's documentation says Pages is "not intended for or allowed to be used as a free web-hosting service to run your online business." Before you rely on the site for business, consider moving it to a host meant for commercial sites and connecting your own domain.

## Keeping it compliant

- **Adding tracking or embeds:** if you add analytics, a booking widget, a chat bubble, maps or social embeds, update the Privacy and Cookie policies first and add consent where required.
- **Changing a policy:** update its "Effective" date at the top.
- **Retesting:** after design changes, recheck contrast and keyboard access.
