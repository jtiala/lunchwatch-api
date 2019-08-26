export const delay = (seconds: number): Promise<void> =>
  new Promise((resolve): void => {
    setTimeout(function() {
      resolve();
    }, seconds * 1000);
  });
