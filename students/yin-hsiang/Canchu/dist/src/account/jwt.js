import * as jose from 'jose';
import env from '../../.env.json' assert { type: "json" };
const secret = jose.base64url.decode(env.jwtAccountSecret);
export async function encode(payload) {
    return await new jose.EncryptJWT(payload)
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256', 'typ': 'JWT' })
        .setIssuedAt()
        .setIssuer('canchu.timsu92.app')
        .setExpirationTime('2h')
        .encrypt(secret);
}
export async function decode(jwt) {
    return await jose.jwtDecrypt(jwt, secret);
}
