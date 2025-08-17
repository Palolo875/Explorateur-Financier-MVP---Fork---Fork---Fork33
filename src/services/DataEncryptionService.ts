/**
 * Service de chiffrement des données financières
 * Utilise Web Crypto API avec AES-256-GCM pour un chiffrement sécurisé
 */
export class DataEncryptionService {
  private static instance: DataEncryptionService;
  private encryptionKey: CryptoKey | null = null;
  private keyDerivationSalt: Uint8Array | null = null;

  private constructor() {}

  public static getInstance(): DataEncryptionService {
    if (!DataEncryptionService.instance) {
      DataEncryptionService.instance = new DataEncryptionService();
    }
    return DataEncryptionService.instance;
  }

  /**
   * Initialise la clé de chiffrement à partir d'un mot de passe utilisateur
   */
  async initializeKey(password: string): Promise<void> {
    try {
      // Génère ou récupère le salt pour la dérivation de clé
      this.keyDerivationSalt = await this.getOrCreateSalt();
      
      // Dérive la clé de chiffrement à partir du mot de passe
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: this.keyDerivationSalt,
          iterations: 100000, // 100k iterations pour la sécurité
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la clé:', error);
      throw new Error('Impossible d\'initialiser le chiffrement');
    }
  }

  /**
   * Génère ou récupère le salt stocké localement
   */
  private async getOrCreateSalt(): Promise<Uint8Array> {
    const storedSalt = localStorage.getItem('rivela_key_salt');
    
    if (storedSalt) {
      return new Uint8Array(JSON.parse(storedSalt));
    }

    // Génère un nouveau salt
    const newSalt = crypto.getRandomValues(new Uint8Array(32));
    localStorage.setItem('rivela_key_salt', JSON.stringify(Array.from(newSalt)));
    return newSalt;
  }

  /**
   * Chiffre des données
   */
  async encrypt(data: any): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Clé de chiffrement non initialisée');
    }

    try {
      const jsonData = JSON.stringify(data);
      const encodedData = new TextEncoder().encode(jsonData);
      
      // Génère un IV unique pour chaque chiffrement
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encodedData
      );

      // Combine IV + données chiffrées
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Retourne en base64 pour le stockage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      throw new Error('Impossible de chiffrer les données');
    }
  }

  /**
   * Déchiffre des données
   */
  async decrypt(encryptedData: string): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Clé de chiffrement non initialisée');
    }

    try {
      // Décode depuis base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Sépare IV et données chiffrées
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      const jsonString = new TextDecoder().decode(decryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      throw new Error('Impossible de déchiffrer les données');
    }
  }

  /**
   * Vérifie si le service est initialisé
   */
  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Nettoie les clés en mémoire (pour le mode incognito)
   */
  clearKeys(): void {
    this.encryptionKey = null;
    this.keyDerivationSalt = null;
  }
}