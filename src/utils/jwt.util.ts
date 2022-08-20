import * as jwt from 'jsonwebtoken';
import { AES, enc } from 'crypto-js';
class JwtUtil {
    verifyPreauthToken(token, callback, errorCallback) {
        const config = require('../config');
        if (config.jwt.client.encryptionFlag) {
            const x = new Date();
            const utcDate = new Date(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), x.getUTCHours(), x.getUTCMinutes(), x.getUTCSeconds());
            const time = x.getTime() + (config.jwt.client.expireTime * 60 * 1000);
            const utcTime = utcDate.getTime() + config.jwt.client.expireTime * 60 * 1000;
            const cipherText = enc.Hex.parse(token);
            let clientTime = AES.decrypt(cipherText.toString(enc.Base64), config.jwt.client.id).toString(enc.Utf8);
            clientTime = parseInt(clientTime, 10);
            if(!isNaN(clientTime) && (clientTime < time || clientTime < utcTime)) {
                callback();
            } else {
                errorCallback();
            }
        } else {
            if (token == config.jwt.client.id) {
                callback();
            } else {
                errorCallback();
            }
        }
    }

    verifyPostauthToken(token, callback, errorCallback) {
        const config = require('../config');
        token = this.fromBase64(token);
        jwt.verify(token, config.jwt.secret, (err, decoded) => {
          if (err) {
            errorCallback();
          } else {
            const date = new Date();
            if (date.getTime() > decoded.time) {
                errorCallback();
            } else {
                callback(decoded);
            }
          }
        });
    }

    generatePostauthToken(userId, userType) {  // HIGH SECURITY
        const config = require('../config');
        const date = new Date();
        const payload = { userId: userId, userType: userType, time: date.getTime() + (config.jwt.authTokenInterval * 60 * 1000)};
        return this.toBase64(jwt.sign(payload, config.jwt.appSecret));
    }

    authenticateToken(token, callback, errorCallback) {
        const config = require('../config');
        // token = this.fromBase64(token);
        jwt.verify(token, config.jwt.secret, (err, decoded) => {
          if (err) {
            errorCallback();
          } else {
            callback(decoded);
          }
        });
    }

    generateAccessToken(id, packageId, custId, extNumber, token, apitoken, userType?, app_type?) {  // LOW SECURITY -- right now its working
        const config = require('../config');
        const date = new Date();
        const payload = { id: id, package_id:packageId, customer_id:custId, ext_number:extNumber, token : '', user_type : userType, app_type : app_type, api_access : apitoken};
        // return jwt.sign(payload, config.jwt.secret,{ expiresIn: '1800s' });
        return jwt.sign(payload, config.jwt.secret);
    }
    

    private toBase64(token: string) {
        return Buffer.from(token).toString('base64');
    }

    private fromBase64(token: string) {
        return Buffer.from(token, 'base64').toString('ascii');
    }

    
 cipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

    return text => text.split('')
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
}
    
 decipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
}
}

module.exports = JwtUtil;
