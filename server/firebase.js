import admin from 'firebase-admin';

const initFirebase = () => {
  if (admin.apps.length) return;

  let serviceAccount;

  try {
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    serviceAccount = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'firebase-config.json'), 'utf8')
    );
  } catch {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'homeinventory-3327c';
    serviceAccount = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
    };

    if (!serviceAccount.private_key) {
      console.error('No se encontraron credenciales de Firebase (ni firebase-config.json ni env vars)');
      throw new Error('Firebase credentials not configured');
    }
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
};

initFirebase();

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
