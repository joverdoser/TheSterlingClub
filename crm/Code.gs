/**
 * The Sterling Club CRM (Google Apps Script)
 *
 * What it does:
 *  - Receives requests from the website form and saves each one as a row in a Google Sheet you own.
 *  - Stores house photos in a Google Drive folder, one folder per lead.
 *  - Emails and texts you about every new request, and emails the customer a confirmation.
 *  - For Christmas lighting requests with a house photo, makes AI mockups of lighting styles
 *    for you to review. Nothing is sent to the customer until you choose to send it.
 *  - Serves a private dashboard (only you can open it) to manage leads.
 *
 * Setup: follow crm/SETUP.md. Settings you can change are in CONFIG below.
 * Secret keys (OpenAI, Twilio) go in Project Settings > Script properties, never in this file.
 */

const CONFIG = {
  BUSINESS_NAME: 'The Sterling Club',
  BUSINESS_PHONE: '(786) 488-9561',
  // Where lead alerts go. Leave blank to use the Google account that runs this script.
  NOTIFY_EMAIL: '',
  // Free text alerts through your carrier's email-to-text address. Set for Metro by T-Mobile at (786) 488-9561.
  // Others: 7135551234@tmomail.net (T-Mobile), 7135551234@vtext.com (Verizon). Leave blank to skip.
  SMS_EMAIL: '7864889561@mymetropcs.com',
  // Text alerts through Twilio instead (works on any carrier): your mobile number, like +17135551234.
  // Also add TWILIO_SID, TWILIO_TOKEN and TWILIO_FROM in Script properties. Leave blank to skip.
  TWILIO_TO: '',
  SEND_CUSTOMER_CONFIRMATION: true,
  // AI mockups for Christmas lighting requests that include a house photo.
  // Needs OPENAI_API_KEY in Script properties. Each mockup costs a few cents.
  AUTO_MOCKUPS: true,
  MAX_AUTO_MOCKUP_LEADS_PER_DAY: 10, // limits cost if the form is ever spammed
  OPENAI_IMAGE_MODEL: 'gpt-image-1',
  MOCKUP_QUALITY: 'medium',
  TIME_ZONE: 'America/Chicago',
};

const STATUSES = ['New', 'Contacted', 'Consultation booked', 'Quoted', 'Won', 'Lost'];
const COLUMNS = ['Received', 'Lead ID', 'Status', 'Service', 'Name', 'Phone', 'Email', 'Meet', 'Preferred date',
  'Time window', 'Address', 'Reach by', 'Details', 'Photo', 'Mockups', 'Notes', 'Updated'];
const COL = Object.fromEntries(COLUMNS.map((c, i) => [c, i + 1]));
const LIGHTING = 'Christmas lighting';

// The house, camera angle and framing must stay the same; only lights are added.
const MOCKUP_BASE = 'Edit this photo of a house. Keep the house, roof shape, windows, doors, landscaping, ' +
  'camera angle and framing exactly as they are. Make it a clear evening just after sunset. ' +
  'Add professionally installed Christmas lights that follow the real edges of this house: ';
const MOCKUP_STYLES = [
  { key: 'classic', label: 'Classic warm white', prompt: 'warm white C9 bulbs evenly spaced along every roofline, eave and peak, and a lit garland around the front door. Nothing else is lit.' },
  { key: 'trees', label: 'Rooflines and trees', prompt: 'warm white C9 bulbs along every roofline and peak, plus warm white mini lights wrapped neatly around the trunks and main branches of the front trees and shrubs.' },
  { key: 'estate', label: 'Full estate', prompt: 'warm white C9 bulbs on every roofline and peak, wrapped trees and shrubs, a lit garland and wreath on the front door, wreaths in the front windows, and soft warm path lights along the walkway.' },
  { key: 'color', label: 'Classic multicolor', prompt: 'traditional multicolor C9 bulbs (red, green, blue and amber, evenly alternating) along every roofline and peak, with warm white mini lights on the front trees.' },
];
const MOCKUP_FINISH = ' The result must look like a real photograph, not a painting or illustration. Do not add text, people, cars or decorations other than those described.';

