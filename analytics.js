if (location.protocol === 'https:' &&
    !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) &&
    navigator.doNotTrack !== '1' && window.doNotTrack !== '1' &&
    navigator.globalPrivacyControl !== true) {
  window.va = window.va || function (...args) {
    (window.vaq = window.vaq || []).push(args);
  };
  window.va('beforeSend', event => {
    if (event.type !== 'pageview') return null;
    try {
      const url = new URL(event.url);
      url.search = '';
      url.hash = '';
      return { ...event, url: url.href };
    } catch {
      return null;
    }
  });
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  document.head.append(script);
}
