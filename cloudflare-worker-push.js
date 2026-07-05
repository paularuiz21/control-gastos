/* ═══════════════════════════════════════════════════════════════
   ClearFigures — Cloudflare Worker de notificaciones push (FCM v1)

   Recibe {token, title, body} desde la app y envía la notificación
   al celular del otro miembro del grupo vía Firebase Cloud Messaging.

   DEPLOY:
   1. Cloudflare Dashboard → Workers → Create Worker
      (sugerencia de nombre: clearfigures-push)
   2. Pegar este código completo y deployar.
   3. Settings → Variables and Secrets → Add:
        Nombre: FIREBASE_SERVICE_ACCOUNT
        Tipo:   Secret
        Valor:  el contenido COMPLETO del JSON de cuenta de servicio
                (Firebase Console → Configuración del proyecto →
                 Cuentas de servicio → Generar nueva clave privada)
   4. Copiar la URL del worker (https://clearfigures-push.XXX.workers.dev)
      y pegarla en PUSH_WORKER_URL dentro de index.html.
   ═══════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  "https://clearfigures.app",
  "https://paularuiz21.github.io",
];

let cachedToken = null; // {token, exp} — se reutiliza entre requests calientes

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/* OAuth2: firma un JWT con la clave privada de la cuenta de servicio
   y lo canjea por un access token para la API de FCM. */
async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) return cachedToken.token;

  const enc = new TextEncoder();
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned =
    b64url(enc.encode(JSON.stringify(header))) + "." +
    b64url(enc.encode(JSON.stringify(claims)));

  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsigned));
  const jwt = unsigned + "." + b64url(sig);

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") +
          "&assertion=" + jwt,
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Token exchange falló: " + JSON.stringify(j));
  cachedToken = { token: j.access_token, exp: now + (j.expires_in || 3600) };
  return j.access_token;
}

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405, headers: cors });
    if (!ALLOWED_ORIGINS.includes(origin))
      return new Response("Forbidden", { status: 403 });

    try {
      const { token, title, body } = await request.json();
      if (!token || !title)
        return new Response(JSON.stringify({ error: "token y title requeridos" }),
          { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

      const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
      const accessToken = await getAccessToken(sa);

      const r = await fetch(
        `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              webpush: {
                notification: {
                  title,
                  body: body || "",
                  icon: "https://clearfigures.app/icons/icon.svg",
                },
                fcm_options: { link: "https://clearfigures.app/" },
              },
            },
          }),
        }
      );
      const j = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, fcm: j }),
        { status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }
  },
};
