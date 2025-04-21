import { ErrorPopup } from '../error-popup/error-popup';
import { Result } from '../result';

declare global {
  interface GlobalEventHandlersEventMap {
    'error-report': CustomEvent<Error>;
  }
}

type ErrorMessageReporting = 'ErrorPopup' | 'DocumentEvent';

let typeOfReporting: ErrorMessageReporting = 'ErrorPopup';

export const setErrorMessageReporting = (t: ErrorMessageReporting) => {
  typeOfReporting = t;
};

// Displays the given error.
export const reportErrorMsg = (error: Error) => {
  if (typeOfReporting === 'ErrorPopup') {
    ErrorPopup.displayMessage(error.message);
  } else {
    document.dispatchEvent(new CustomEvent('error-report', { detail: error }));
  }
};

// Reports the error if the given Result is not ok.
export const reportIfError = <T>(ret: Result<T>) => {
  if (!ret.ok) {
    reportErrorMsg(ret.error);
  }
};
