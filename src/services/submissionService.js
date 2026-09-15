// Delivers a completed form.
//
// With no database and no HPAIR-facing copy, the applicant's confirmation
// email is the only outcome of a submit -- so if it fails, the submission
// failed, and the user stays on the form with their answers intact.
import {
  sendConfirmationEmail,
  buildReference,
  missingConfig
} from './emailService';

export const submitForm = async (values) => {
  const reference = buildReference();

  const sent = await sendConfirmationEmail(values, reference);

  if (sent.success) {
    return { success: true, reference, confirmationSent: true };
  }

  if (sent.reason === 'not-configured') {
    return {
      success: false,
      code: 'not-configured',
      message:
        'This form is not finished being set up, so it cannot accept ' +
        'submissions yet. Missing settings: ' + missingConfig().join(', ') + '.'
    };
  }

  return {
    success: false,
    code: sent.reason || 'send-failed',
    message:
      'We could not send your confirmation email, so your submission was not ' +
      'completed. Please check your email address and try again.'
  };
};

const submissionService = { submitForm };

export default submissionService;
