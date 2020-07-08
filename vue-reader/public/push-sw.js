self.addEventListener('push', function(ev) {
  var data = ev.data.json();
  self.registration.showNotification(data.title, data.options);
});
