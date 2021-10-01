chrome.alarms.create('testAlarm', {
	periodInMinutes: 30
});
chrome.notifications.create('test', {
  type: 'basic',
  iconUrl: 'images/icon.png',
  title: 'Clueber Cyber-Tips',
  message: 'Hourly security tips',
  priority: 2
});
chrome.alarms.onAlarm.addListener((alarms) => {
  if (alarms.name === "testAlarm") {
      ('test');
    }
});