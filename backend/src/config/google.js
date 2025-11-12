// C:\qhatu\backend\src\config\google.js
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    return {
      google_id: payload['sub'],
      email: payload['email'],
      email_verified: payload['email_verified'],
      nombre_completo: payload['name'],
      foto_perfil_url: payload['picture']
    };
  } catch (error) {
    console.error('Error verificando token de Google:', error);
    throw new Error('Token de Google inválido');
  }
};

export default { verifyGoogleToken };