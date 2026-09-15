# HPAIR Personal Info Form

A responsive, accessible personal information form built with React (Create React App).
Submissions are delivered by email via EmailJS — there is no database.

**Live demo:** _add your Vercel URL here_

---

## Features

**Validation**
- Real-time validation: errors appear on blur and clear the moment a field becomes valid
- Specific, actionable messages ("Enter a valid email, e.g. name@example.com") rather than generic ones
- Submit stays disabled until every required field passes
- One `validateForm` function is the single source of truth for both the inline errors and the submit gate, so the two can never disagree

**Conditional / optional fields**
- CV / Resume and LinkedIn URL are opt-in toggles that reveal their input only when switched on
- Turning a toggle off clears its value, so a stale entry can never block submission
- "How'd you hear about us?" reveals a free-text box when "Other" is selected

**Submission states**
- Distinct idle / submitting / success / error states
- A failed send keeps the user on the form with their answers intact — never a false success
- Success replaces the form with a confirmation screen showing a reference code and a summary of what was sent

**Responsive and accessible**
- Verified with zero horizontal overflow at 360px and 390px
- Every input has a real `<label>`; errors are linked with `aria-describedby` and announced with `role="alert"`
- Toggles are real checkboxes (Space works); radios sit in a `<fieldset>` with a `<legend>`
- Visible focus rings throughout, and `prefers-reduced-motion` is respected
- Focus moves to the confirmation heading after submit

**Design**
- Arching flag-bunting ribbons at the top and bottom, drawn with SVG `textPath` so the flags genuinely follow the curve
- Baloo 2 / Nunito type pairing

---

## Getting started

```bash
npm install
cp .env.example .env    # then fill in your EmailJS values
npm start
```

Runs at http://localhost:3000.

> CRA reads `.env` only at startup — restart the dev server after changing it.

---

## Configuration

Three values from https://dashboard.emailjs.com, set in `.env`:

| Variable | Where to find it |
|---|---|
| `REACT_APP_EMAILJS_PUBLIC_KEY` | Account → General → Public Key |
| `REACT_APP_EMAILJS_SERVICE_ID` | Email Services → Service ID |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | Email Templates → Template ID |

In the EmailJS template, set **To email** to `{{to_email}}` and **Reply-To** to `{{email}}`.
`.env.example` lists every available template variable.

`REACT_APP_*` values are inlined into the JS bundle at build time and are visible to
anyone who loads the page. That is expected for the EmailJS *public* key — restrict the
account with the allowed-domains setting in the EmailJS dashboard. Never put a private key here.

### Deploying

`.env` is gitignored, so set the same three variables in your host's environment settings
(on Vercel: Project → Settings → Environment Variables), then redeploy. They are needed at
**build** time, not runtime. Also add your deployed domain to EmailJS's allowed list.

---

## Project structure

```
src/
  App.js                        page shell
  index.css                     all styling (design tokens, responsive, a11y)
  components/
    PersonalInfoForm.js         the form: state, submit flow
    FormField.js                label + error + aria wiring
    ToggleSwitch.js             opt-in switch for CV / LinkedIn
    FlagRibbon.js               arching SVG flag bunting
    Confirmation.js             post-submit screen
  services/
    submissionService.js        orchestrates a submit
    emailService.js             EmailJS transport
  utils/
    validation.js               all rules + field config
```

---

## Known limitations

- **CV files are not attached on EmailJS's free plan.** Attachments require a paid plan, and
  the free tier's variable-size cap is far below any real CV — sending the file would make
  those submissions fail outright. `REACT_APP_EMAILJS_ATTACH_CV` defaults to `false`, and the
  email reports the CV's filename and size instead. On a paid plan, set it to `true` and add a
  Variable Attachment using `{{cv_base64}}`.
- **Nothing is stored.** The confirmation email is the only record. To keep a copy, add a BCC
  address in the EmailJS template settings.
- **Flag emoji do not render on Windows**, which has no OS support for them. The ribbon cord
  and layout still display correctly.

---

## Original brief

## Recommended Features

1. **Form Validation**
   - Real-time validation  
   - Clear error messages for invalid fields  
   - Prevent submission until all data is valid  

2. **Form Fields**  
   Include (at minimum):  
   - Address  
   - CV (file upload)  
   - Phone number  
   - Nationality  
   - LinkedIn URL  
   - Preferred language  
   - *(Feel free to propose and add more fields that improve usefulness or user experience.)*  


3. **Form Submission**
   - Handle form data submission  
   - Display success and error states  
   - Show a clear confirmation message after submission  

4. **Responsive Design**
   - Mobile-friendly layout  
   - Clean, accessible, and user-friendly styling  

---

## Bonus / Creative Features

1. **User Experience Enhancements**
   - Loading states  
   - Inline success/error notifications  
   - Auto-save of progress  
   - Smooth keyboard navigation  

2. **Extended Functionality**
   - Email the response to a provided email  
   - Provide a downloadable summary of the submission  
   - Implement **conditional questions** (e.g., only ask for a LinkedIn URL if the user indicates they have one)  
   - Any additional feature you believe would improve usability or make the form stand out  

 *We would love to see something beyond just the basics—demonstrate creativity by proposing and implementing at least one additional feature or unique UI/UX improvement.*  

---

## Getting Started
0. Fork this repository to your personal github account

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm start
   ```

---

## Submission

Please create an account at [Vercel](https://vercel.com/) and then link your repo. It should automatically pull and build your main branch. Be sure to check that you are not getting any errors before submitting. You will need to submit both the vercel link to your deployment and the link to your GitHub repository.

## Issues or Assistance

If you run into any issues cloning the repo or breaking bugs that seem outside of your ability to fix, please reach out to Christopher Qiu and Ashley Zheng at cqiu@college.harvard.edu and ashleyzheng@college.harvard.edu. Good luck, we look forward to your submissions!

## AI Policy

You're allowed to use AI to complete this deliverable. In the same time, all code you submit is a fair game for the interview - including design decisions, features implementation and trade-offs
