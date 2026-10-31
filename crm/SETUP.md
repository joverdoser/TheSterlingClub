# Your CRM: setup guide

This turns your Google account into a simple CRM for The Sterling Club. When someone sends a request on the website:

1. It's saved as a new row in a Google Sheet you own (your customer list).
2. You get an email and, if you set it up, a text.
3. The customer gets an email confirming you received it (if they gave an email).
4. For Christmas lighting requests with a house photo, AI makes four lighting mockups (classic warm white, rooflines and trees, full estate, multicolor). You review them in your dashboard and choose which to email the customer. Nothing is sent to the customer without you.

You also get a private dashboard page, which you can save to your phone's home screen, to call or text leads, change their status, keep notes, add a house photo after a visit, and make or send mockups.

Everything runs in your Google account for free. The only cost is the optional AI mockups (see step 5).

Setup takes about 15 minutes. You need a computer for the setup; after that the dashboard works on your phone.

## 1. Create the script

1. Go to https://script.google.com while signed in to the Gmail account you use for the business, and click **New project**.
2. Click **Untitled project** at the top and name it `Sterling Club CRM`.
3. Delete everything in `Code.gs`, then copy all of `crm/Code.gs` from this repository and paste it in.
4. Click the **+** next to **Files**, choose **HTML**, and name it `Dashboard` (exactly, without `.html`). Delete what's in it and paste all of `crm/Dashboard.html`.
5. Click **Save** (the disk icon).

## 2. Choose where alerts go

At the top of `Code.gs`, in `CONFIG`:

- **`NOTIFY_EMAIL`**: leave it blank to get alerts at the Gmail account running the script, or put another address in quotes.
- **Text alerts**: choose one:
  - **Free, Metro by T-Mobile, T-Mobile or Verizon**: set `SMS_EMAIL` to your number at your carrier's text address: `'7864889561@mymetropcs.com'` (Metro by T-Mobile, already filled in for (786) 488-9561), `'7135551234@tmomail.net'` (T-Mobile) or `'7135551234@vtext.com'` (Verizon). AT&T ended this service in 2025, so it won't work on AT&T. If test alerts don't arrive by text on Metro, try the `@tmomail.net` address with the same number.
  - **Any carrier, with Twilio**: create a Twilio account and get a number. Set `TWILIO_TO` to your mobile number (like `'+17135551234'`). Then in step 4, add `TWILIO_SID`, `TWILIO_TOKEN` and `TWILIO_FROM`. US carriers require a one-time Twilio registration for business texting, which Twilio walks you through. It costs roughly $2 to $10 a month plus a one-time fee of around $20.
  - **No texts for now**: leave both blank and turn on Gmail notifications on your phone.

Click **Save**.

## 3. Run the setup once

1. In the toolbar, pick **`setup`** from the function list and click **Run**.
2. Google asks for permission. Click **Review permissions**, choose your account, then **Advanced**, then **Go to Sterling Club CRM (unsafe)**, then **Allow**. The warning appears because this is your own script, not one Google has reviewed.
3. When it finishes, open **Execution log**. It shows the links to your new **CRM sheet** and **files folder** in Google Drive.

## 4. Add your keys (Script properties)

Click the gear icon (**Project Settings**), scroll to **Script properties**, and add:

| Property | Value | Needed for |
|---|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (step 5) | AI lighting mockups |
| `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` | From your Twilio console | Twilio texts only |
| `DASHBOARD_URL` | Added in step 7 | Links in your alert emails |

Keys stay in your Google account. Don't paste them into `Code.gs` or anywhere on the website.

## 5. AI mockups (optional)

1. Go to https://platform.openai.com, sign in (it's separate from a ChatGPT subscription), add a payment method, and set a **monthly budget limit** (for example $20) under **Limits**.
2. Create an API key under **API keys** and add it as `OPENAI_API_KEY` in step 4.

At medium quality, each lead with a photo makes four mockups, roughly 25 cents in total at OpenAI's published prices (check their current pricing). `MAX_AUTO_MOCKUP_LEADS_PER_DAY` (10) caps automatic mockups per day in case the form is ever spammed. To make mockups only when you press the button in the dashboard, set `AUTO_MOCKUPS` to `false`.

## 6. Connect the website form

1. Click **Deploy**, then **New deployment**. Click the gear next to **Select type** and choose **Web app**.
2. Description: `Website form`. **Execute as: Me**. **Who has access: Anyone**. Click **Deploy**.
3. Copy the **Web app URL** (it ends in `/exec`).
4. Send that URL to Claude to connect it, or paste it yourself into `script.js` on the line `const CRM_ENDPOINT = "";`, between the quotes.

"Anyone" only lets visitors *send* requests to this address. They can't see your leads: the dashboard checks that the person opening it is you.

## 7. Create your private dashboard

1. Click **Deploy**, then **New deployment**, then **Web app** again.
2. Description: `Dashboard`. **Execute as: Me**. **Who has access: Only myself**. Click **Deploy**.
3. Copy this second URL. Add it as `DASHBOARD_URL` in Script properties (step 4), and bookmark it. On your phone, open it in your browser and use **Add to Home Screen**.

## 8. Test it

Send a test Christmas lighting request from the website with a photo of a house. Within a minute you should get the email (and text), see the lead in your dashboard and sheet, and get a confirmation at the email you entered. Mockups arrive within about 10 minutes, with an email when they're ready.

## Changing the code later

After pasting a new version of `Code.gs` or `Dashboard`, click **Deploy**, then **Manage deployments**. For **each** of the two deployments, click the pencil, set **Version** to **New version**, and click **Deploy**. The URLs stay the same.

## Good to know

- **Gmail limits**: a regular Gmail account can send about 100 automated emails a day, plenty for this.
- **Your customer list** is the Google Sheet. You can sort, filter or export it any time, and edit it directly. Keep the column headings as they are.
- **Photos** are stored in the files folder, one folder per lead. The privacy policy says photos of people who don't become customers are deleted within 12 months, so clear old folders once a year.
- **Your email address on the website** is `reserve@thesterlingclub.net`. Make sure it receives mail: set it up as a Google Workspace mailbox, or as free forwarding to your Gmail at the company where you registered thesterlingclub.net, then send it a test email.
