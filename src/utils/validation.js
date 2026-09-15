// Validation rules for the HPAIR Personal Info Form.
//
// `validateForm` is the single source of truth: it runs on every keystroke to
// drive real-time errors and to decide whether Submit is enabled, and it runs
// again on submit. There is no second, divergent set of rules.

// CVs are stored inline on the Firestore document, and a Firestore document is
// capped at ~1 MB. Base64 inflates a file by ~33%, so cap the raw file well
// under that to leave room for the rest of the answers.
export const MAX_CV_BYTES = 700 * 1024;

export const ACCEPTED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ACCEPTED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const HEAR_ABOUT_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'social-media', label: 'Social media' },
  { value: 'previous-events', label: 'Previous events' },
  { value: 'word-of-mouth', label: 'Word of mouth' },
  { value: 'other', label: 'Other' }
];

export const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  mailingAddress: '',
  phone: '',
  shareCV: false,
  cv: null, // { name, size, type, dataUrl }
  shareLinkedIn: false,
  linkedInUrl: '',
  nationality: '',
  preferredLanguage: '',
  favoriteDish: '',
  hearAboutUs: '',
  hearAboutUsOther: '',
  anythingElse: ''
};

// "Anything else?" is optional, but capped so a pasted wall of text cannot
// push the Firestore document over its size limit.
export const MAX_ANYTHING_ELSE = 1000;

const NAME_RE = /^[\p{L}\p{M}'\-. ]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-().]{6,19}$/;
const LINKEDIN_RE = /^(https?:\/\/)?([\w-]+\.)?linkedin\.com\/[^\s]+$/i;

const isBlank = (v) => typeof v !== 'string' || v.trim() === '';

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Returns { fieldName: 'message' }. Empty object means the form is valid.
export const validateForm = (values) => {
  const errors = {};

  // --- First name ---
  if (isBlank(values.firstName)) {
    errors.firstName = 'Please enter your first name.';
  } else if (values.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  } else if (!NAME_RE.test(values.firstName.trim())) {
    errors.firstName = 'Use letters, spaces, hyphens or apostrophes only.';
  }

  // --- Last name ---
  if (isBlank(values.lastName)) {
    errors.lastName = 'Please enter your last name.';
  } else if (values.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  } else if (!NAME_RE.test(values.lastName.trim())) {
    errors.lastName = 'Use letters, spaces, hyphens or apostrophes only.';
  }

  // --- Email (also the address the confirmation is sent to) ---
  if (isBlank(values.email)) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Enter a valid email, e.g. name@example.com';
  }

  // --- Mailing address ---
  if (isBlank(values.mailingAddress)) {
    errors.mailingAddress = 'Please enter your mailing address.';
  } else if (values.mailingAddress.trim().length < 10) {
    errors.mailingAddress = 'Please enter a fuller address (at least 10 characters).';
  }

  // --- Phone ---
  if (isBlank(values.phone)) {
    errors.phone = 'Please enter your phone number.';
  } else {
    const digits = values.phone.replace(/\D/g, '');
    if (!PHONE_RE.test(values.phone.trim())) {
      errors.phone = 'Enter a valid phone number, e.g. +1 617 555 0123';
    } else if (digits.length < 7 || digits.length > 15) {
      errors.phone = 'Phone number must be between 7 and 15 digits.';
    }
  }

  // --- CV / Resume (only when the user opted in) ---
  if (values.shareCV) {
    if (!values.cv) {
      errors.cv = 'Please upload your CV, or turn this option off.';
    } else if (values.cv.size > MAX_CV_BYTES) {
      errors.cv = `File is ${formatBytes(values.cv.size)}. Please upload a file under ${formatBytes(MAX_CV_BYTES)}.`;
    } else if (!isAcceptedCV(values.cv)) {
      errors.cv = 'Accepted formats: PDF, DOC or DOCX.';
    }
  }

  // --- LinkedIn (only when the user opted in) ---
  if (values.shareLinkedIn) {
    if (isBlank(values.linkedInUrl)) {
      errors.linkedInUrl = 'Please enter your LinkedIn URL, or turn this option off.';
    } else if (!LINKEDIN_RE.test(values.linkedInUrl.trim())) {
      errors.linkedInUrl = 'Enter a valid LinkedIn URL, e.g. linkedin.com/in/your-name';
    }
  }

  // --- Nationality ---
  if (isBlank(values.nationality)) {
    errors.nationality = 'Please enter your nationality.';
  } else if (values.nationality.trim().length < 2) {
    errors.nationality = 'Please enter a valid nationality.';
  }

  // --- Preferred language ---
  if (isBlank(values.preferredLanguage)) {
    errors.preferredLanguage = 'Please enter your preferred language.';
  } else if (values.preferredLanguage.trim().length < 2) {
    errors.preferredLanguage = 'Please enter a valid language.';
  }

  // --- Favourite cultural dish ---
  if (isBlank(values.favoriteDish)) {
    errors.favoriteDish = 'Please tell us your favourite cultural dish.';
  } else if (values.favoriteDish.trim().length < 2) {
    errors.favoriteDish = 'Please enter at least 2 characters.';
  }

  // --- How did you hear about us ---
  if (isBlank(values.hearAboutUs)) {
    errors.hearAboutUs = 'Please choose one option.';
  } else if (values.hearAboutUs === 'other' && isBlank(values.hearAboutUsOther)) {
    errors.hearAboutUsOther = 'Please tell us where you heard about us.';
  }

  // --- Anything else? (optional) ---
  if (typeof values.anythingElse === 'string' && values.anythingElse.length > MAX_ANYTHING_ELSE) {
    errors.anythingElse = `Please keep this under ${MAX_ANYTHING_ELSE} characters (currently ${values.anythingElse.length}).`;
  }

  return errors;
};

export const isAcceptedCV = (cv) => {
  if (!cv) return false;
  if (cv.type && ACCEPTED_CV_TYPES.includes(cv.type)) return true;
  // Some browsers report an empty MIME type; fall back to the extension.
  const lower = (cv.name || '').toLowerCase();
  return ACCEPTED_CV_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

export const isFormValid = (values) => Object.keys(validateForm(values)).length === 0;

// Human-readable source label, used in the confirmation email and summary.
export const hearAboutLabel = (values) => {
  if (values.hearAboutUs === 'other') {
    return values.hearAboutUsOther?.trim() ? `Other — ${values.hearAboutUsOther.trim()}` : 'Other';
  }
  const match = HEAR_ABOUT_OPTIONS.find((o) => o.value === values.hearAboutUs);
  return match ? match.label : '';
};
