function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(bytes)))
}

function fromBase64(str: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
}

export function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./crypto.worker.ts', import.meta.url),
    )
    worker.onmessage = (e: MessageEvent<{ key: CryptoKey }>) => {
      resolve(e.data.key)
      worker.terminate()
    }
    worker.onerror = (e) => {
      reject(e)
      worker.terminate()
    }
    worker.postMessage({ password, salt })
  })
}

export async function encrypt(
  text: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text),
  )
  return {
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    iv: toBase64(iv),
  }
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext),
  )
  return new TextDecoder().decode(plaintext)
}
