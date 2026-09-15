import React from 'react';

// An opt-in switch for the CV and LinkedIn fields.
//
// This is a real <input type="checkbox"> underneath a styled track, so it keeps
// native keyboard behaviour (Space to toggle), focus handling and screen-reader
// semantics for free.

const ToggleSwitch = ({ id, title, hint, checked, onChange }) => (
  <div className="toggle-row">
    <span className="toggle-row__text">
      <label className="toggle-row__title" htmlFor={id}>{title}</label>
      {hint && <span className="toggle-row__hint" id={`${id}-hint`}>{hint}</span>}
    </span>

    <span className="toggle">
      <input
        className="toggle__input"
        type="checkbox"
        id={id}
        checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__track" />
      <span className="toggle__thumb" />
    </span>
  </div>
);

export default ToggleSwitch;
