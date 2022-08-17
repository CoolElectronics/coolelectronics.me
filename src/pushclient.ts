const publicVapidKey =
  "BBzsD4l726AcTRxC9rBxQ6f_b4N-eDJQ5x_DmeRTdLwhT2mWvJw2F7HymaF1A4v7uwG8A-ZfkUuASENO4tUFwuU";

export async function init() {
  let r = await navigator.serviceWorker.getRegistrations();
  if (r.length == 0) {
    console.log("Registering service worker");

    registerPushWorker().catch((error) => console.error(error));
  } else {
    console.log("service worker already running");
  }
}
export async function resubscribe() {
  console.log("resubscribe requested");
  let registrations = await navigator.serviceWorker.getRegistrations();
  for (let reg of registrations) {
    await reg.unregister();
  }
  registerPushWorker();
}

async function registerPushWorker() {
  const registration = await navigator.serviceWorker.register(
    "/pushworker.js",
    { scope: "/" }
  );
  console.log("Registered service worker");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });
  await fetch("/api/account/pushworkersubscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  });
}

// Boilerplate borrowed from https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
