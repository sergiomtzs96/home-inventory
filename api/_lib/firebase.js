import admin from 'firebase-admin';

let db = null;
let auth = null;

const projectId = process.env.FIREBASE_PROJECT_ID || 'homeinventory-3327c';

const useEmulator = !process.env.FIREBASE_PRIVATE_KEY;

if (!useEmulator) {
  try {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const privateKey = rawKey.startsWith('-----BEGIN')
      ? rawKey
      : rawKey.replace(/\\n/g, '\n');

    const serviceAccount = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
    };

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    db = admin.firestore();
    auth = admin.auth();
  } catch (err) {
    console.error('Firebase init error:', err.message, err.stack?.split('\n').slice(0, 3).join('\n'));
  }
}

export { db, auth };
