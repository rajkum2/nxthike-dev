import { useEffect } from 'react';

const MetricoolTracker = () => {
  useEffect(() => {
    const loadScript = (callback: () => void) => {
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://tracker.metricool.com/resources/be.js';
      script.onreadystatechange = callback;
      script.onload = callback;
      head.appendChild(script);
    };

    loadScript(() => {
      // @ts-ignore
      window.beTracker?.t({ hash: 'fd936da343a0d0c89b9d51c3a184af2a' });
    });
  }, []);

  return null;
};

export default MetricoolTracker; 