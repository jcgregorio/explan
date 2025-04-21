import { ErrorPopup } from '../error-popup/error-popup';
import { Result } from '../result';

// Displays the given error.
// TODO - Make this a pop-up or something.
export const reportErrorMsg = (error: Error) => {
  ErrorPopup.displayMessage(error.message);
};

// Reports the error if the given Result is not ok.
export const reportIfError = <T>(ret: Result<T>) => {
  if (!ret.ok) {
    reportErrorMsg(ret.error);
  }
};
