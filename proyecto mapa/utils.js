// Utilidades para la aplicación ManosCerca
const utils = {
    // Calcular distancia entre dos puntos usando la fórmula de Haversine
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceKm = R * c;
        
        // Devolver en metros si es menos de 1 km
        if (distanceKm < 1) {
            return {
                value: distanceKm * 1000,
                unit: 'm'
            };
        } else {
            return {
                value: distanceKm,
                unit: 'km'
            };
        }
    },
    
    deg2rad(deg) {
        return deg * (Math.PI/180);
    },
    
    // Codificar a base64 (URL safe)
    base64Encode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, 
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    },
    
    // Decodificar desde base64 (URL safe)
    base64Decode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
            str += '=';
        }
        
        return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    },
    
    // Validar email
    isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    
    // Formatear número de teléfono
    formatPhoneNumber(phone) {
        // Eliminar todo excepto números
        const cleaned = ('' + phone).replace(/\D/g, '');
        
        // Verificar si el número tiene la longitud correcta
        const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{3})$/);
        if (match) {
            return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
        }
        
        return phone;
    },
    
    // Obtener categorías disponibles
    getCategories() {
        return {
            'gasfiteria': 'Gasfitería',
            'carpinteria': 'Carpintería',
            'electricidad': 'Electricidad',
            'jardineria': 'Jardinería',
            'reparacion': 'Reparaciones generales',
            'electronica': 'Electrónica',
            'pintura': 'Pintura',
            'mecanica': 'Mecánica'
        };
    },
    
    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};