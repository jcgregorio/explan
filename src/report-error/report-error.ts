import { ErrorPopup } from "../error-popup/error-popup";
import { Result } from "../result";

// Displays the given error.
// TODO - Make this a pop-up or something.
export const reportError = (error: Error) => {
  ErrorPopup.displayMessage(error.message);
  console.log(error);
};

// Reports the error if the given Result is not ok.
export const reportOnError = <T>(ret: Result<T>) => {
  if (!ret.ok) {
    reportError(ret.error);
  }
};