// ---------- Setup (run once from the editor) ----------

function setup() {
  const props = PropertiesService.getScriptProperties();
  let ss;
  if (props.getProperty('SHEET_ID')) {
    ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  } else {
    ss = SpreadsheetApp.create(CONFIG.BUSINESS_NAME + ' CRM');
    props.setProperty('SHEET_ID', ss.getId());
  }
  let sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Leads');
  }
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold').setBackground('#0F0F0F').setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
  sheet.getRange(2, COL.Status, sheet.getMaxRows() - 1, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  sheet.setColumnWidths(1, COLUMNS.length, 140);
  sheet.setColumnWidth(COL.Details, 280);
  sheet.setColumnWidth(COL.Notes, 280);

  if (!props.getProperty('FOLDER_ID')) {
    props.setProperty('FOLDER_ID', DriveApp.createFolder(CONFIG.BUSINESS_NAME + ' CRM files').getId());
  }
  // Mockups are made in the background, a few minutes after a request arrives.
  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === 'processMockups').forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('processMockups').timeBased().everyMinutes(5).create();

  Logger.log('CRM sheet: ' + ss.getUrl());
  Logger.log('Files folder: ' + DriveApp.getFolderById(props.getProperty('FOLDER_ID')).getUrl());
}

// ---------- Website form endpoint ----------

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.website) return json({ ok: true }); // hidden spam trap filled in: ignore quietly
    const name = clean(data.name, 120), phone = clean(data.phone, 40);
    if (!name || !phone || data.consent !== true) return json({ ok: false, error: 'missing' });

    const lead = {
      id: 'SC-' + Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, 'yyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 900 + 100),
      received: new Date(),
      service: clean(data.service, 80),
      name, phone,
      email: clean(data.email, 120),
      meet: clean(data.meet, 40),
      date: clean(data.date, 20),
      time: clean(data.time, 20),
      address: clean(data.address, 200),
      pref: clean(data.pref, 20),
      details: clean(data.message, 2000),
      photo: '',
    };

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (data.photo) lead.photo = savePhoto(lead.id, data.photo);
      const wantsMockups = lead.service === LIGHTING && lead.photo && CONFIG.AUTO_MOCKUPS && mockupsAvailable() && underDailyLimit();
      leadsSheet().appendRow([lead.received, lead.id, 'New', lead.service, lead.name, lead.phone, lead.email, lead.meet,
        lead.date, lead.time, lead.address, lead.pref, lead.details, lead.photo, wantsMockups ? 'Queued' : '', '', new Date()]);
    } finally {
      lock.releaseLock();
    }

    notifyOwner(lead);
    if (CONFIG.SEND_CUSTOMER_CONFIRMATION && lead.email) confirmCustomer(lead);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server' });
  }
}

// ---------- Private dashboard ----------

