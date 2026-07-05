/* ClearFigures — Service Worker de notificaciones push (FCM).
   Recibe y muestra las notificaciones cuando la app está cerrada
   o en segundo plano. Registrado automáticamente por getToken(). */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyApFc8ccpoSyksI1SAkRqVgSorNdzn2hFY",
  authDomain:        "proyecto-gastos-1c077.firebaseapp.com",
  projectId:         "proyecto-gastos-1c077",
  storageBucket:     "proyecto-gastos-1c077.firebasestorage.app",
  messagingSenderId: "807706091341",
  appId:             "1:807706091341:web:962f21630236c3fcea2104"
});

const messaging = firebase.messaging();

// Los mensajes con payload webpush.notification los muestra el SDK solo.
// Este handler cubre mensajes solo-data (por si se usan a futuro).
messaging.onBackgroundMessage(payload => {
  if (payload.notification) return; // ya la muestra el SDK — evitar duplicado
  const d = payload.data || {};
  self.registration.showNotification(d.title || "ClearFigures", {
    body: d.body || "",
    icon: "/icons/icon.svg",
    data: { url: d.url || "/" },
  });
});

// Click en notificaciones propias (solo-data). Las del SDK manejan su propio link.
self.addEventListener("notificationclick", e => {
  if (!e.notification.data || !e.notification.data.url) return;
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
