// The form's one outbound email, via EmailJS.
//
// There is no database and no HPAIR-facing copy: the confirmation sent to the
// applicant is the only thing that leaves the browser, so its success is the
// submission's success.
//
// To keep a copy for HPAIR without a second template, set a BCC address in the
// EmailJS template settings -- no code change needed.
//
// Configure in .env (see .env.example) and restart the dev server: Create React
// App only reads .env at startup.
//
// CRA inlines REACT_APP_* values into the bundle, so these are visible to
// anyone who loads the page. That is how EmailJS's *public* key is meant to
// work; restrict the account with the allowed-domains setting in their
// dashboard. Never put an EmailJS private key here.
import emailjs from '@emailjs/browser';
import { hearAboutLabel, formatBytes } from '../utils/validation';

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

// Attaching the CV file itself requires a paid EmailJS plan (Variable
// Attachments). On the free plan the total size of template variables is
// capped well below any real CV, so sending the base64 would make every
// submission with a CV fail. Default off: the email still names the file.
const ATTACH_CV = process.env.REACT_APP_EMAILJS_ATTACH_CV === 'true';

export const isConfigured = () => Boolean(SERVICE_ID && PUBLIC_KEY && TEMPLATE_ID);

// Names every missing setting so a misconfiguration is obvious.
export const missingConfig = () =>
  [
    !SERVICE_ID && 'REACT_APP_EMAILJS_SERVICE_ID',
    !PUBLIC_KEY && 'REACT_APP_EMAILJS_PUBLIC_KEY',
    !TEMPLATE_ID && 'REACT_APP_EMAILJS_TEMPLATE_ID'
  ].filter(Boolean);

// A short reference the applicant can quote back. Not a stored id -- nothing
// is persisted anywhere.
export const buildReference = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HP-${stamp.slice(-5)}${rand}`;
};

const buildParams = (values, reference) => {
  const params = {
    // the applicant is the recipient; the template's "To email" must be {{to_email}}
    to_email: values.email.trim(),

    reference,
    submitted_at: new Date().toLocaleString(),

    name: `${values.firstName.trim()} ${values.lastName.trim()}`,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim(),
    mailing_address: values.mailingAddress.trim(),
    phone: values.phone.trim(),
    nationality: values.nationality.trim(),
    preferred_language: values.preferredLanguage.trim(),
    favorite_dish: values.favoriteDish.trim(),
    heard_about_us: hearAboutLabel(values),
    linkedin_url: values.shareLinkedIn && values.linkedInUrl
      ? values.linkedInUrl.trim()
      : 'Not shared',
    cv_name: values.shareCV && values.cv ? values.cv.name : 'Not shared',
    cv_size: values.shareCV && values.cv ? formatBytes(values.cv.size) : '',
    anything_else: values.anythingElse.trim() || 'Nothing else shared'
  };

  // Only send file bytes when the account can actually accept them.
  if (ATTACH_CV && values.shareCV && values.cv?.dataUrl) {
    params.cv_base64 = String(values.cv.dataUrl).split(',')[1] || '';
    params.cv_mime = values.cv.type || 'application/octet-stream';
  }

  return params;
};

export const sendConfirmationEmail = async (values, reference) => {
  if (!values?.email) return { success: false, reason: 'no-address' };

  if (!isConfigured()) {
    console.error(
      '[emailService] Cannot send -- missing .env settings: ' +
      missingConfig().join(', ') + '. See .env.example.'
    );
    return { success: false, reason: 'not-configured', missing: missingConfig() };
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, buildParams(values, reference), {
      publicKey: PUBLIC_KEY
    });
    return { success: true };
  } catch (error) {
    console.error('[emailService] Send failed:', error);
    return {
      success: false,
      reason: 'send-failed',
      status: error?.status,
      text: error?.text
    };
  }
};

const emailService = {
  sendConfirmationEmail,
  isConfigured,
  missingConfig,
  buildReference
};

export default emailService;