function doGet() {
  if (!isOwner()) {
    return HtmlService.createHtmlOutput('<p style="font-family:sans-serif">This page is private.</p>');
  }
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle(CONFIG.BUSINESS_NAME + ' CRM')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function listLeads() {
  assertOwner();
  const sheet = leadsSheet();
  const n = sheet.getLastRow() - 1;
  if (n < 1) return [];
  return sheet.getRange(2, 1, n, COLUMNS.length).getValues().map((r, i) => ({
    row: i + 2,
    received: r[COL.Received - 1] ? Utilities.formatDate(new Date(r[COL.Received - 1]), CONFIG.TIME_ZONE, 'MMM d, h:mm a') : '',
    id: r[COL['Lead ID'] - 1], status: r[COL.Status - 1], service: r[COL.Service - 1], name: r[COL.Name - 1],
    phone: String(r[COL.Phone - 1]), email: r[COL.Email - 1], meet: r[COL.Meet - 1], date: String(r[COL['Preferred date'] - 1]),
    time: r[COL['Time window'] - 1], address: r[COL.Address - 1], pref: r[COL['Reach by'] - 1], details: r[COL.Details - 1],
    photo: fileIdFromUrl(r[COL.Photo - 1]), mockups: parseMockups(r[COL.Mockups - 1]), mockupState: mockupState(r[COL.Mockups - 1]),
    notes: r[COL.Notes - 1],
  })).reverse();
}

function updateLead(id, changes) {
  assertOwner();
  const row = findRow(id);
  const sheet = leadsSheet();
  if (changes.status && STATUSES.includes(changes.status)) sheet.getRange(row, COL.Status).setValue(changes.status);
  if (typeof changes.notes === 'string') sheet.getRange(row, COL.Notes).setValue(changes.notes.slice(0, 5000));
  sheet.getRange(row, COL.Updated).setValue(new Date());
  return true;
}

// Add or replace the house photo from the dashboard (for example after a consultation).
function uploadPhoto(id, dataUrl) {
  assertOwner();
  const row = findRow(id);
  const url = savePhoto(id, dataUrl);
  leadsSheet().getRange(row, COL.Photo).setValue(url);
  return fileIdFromUrl(url);
}

// Make mockups now for one lead (runs right away; takes about a minute).
function makeMockupsNow(id) {
  assertOwner();
  if (!mockupsAvailable()) throw new Error('Add OPENAI_API_KEY in Script properties first.');
  const row = findRow(id);
  leadsSheet().getRange(row, COL.Mockups).setValue('Working');
  return generateForRow(row);
}

// Image for the dashboard, as a data URL. Uses Drive's reduced-size preview when it's ready,
// so mockups load quickly on a phone; falls back to the full file.
function getImageData(id, size) {
  assertOwner();
  const auth = { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true };
  try {
    const meta = JSON.parse(UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?fields=thumbnailLink', auth).getContentText());
    if (meta.thumbnailLink) {
      const res = UrlFetchApp.fetch(meta.thumbnailLink.replace(/=s\d+$/, '=s' + Math.min(Number(size) || 1200, 1600)), auth);
      if (res.getResponseCode() === 200) {
        const blob = res.getBlob();
        return 'data:' + (blob.getContentType() || 'image/jpeg') + ';base64,' + Utilities.base64Encode(blob.getBytes());
      }
    }
  } catch (err) {
    console.warn('Preview not available, sending full image: ' + err);
  }
  const blob = DriveApp.getFileById(id).getBlob();
  return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
}

// Email the mockups you picked to the customer.
function sendMockupsToCustomer(id, fileIds, note) {
  assertOwner();
  const row = findRow(id);
  const r = leadsSheet().getRange(row, 1, 1, COLUMNS.length).getValues()[0];
  const email = r[COL.Email - 1];
  if (!email) throw new Error('This lead has no email address.');
  const files = fileIds.map((fid) => DriveApp.getFileById(fid));
  const first = String(r[COL.Name - 1]).split(' ')[0];
  const body = 'Hi ' + first + ',\n\n' + (note ? note + '\n\n' : '') +
    'Attached are a few lighting ideas for your home. They are computer-made previews to help us choose a direction together; ' +
    'your final design and price are confirmed in your written quote.\n\n' + CONFIG.BUSINESS_NAME + '\n' + CONFIG.BUSINESS_PHONE;
  GmailApp.sendEmail(email, 'Lighting ideas for your home', body, {
    name: CONFIG.BUSINESS_NAME, attachments: files.map((f) => f.getBlob()),
  });
  leadsSheet().getRange(row, COL.Notes).setValue([r[COL.Notes - 1], 'Mockups emailed ' + Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, 'MMM d')].filter(String).join('\n'));
  return true;
}

// ---------- Background mockups (time trigger) ----------

function processMockups() {
  if (!mockupsAvailable()) return;
  const sheet = leadsSheet();
  const n = sheet.getLastRow() - 1;
  if (n < 1) return;
  const values = sheet.getRange(2, COL.Mockups, n, 1).getValues();
  // One lead per run keeps each run well inside Apps Script's 6-minute limit.
  const i = values.findIndex((v) => v[0] === 'Queued');
  if (i === -1) return;
  sheet.getRange(i + 2, COL.Mockups).setValue('Working');
  generateForRow(i + 2);
}

function generateForRow(row) {
  const sheet = leadsSheet();
  const r = sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0];
  const photoId = fileIdFromUrl(r[COL.Photo - 1]);
  if (!photoId) {
    sheet.getRange(row, COL.Mockups).setValue('');
    throw new Error('This lead has no house photo yet.');
  }
  const photo = DriveApp.getFileById(photoId).getBlob();
  const folder = leadFolder(r[COL['Lead ID'] - 1]);
  const made = [];
  for (const style of MOCKUP_STYLES) {
    try {
      const png = openAiEdit(photo, MOCKUP_BASE + style.prompt + MOCKUP_FINISH);
      const file = folder.createFile(png.setName(style.label + '.png'));
      made.push(style.label + '|' + file.getId());
    } catch (err) {
      console.error('Mockup failed: ' + style.label + ': ' + err);
    }
  }
  sheet.getRange(row, COL.Mockups).setValue(made.length ? made.join('\n') : 'Failed');
  if (made.length) {
    const to = CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    GmailApp.sendEmail(to, 'Lighting mockups ready: ' + r[COL.Name - 1],
      made.length + ' mockups are ready to review in your CRM dashboard: ' + dashboardUrl(),
      { name: CONFIG.BUSINESS_NAME + ' CRM' });
  }
  return parseMockups(made.join('\n'));
}

