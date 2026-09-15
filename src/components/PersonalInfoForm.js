import React, { useMemo, useRef, useState } from 'react';
import FormField from './FormField';
import ToggleSwitch from './ToggleSwitch';
import Confirmation from './Confirmation';
import { submitForm } from '../services/submissionService';
import {
  initialValues,
  validateForm,
  formatBytes,
  HEAR_ABOUT_OPTIONS,
  MAX_CV_BYTES,
  MAX_ANYTHING_ELSE,
  ACCEPTED_CV_EXTENSIONS
} from '../utils/validation';

const PersonalInfoForm = () => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState(null); // { values, submissionId, emailSent }
  const fileInputRef = useRef(null);

  // Re-validated on every render from the current values: this single result
  // drives the inline errors and the Submit button's enabled state.
  const errors = useMemo(() => validateForm(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  // Only surface an error once the user has actually interacted with a field.
  const errorFor = (name) => (touched[name] ? errors[name] : undefined);

  const setValue = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const markTouched = (name) =>
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));

  // Validate as the user types, but only after the field has been blurred once
  // or already shows an error -- this is the "real-time" part.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue(name, value);
  };

  const handleBlur = (e) => markTouched(e.target.name);

  // --- toggles -------------------------------------------------------------

  const handleShareCV = (checked) => {
    setValues((prev) => ({ ...prev, shareCV: checked, cv: checked ? prev.cv : null }));
    if (!checked) {
      setTouched((prev) => ({ ...prev, cv: false }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleShareLinkedIn = (checked) => {
    setValues((prev) => ({
      ...prev,
      shareLinkedIn: checked,
      linkedInUrl: checked ? prev.linkedInUrl : ''
    }));
    if (!checked) setTouched((prev) => ({ ...prev, linkedInUrl: false }));
  };

  // --- file upload ---------------------------------------------------------

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    markTouched('cv');

    if (!file) {
      setValue('cv', null);
      return;
    }

    // Record the file immediately so oversize/wrong-type files still produce a
    // validation message rather than silently doing nothing.
    const meta = { name: file.name, size: file.size, type: file.type, dataUrl: null };

    if (file.size > MAX_CV_BYTES) {
      setValue('cv', meta);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setValue('cv', { ...meta, dataUrl: reader.result });
    reader.onerror = () => {
      console.error('[form] Could not read the selected file.');
      setValue('cv', meta);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setValue('cv', null);
    setTouched((prev) => ({ ...prev, cv: false }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- submit --------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Reveal every outstanding error at once if they force a submit.
    if (!isValid) {
      setTouched(
        Object.keys(validateForm(values)).reduce((acc, k) => ({ ...acc, [k]: true }), {
          ...touched
        })
      );
      setFormError('Please fix the highlighted fields before submitting.');
      document.querySelector('.field__error')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setStatus('submitting');

    const delivered = await submitForm(values);

    if (!delivered.success) {
      setStatus('error');
      setFormError(delivered.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setResult({ values, reference: delivered.reference });
    setStatus('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setValues(initialValues);
    setTouched({});
    setResult(null);
    setFormError('');
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'success' && result) {
    return <Confirmation result={result} onReset={resetForm} />;
  }

  const submitting = status === 'submitting';
  const cvError = errorFor('cv');

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert--error" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{formError}</span>
        </div>
      )}

      {/* ---------------- First name ---------------- */}
      <FormField id="firstName" label="First Name" error={errorFor('firstName')}>
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('firstName') ? 'input--invalid' : ''}`}
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="e.g. Ashley"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Last name ---------------- */}
      <FormField id="lastName" label="Last Name" error={errorFor('lastName')}>
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('lastName') ? 'input--invalid' : ''}`}
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="e.g. Zheng"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Email ---------------- */}
      <FormField
        id="email"
        label="Email Address"
        error={errorFor('email')}
        hint="We'll send your confirmation here."
      >
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('email') ? 'input--invalid' : ''}`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Mailing address ---------------- */}
      <FormField id="mailingAddress" label="Mailing Address" error={errorFor('mailingAddress')}>
        {(a11y) => (
          <textarea
            {...a11y}
            className={`textarea ${errorFor('mailingAddress') ? 'textarea--invalid' : ''}`}
            name="mailingAddress"
            rows={3}
            autoComplete="street-address"
            placeholder="Street, city, state/region, postal code, country"
            value={values.mailingAddress}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Phone ---------------- */}
      <FormField id="phone" label="Phone Number" error={errorFor('phone')}>
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('phone') ? 'input--invalid' : ''}`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 617 555 0123"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- CV / Resume (opt-in) ---------------- */}
      <div className="field">
        <ToggleSwitch
          id="shareCV"
          title="Share your CV / Resume"
          hint={`Optional — PDF, DOC or DOCX, up to ${formatBytes(MAX_CV_BYTES)}.`}
          checked={values.shareCV}
          onChange={handleShareCV}
        />

        {values.shareCV && (
          <div className="reveal">
            <div className={`file-drop ${cvError ? 'file-drop--invalid' : ''}`}>
              <input
                ref={fileInputRef}
                className="file-drop__input"
                id="cv"
                name="cv"
                type="file"
                accept={ACCEPTED_CV_EXTENSIONS.join(',')}
                aria-invalid={cvError ? 'true' : 'false'}
                aria-describedby={cvError ? 'cv-error' : undefined}
                onChange={handleFileChange}
              />
              <label className="file-drop__button" htmlFor="cv">
                {values.cv ? 'Choose a different file' : 'Choose file'}
              </label>

              <span className="file-drop__meta">
                {values.cv ? (
                  <>
                    <span className="file-drop__name">{values.cv.name}</span>
                    {' · '}
                    {formatBytes(values.cv.size)}
                  </>
                ) : (
                  'No file selected yet'
                )}
              </span>

              {values.cv && (
                <button type="button" className="file-drop__remove" onClick={removeFile}>
                  Remove
                </button>
              )}
            </div>

            {cvError && (
              <p className="field__error" id="cv-error" role="alert">
                {cvError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---------------- LinkedIn (opt-in) ---------------- */}
      <div className="field">
        <ToggleSwitch
          id="shareLinkedIn"
          title="Share your LinkedIn URL"
          hint="Optional — helps us connect you with alumni."
          checked={values.shareLinkedIn}
          onChange={handleShareLinkedIn}
        />

        {values.shareLinkedIn && (
          <div className="reveal">
            <FormField id="linkedInUrl" label="LinkedIn URL" error={errorFor('linkedInUrl')}>
              {(a11y) => (
                <input
                  {...a11y}
                  className={`input ${errorFor('linkedInUrl') ? 'input--invalid' : ''}`}
                  name="linkedInUrl"
                  type="url"
                  inputMode="url"
                  placeholder="linkedin.com/in/your-name"
                  value={values.linkedInUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </div>
        )}
      </div>

      {/* ---------------- Nationality ---------------- */}
      <FormField id="nationality" label="Nationality" error={errorFor('nationality')}>
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('nationality') ? 'input--invalid' : ''}`}
            name="nationality"
            type="text"
            autoComplete="country-name"
            placeholder="e.g. Singaporean"
            value={values.nationality}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Preferred language ---------------- */}
      <FormField
        id="preferredLanguage"
        label="Preferred Language"
        error={errorFor('preferredLanguage')}
      >
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('preferredLanguage') ? 'input--invalid' : ''}`}
            name="preferredLanguage"
            type="text"
            autoComplete="language"
            placeholder="e.g. Mandarin"
            value={values.preferredLanguage}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Favourite cultural dish ---------------- */}
      <FormField
        id="favoriteDish"
        label="Favorite cultural dish?"
        error={errorFor('favoriteDish')}
        hint="Tell us what you'd want served at the conference dinner."
      >
        {(a11y) => (
          <input
            {...a11y}
            className={`input ${errorFor('favoriteDish') ? 'input--invalid' : ''}`}
            name="favoriteDish"
            type="text"
            placeholder="e.g. Hainanese chicken rice"
            value={values.favoriteDish}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- How'd you hear about us? ---------------- */}
      <fieldset className="fieldset">
        <legend className="fieldset__legend">
          How'd you hear about us?
          <span className="field__required" aria-hidden="true">*</span>
        </legend>

        <div
          className="radio-grid"
          role="radiogroup"
          aria-invalid={errorFor('hearAboutUs') ? 'true' : 'false'}
          aria-describedby={errorFor('hearAboutUs') ? 'hearAboutUs-error' : undefined}
        >
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`radio ${values.hearAboutUs === option.value ? 'radio--checked' : ''}`}
            >
              <input
                className="radio__input"
                type="radio"
                name="hearAboutUs"
                value={option.value}
                checked={values.hearAboutUs === option.value}
                onChange={(e) => {
                  markTouched('hearAboutUs');
                  setValues((prev) => ({
                    ...prev,
                    hearAboutUs: e.target.value,
                    // drop any stale free-text if they move off "Other"
                    hearAboutUsOther:
                      e.target.value === 'other' ? prev.hearAboutUsOther : ''
                  }));
                }}
              />
              {option.label}
            </label>
          ))}
        </div>

        {errorFor('hearAboutUs') && (
          <p className="field__error" id="hearAboutUs-error" role="alert">
            {errorFor('hearAboutUs')}
          </p>
        )}

        {values.hearAboutUs === 'other' && (
          <div className="reveal" style={{ marginTop: '12px' }}>
            <FormField
              id="hearAboutUsOther"
              label="Where did you hear about us?"
              error={errorFor('hearAboutUsOther')}
            >
              {(a11y) => (
                <input
                  {...a11y}
                  className={`input ${errorFor('hearAboutUsOther') ? 'input--invalid' : ''}`}
                  name="hearAboutUsOther"
                  type="text"
                  placeholder="e.g. My university's careers newsletter"
                  value={values.hearAboutUsOther}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </div>
        )}
      </fieldset>

      {/* ---------------- Anything else? (optional) ---------------- */}
      <FormField
        id="anythingElse"
        label="Anything else?"
        required={false}
        error={errorFor('anythingElse')}
        hint="Optional — access needs, dietary requirements, or anything you'd like us to know."
      >
        {(a11y) => (
          <textarea
            {...a11y}
            className={`textarea ${errorFor('anythingElse') ? 'textarea--invalid' : ''}`}
            name="anythingElse"
            rows={4}
            maxLength={MAX_ANYTHING_ELSE}
            placeholder="Share anything you'd like us to know…"
            value={values.anythingElse}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        )}
      </FormField>

      {/* ---------------- Submit ---------------- */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!isValid || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>

        <p className="form-actions__note" aria-live="polite">
          {submitting
            ? 'Sending your details…'
            : isValid
              ? 'All set — you can submit this form.'
              : 'Complete every required field to enable submission.'}
        </p>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
