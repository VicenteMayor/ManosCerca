// Wrapper para IndexedDB
class Database {
    constructor() {
        this.dbName = 'ManosCercaDB';
        this.version = 1;
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear object store para proveedores
                if (!db.objectStoreNames.contains('providers')) {
                    const store = db.createObjectStore('providers', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Crear índices para búsquedas
                    store.createIndex('category', 'category', { unique: false });
                    store.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }
    
    async addProvider(provider) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['providers'], 'readwrite');
            const store = transaction.objectStore('providers');
            const request = store.add(provider);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async getAllProviders() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['providers'], 'readonly');
            const store = transaction.objectStore('providers');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async getProvider(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['providers'], 'readonly');
            const store = transaction.objectStore('providers');
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async updateProvider(provider) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['providers'], 'readwrite');
            const store = transaction.objectStore('providers');
            const request = store.put(provider);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async deleteProvider(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['providers'], 'readwrite');
            const store = transaction.objectStore('providers');
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    async clearProviders() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['providers'], 'readwrite');
            const store = transaction.objectStore('providers');
            const request = store.clear();
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

// Crear instancia global de la base de datos
const db = new Database();