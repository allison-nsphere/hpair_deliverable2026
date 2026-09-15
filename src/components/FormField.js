import React from 'react';

// A labelled field wrapper that keeps the accessibility wiring in one place:
// the label points at the control, and the error is announced and linked via
// aria-describedby / aria-invalid.
//
// `error` is only passed in once the field has been touched, so users are not
// shouted at while they are still typing their first character.

const FormField = ({ id, label, error, hint, required = true, children }) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__required" aria-hidden="true">*</span>}
        {hint && <span className="field__hint" id={hintId}>{hint}</span>}
      </label>

      {children({
        id,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': [error ? errorId : null, hint ? hintId : null]
          .filter(Boolean)
          .join(' ') || undefined
      })}

      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
