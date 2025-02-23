
export const openCookieSettings = () => {
  if (navigator.userAgent.includes('Chrome')) {
    window.open('chrome://settings/cookies');
  } else if (navigator.userAgent.includes('Firefox')) {
    window.open('about:preferences#privacy');
  } else {
    window.open('about:settings');
  }
};

