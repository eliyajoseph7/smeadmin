/**
 * Browser-compatible HMAC-SHA512 implementation
 * This provides a proper HMAC implementation that generates signatures
 * compatible with server-side JWT validation
 */

export class CryptoHMAC {
  /**
   * Generate HMAC-SHA512 signature compatible with Node.js crypto
   */
  public static hmacSha512(message: string, secret: string): string {
    // Convert strings to byte arrays
    const secretBytes = this.stringToBytes(secret);
    const messageBytes = this.stringToBytes(message);
    
    // HMAC algorithm implementation
    const blockSize = 128; // SHA-512 block size
    
    // Prepare the key
    let key = secretBytes;
    if (key.length > blockSize) {
      key = this.sha512Bytes(key);
    }
    if (key.length < blockSize) {
      const paddedKey = new Uint8Array(blockSize);
      paddedKey.set(key);
      key = paddedKey;
    }
    
    // Create inner and outer padding
    const innerPad = new Uint8Array(blockSize);
    const outerPad = new Uint8Array(blockSize);
    
    for (let i = 0; i < blockSize; i++) {
      innerPad[i] = key[i] ^ 0x36;
      outerPad[i] = key[i] ^ 0x5c;
    }
    
    // Compute HMAC
    const innerInput = new Uint8Array(innerPad.length + messageBytes.length);
    innerInput.set(innerPad);
    innerInput.set(messageBytes, innerPad.length);
    
    const innerHash = this.sha512Bytes(innerInput);
    
    const outerInput = new Uint8Array(outerPad.length + innerHash.length);
    outerInput.set(outerPad);
    outerInput.set(innerHash, outerPad.length);
    
    const finalHash = this.sha512Bytes(outerInput);
    
    // Convert to base64url
    return this.bytesToBase64Url(finalHash);
  }
  
  /**
   * Convert string to byte array
   */
  private static stringToBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }
  
  /**
   * Convert bytes to base64url format
   */
  private static bytesToBase64Url(bytes: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  /**
   * SHA-512 implementation for bytes
   * This is a simplified but functional SHA-512 implementation
   */
  private static sha512Bytes(input: Uint8Array): Uint8Array {
    // SHA-512 constants
    const K = [
      0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
      0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
      0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
      0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
      0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
      0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
      0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,
      0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
      0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
      0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn,
      0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,
      0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
      0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n,
      0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,
      0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
      0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn,
      0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n,
      0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn,
      0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn,
      0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n
    ];
    
    // Initial hash values
    let h0 = 0x6a09e667f3bcc908n;
    let h1 = 0xbb67ae8584caa73bn;
    let h2 = 0x3c6ef372fe94f82bn;
    let h3 = 0xa54ff53a5f1d36f1n;
    let h4 = 0x510e527fade682d1n;
    let h5 = 0x9b05688c2b3e6c1fn;
    let h6 = 0x1f83d9abfb41bd6bn;
    let h7 = 0x5be0cd19137e2179n;
    
    // Pre-processing
    const msgLen = input.length;
    const bitLen = BigInt(msgLen * 8);
    
    // Padding
    const paddedLen = Math.ceil((msgLen + 17) / 128) * 128;
    const padded = new Uint8Array(paddedLen);
    padded.set(input);
    padded[msgLen] = 0x80;
    
    // Append length as big-endian 128-bit integer
    const view = new DataView(padded.buffer);
    view.setBigUint64(paddedLen - 8, bitLen, false);
    
    // Process in 1024-bit chunks
    for (let chunk = 0; chunk < paddedLen; chunk += 128) {
      const w = new Array(80);
      
      // Copy chunk into first 16 words
      for (let i = 0; i < 16; i++) {
        w[i] = view.getBigUint64(chunk + i * 8, false);
      }
      
      // Extend the first 16 words into the remaining 64 words
      for (let i = 16; i < 80; i++) {
        const s0 = this.rotr64(w[i - 15], 1n) ^ this.rotr64(w[i - 15], 8n) ^ (w[i - 15] >> 7n);
        const s1 = this.rotr64(w[i - 2], 19n) ^ this.rotr64(w[i - 2], 61n) ^ (w[i - 2] >> 6n);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xffffffffffffffffn;
      }
      
      // Initialize working variables
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      
      // Main loop
      for (let i = 0; i < 80; i++) {
        const S1 = this.rotr64(e, 14n) ^ this.rotr64(e, 18n) ^ this.rotr64(e, 41n);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[i] + w[i]) & 0xffffffffffffffffn;
        const S0 = this.rotr64(a, 28n) ^ this.rotr64(a, 34n) ^ this.rotr64(a, 39n);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) & 0xffffffffffffffffn;
        
        h = g;
        g = f;
        f = e;
        e = (d + temp1) & 0xffffffffffffffffn;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) & 0xffffffffffffffffn;
      }
      
      // Add this chunk's hash to result
      h0 = (h0 + a) & 0xffffffffffffffffn;
      h1 = (h1 + b) & 0xffffffffffffffffn;
      h2 = (h2 + c) & 0xffffffffffffffffn;
      h3 = (h3 + d) & 0xffffffffffffffffn;
      h4 = (h4 + e) & 0xffffffffffffffffn;
      h5 = (h5 + f) & 0xffffffffffffffffn;
      h6 = (h6 + g) & 0xffffffffffffffffn;
      h7 = (h7 + h) & 0xffffffffffffffffn;
    }
    
    // Produce the final hash value
    const result = new Uint8Array(64);
    const resultView = new DataView(result.buffer);
    resultView.setBigUint64(0, h0, false);
    resultView.setBigUint64(8, h1, false);
    resultView.setBigUint64(16, h2, false);
    resultView.setBigUint64(24, h3, false);
    resultView.setBigUint64(32, h4, false);
    resultView.setBigUint64(40, h5, false);
    resultView.setBigUint64(48, h6, false);
    resultView.setBigUint64(56, h7, false);
    
    return result;
  }
  
  /**
   * Right rotate for 64-bit values
   */
  private static rotr64(value: bigint, amount: bigint): bigint {
    return ((value >> amount) | (value << (64n - amount))) & 0xffffffffffffffffn;
  }
}