function openAiEdit(photoBlob, prompt) {
  const key = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  const res = UrlFetchApp.fetch('https://api.openai.com/v1/images/edits', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + key },
    payload: {
      model: CONFIG.OPENAI_IMAGE_MODEL,
      prompt: prompt,
      image: photoBlob,
      size: '1536x1024',
      quality: CONFIG.MOCKUP_QUALITY,
      n: '1',
    },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('OpenAI ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
  const b64 = JSON.parse(res.getContentText()).data[0].b64_json;
  return Utilities.newBlob(Utilities.base64Decode(b64), 'image/png');
}

// ---------- Notifications ----------

function notifyOwner(lead) {
  const to = CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  const isLights = lead.service === LIGHTING;
  const subject = (isLights ? 'New Christmas lighting request: ' : 'New request: ') + lead.name + (lead.service && !isLights ? ' (' + lead.service + ')' : '');
  const rows = [
    ['Service', lead.service], ['Name', lead.name], ['Phone', lead.phone], ['Email', lead.email],
    ['Consultation', lead.meet], ['Preferred date', lead.date], ['Time window', lead.time],
    ['Address / ZIP', lead.address], ['Best way to reach', lead.pref], ['Details', lead.details], ['Lead ID', lead.id],
  ].filter((p) => p[1]);
  const html = '<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">' +
    '<p style="font-size:18px;margin:0 0 12px"><b>' + esc(subject) + '</b></p>' +
    '<table cellpadding="6" style="border-collapse:collapse">' +
    rows.map((p) => '<tr><td style="color:#666;vertical-align:top">' + esc(p[0]) + '</td><td>' + esc(p[1]).replace(/\n/g, '<br>') + '</td></tr>').join('') +
    '</table>' +
    (lead.photo ? '<p><a href="' + lead.photo + '">House photo</a>' + (isLights ? ' (lighting mockups will follow if enabled)' : '') + '</p>' : '') +
    '<p><a href="tel:' + esc(lead.phone) + '">Call ' + esc(lead.name) + '</a> &nbsp;|&nbsp; <a href="' + dashboardUrl() + '">Open CRM</a></p></div>';
  GmailApp.sendEmail(to, subject, rows.map((p) => p[0] + ': ' + p[1]).join('\n'), { htmlBody: html, name: CONFIG.BUSINESS_NAME + ' CRM' });

  const text = (isLights ? 'New lights request: ' : 'New request: ') + lead.name + ', ' + lead.phone +
    (lead.meet ? ', ' + lead.meet : '') + (lead.address ? ', ' + lead.address : '');
  sendText(text.slice(0, 300));
}

function sendText(message) {
  if (CONFIG.SMS_EMAIL) MailApp.sendEmail(CONFIG.SMS_EMAIL, '', message);
  const p = PropertiesService.getScriptProperties();
  const sid = p.getProperty('TWILIO_SID'), token = p.getProperty('TWILIO_TOKEN'), from = p.getProperty('TWILIO_FROM');
  if (CONFIG.TWILIO_TO && sid && token && from) {
    UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
      method: 'post',
      headers: { Authorization: 'Basic ' + Utilities.base64Encode(sid + ':' + token) },
      payload: { To: CONFIG.TWILIO_TO, From: from, Body: message },
      muteHttpExceptions: true,
    });
  }
}

