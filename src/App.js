import React from 'react';
import FlagRibbon from './components/FlagRibbon';
import PersonalInfoForm from './components/PersonalInfoForm';

function App() {
  return (
    <div className="page">
      <FlagRibbon variant="top" />

      <div className="page__body">
        <header className="page__header">
          <span className="page__eyebrow">HPAIR</span>
          <h1 className="page__title">Personal Info Form</h1>
          <p className="page__subtitle">
            Tell us a little about yourself so we can get you ready for the
            conference. It only takes a couple of minutes.
          </p>
        </header>

        <main>
          <PersonalInfoForm />
        </main>

        <footer className="page__footer">
          Harvard Project for Asian and International Relations
        </footer>
      </div>

      <FlagRibbon variant="bottom" />
    </div>
  );
}

export default App;
