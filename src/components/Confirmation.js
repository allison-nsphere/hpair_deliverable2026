import React, { useEffect, useRef } from 'react';
import { hearAboutLabel } from '../utils/validation';

// Shown in place of the form once a submission has gone through.
//
// Reaching this screen means the confirmation email was accepted by EmailJS --
// a failed send keeps the user on the form instead, so there is no
// "submitted but not emailed" state to represent here.

const Confirmation = ({ result, onReset }) => {
  const { values, reference } = result;
  const headingRef = useRef(null);

  // Move focus to the confirmation so screen-reader and keyboard users land on
  // the new content instead of somewhere in the now-unmounted form.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const rows = [
    ['Name', `${values.firstName.trim()} ${values.lastName.trim()}`],
    ['Email', values.email.trim()],
    ['Mailing address', values.mailingAddress.trim()],
    ['Phone', values.phone.trim()],
    ['Nationality', values.nationality.trim()],
    ['Preferred language', values.preferredLanguage.trim()],
    ['Favorite cultural dish', values.favoriteDish.trim()],
    ['Heard about us via', hearAboutLabel(values)],
    ['CV / Resume', values.shareCV && values.cv ? values.cv.name : 'Not shared'],
    ['LinkedIn', values.shareLinkedIn && values.linkedInUrl ? values.linkedInUrl.trim() : 'Not shared'],
    ['Anything else', values.anythingElse.trim() || '—']
  ];

  return (
    <div className="card confirmation">
      <div className="confirmation__mark" aria-hidden="true">🎉</div>

      <h2 className="confirmation__title" ref={headingRef} tabIndex={-1}>
        Thank you, {values.firstName.trim()}!
      </h2>

      <p className="confirmation__text">
        Your HPAIR personal info form has been submitted successfully.
      </p>

      <p className="confirmation__text">
        A confirmation email is on its way to{' '}
        <span className="confirmation__email">{values.email.trim()}</span>.
      </p>

      <div className="confirmation__summary">
        <h3>What you sent us</h3>
        {rows.map(([key, val]) => (
          <div className="summary-row" key={key}>
            <span className="summary-row__key">{key}</span>
            <span className="summary-row__val">{val}</span>
          </div>
        ))}
      </div>

      {reference && (
        <p className="confirmation__text" style={{ fontSize: '0.85rem' }}>
          Reference: <code>{reference}</code>
        </p>
      )}

      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Submit another response
      </button>
    </div>
  );
};

export default Confirmation;