function confirmCustomer(lead) {
  const first = lead.name.split(' ')[0];
  const lights = lead.service === LIGHTING;
  const body = 'Hi ' + first + ',\n\n' +
    (lights
      ? 'Thank you for your Christmas lighting request. We will contact you to set up your consultation' + (lead.meet ? ' (' + lead.meet.toLowerCase() + ')' : '') + ', then send you a written quote.'
      : 'Thank you for your request' + (lead.service ? ' for ' + lead.service.toLowerCase() : '') + '. We will contact you with a written quote and available times.') +
    '\n\nIf you need us sooner, call or text ' + CONFIG.BUSINESS_PHONE + '.\n\n' + CONFIG.BUSINESS_NAME;
  GmailApp.sendEmail(lead.email, 'We received your request', body, { name: CONFIG.BUSINESS_NAME });
}

// ---------- Helpers ----------

// The private dashboard's address (the "Only myself" deployment), saved as DASHBOARD_URL in Script properties.
function dashboardUrl() {
  return PropertiesService.getScriptProperties().getProperty('DASHBOARD_URL') || 'your CRM dashboard';
}

function leadsSheet() {
  return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getSheetByName('Leads');
}

function leadFolder(id) {
  const root = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOLDER_ID'));
  const it = root.getFoldersByName(id);
  return it.hasNext() ? it.next() : root.createFolder(id);
}

function savePhoto(id, dataUrl) {
  const m = /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(String(dataUrl));
  if (!m) return '';
  const bytes = Utilities.base64Decode(m[3]);
  if (bytes.length > 8 * 1024 * 1024) return '';
  const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
  const file = leadFolder(id).createFile(Utilities.newBlob(bytes, m[1], 'House photo.' + ext));
  return file.getUrl();
}

function findRow(id) {
  const sheet = leadsSheet();
  const ids = sheet.getRange(2, COL['Lead ID'], Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  const i = ids.findIndex((v) => v[0] === id);
  if (i === -1) throw new Error('Lead not found: ' + id);
  return i + 2;
}

function underDailyLimit() {
  const cache = CacheService.getScriptCache();
  const key = 'mockups-' + Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, 'yyyyMMdd');
  const count = Number(cache.get(key) || 0);
  if (count >= CONFIG.MAX_AUTO_MOCKUP_LEADS_PER_DAY) return false;
  cache.put(key, String(count + 1), 6 * 60 * 60);
  return true;
}

function mockupsAvailable() {
  return Boolean(PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY'));
}

function parseMockups(cell) {
  return String(cell || '').split('\n').filter((l) => l.includes('|')).map((l) => {
    const [label, id] = l.split('|');
    return { label, id };
  });
}

function mockupState(cell) {
  const s = String(cell || '');
  return s.includes('|') ? 'Ready' : s;
}

function fileIdFromUrl(url) {
  const m = /\/d\/([\w-]+)/.exec(String(url || ''));
  return m ? m[1] : '';
}

function isOwner() {
  const active = Session.getActiveUser().getEmail();
  return Boolean(active) && active === Session.getEffectiveUser().getEmail();
}

function assertOwner() {
  if (!isOwner()) throw new Error('Not allowed');
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, max);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
