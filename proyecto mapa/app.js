// Aplicación principal de ManosCerca
class ManosCercaApp {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.providers = [];
        this.markers = [];
        this.currentProvider = null;
        this.filteredProviders = [];
        
        this.init();
    }
    
    async init() {
        // Inicializar la base de datos
        await db.init();
        
        // Cargar proveedores existentes
        this.providers = await db.getAllProviders();
        
        // Inicializar el mapa
        this.initMap();
        
        // Cargar datos de ejemplo si no hay proveedores
        if (this.providers.length === 0) {
            await this.loadSampleData();
            this.providers = await db.getAllProviders();
        }
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Mostrar proveedores en el mapa
        this.displayProviders();
        
        // Verificar si hay un perfil para importar desde la URL
        this.checkForSharedProfile();
    }
    
    initMap() {
        // Crear el mapa centrado en una ubicación por defecto (Madrid)
        this.map = L.map('map').setView([40.4168, -3.7038], 12);
        
        // Añadir capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // Intentar obtener la ubicación del usuario
        this.getUserLocation();
    }
    
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Centrar el mapa en la ubicación del usuario
                    this.map.setView([this.userLocation.lat, this.userLocation.lng], 13);
                    
                    // Añadir marcador para la ubicación del usuario
                    L.marker([this.userLocation.lat, this.userLocation.lng])
                        .addTo(this.map)
                        .bindPopup('Tu ubicación actual')
                        .openPopup();
                        
                    // Actualizar la lista de proveedores con distancias
                    this.calculateDistances();
                    this.displayProviders();
                },
                (error) => {
                    console.error('Error obteniendo la ubicación:', error);
                    this.showLocationError();
                }
            );
        } else {
            this.showLocationError();
        }
    }
    
    showLocationError() {
        document.getElementById('locationStatus').textContent = 
            'No se pudo obtener tu ubicación. Puedes introducirla manualmente.';
        document.getElementById('locationStatus').className = 'location-status error';
    }
    
    async loadSampleData() {
        // Cargar datos de ejemplo si no hay proveedores en la base de datos
        const sampleProviders = [
            {
                id: 1,
                name: "María González",
                email: "maria.gonzalez@email.com",
                phone: "+34 612 345 678",
                category: "carpinteria",
                description: "Carpintera con 10 años de experiencia. Reparo muebles, hago muebles a medida y arreglo sillas.",
                lat: 40.4158,
                lng: -3.7038
            },
            {
                id: 2,
                name: "Carlos Rodríguez",
                email: "carlos.rodriguez@email.com",
                phone: "+34 623 456 789",
                category: "gasfiteria",
                description: "Gasfitero profesional. Reparación de tuberías, instalación de grifería y solución de problemas de fontanería.",
                lat: 40.4178,
                lng: -3.7058
            },
            {
                id: 3,
                name: "Ana López",
                email: "ana.lopez@email.com",
                phone: "+34 634 567 890",
                category: "electricidad",
                description: "Electricista certificada. Instalaciones eléctricas, reparación de enchufes y solución de problemas de cortocircuitos.",
                lat: 40.4198,
                lng: -3.7078
            },
            {
                id: 4,
                name: "Javier Martínez",
                email: "javier.martinez@email.com",
                phone: "+34 645 678 901",
                category: "jardineria",
                description: "Servicios de jardinería y paisajismo. Podas, diseño de jardines y mantenimiento de áreas verdes.",
                lat: 40.4218,
                lng: -3.7098
            }
        ];
        
        for (const provider of sampleProviders) {
            await db.addProvider(provider);
        }
    }
    
    setupEventListeners() {
        // Botón para centrar en la ubicación del usuario
        document.getElementById('locateMe').addEventListener('click', () => {
            this.getUserLocation();
        });
        
        // Botón para añadir proveedor
        document.getElementById('addProvider').addEventListener('click', () => {
            this.openRegistrationModal();
        });
        
        // Botón para aplicar filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        // Botón para limpiar filtros
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Cerrar modales
        document.getElementById('closeRegistrationModal').addEventListener('click', () => {
            this.closeRegistrationModal();
        });
        
        document.getElementById('closeDataModal').addEventListener('click', () => {
            this.closeDataModal();
        });
        
        document.getElementById('closeDetailsPanel').addEventListener('click', () => {
            this.closeDetailsPanel();
        });
        
        document.getElementById('closePrivacyNotice').addEventListener('click', () => {
            document.getElementById('privacyNotice').style.display = 'none';
        });
        
        // Cancelar registro
        document.getElementById('cancelRegistration').addEventListener('click', () => {
            this.closeRegistrationModal();
        });
        
        // Detectar ubicación en el formulario
        document.getElementById('detectLocation').addEventListener('click', () => {
            this.detectLocationForForm();
        });
        
        // Enviar formulario de registro
        document.getElementById('providerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerProvider();
        });
        
        // Event listeners para importar/exportar
        document.getElementById('generateLink').addEventListener('click', () => {
            this.generateShareLink();
        });
        
        document.getElementById('downloadJSON').addEventListener('click', () => {
            this.downloadProviderJSON();
        });
        
        document.getElementById('copyLink').addEventListener('click', () => {
            this.copyShareLink();
        });
        
        document.getElementById('uploadJSON').addEventListener('click', () => {
            document.getElementById('jsonFileInput').click();
        });
        
        document.getElementById('jsonFileInput').addEventListener('change', (e) => {
            this.importFromFile(e.target.files[0]);
        });
        
        document.getElementById('importFromLink').addEventListener('click', () => {
            this.importFromLink();
        });
        
        // Permitir cerrar modales haciendo clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                }
            });
        });
    }
    
    displayProviders() {
        // Limpiar marcadores existentes
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // Determinar qué proveedores mostrar (filtrados o todos)
        const providersToShow = this.filteredProviders.length > 0 ? 
            this.filteredProviders : this.providers;
        
        // Actualizar contador de resultados
        document.getElementById('resultsCount').textContent = `(${providersToShow.length})`;
        
        // Mostrar proveedores en el mapa
        providersToShow.forEach(provider => {
            const marker = L.marker([provider.lat, provider.lng])
                .addTo(this.map)
                .bindPopup(this.createPopupContent(provider));
            
            marker.providerId = provider.id;
            
            marker.on('click', () => {
                this.showProviderDetails(provider);
            });
            
            this.markers.push(marker);
        });
        
        // Actualizar la lista de resultados
        this.updateResultsList(providersToShow);
    }
    
    createPopupContent(provider) {
        const distance = this.userLocation ? 
            utils.calculateDistance(
                this.userLocation.lat, 
                this.userLocation.lng, 
                provider.lat, 
                provider.lng
            ) : null;
            
        const distanceText = distance ? 
            `${distance.value.toFixed(1)} ${distance.unit}` : 'Distancia no disponible';
        
        return `
            <div class="provider-popup">
                <div class="popup-name">${provider.name}</div>
                <div class="popup-category">${this.getCategoryName(provider.category)}</div>
                <div class="popup-distance">${distanceText}</div>
                <div class="popup-actions">
                    <button onclick="app.showProviderDetails(${provider.id})" class="btn-primary" style="font-size: 0.8rem; padding: 0.4rem;">
                        <i class="fas fa-eye"></i> Ver detalles
                    </button>
                </div>
            </div>
        `;
    }
    
    updateResultsList(providers) {
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = '';
        
        if (providers.length === 0) {
            resultsList.innerHTML = '<p>No se encontraron proveedores que coincidan con los filtros.</p>';
            return;
        }
        
        providers.forEach(provider => {
            const distance = this.userLocation ? 
                utils.calculateDistance(
                    this.userLocation.lat, 
                    this.userLocation.lng, 
                    provider.lat, 
                    provider.lng
                ) : null;
                
            const distanceText = distance ? 
                `${distance.value.toFixed(1)} ${distance.unit}` : 'Distancia no disponible';
            
            const card = document.createElement('div');
            card.className = 'result-card';
            card.dataset.providerId = provider.id;
            
            card.innerHTML = `
                <div class="provider-name">${provider.name}</div>
                <div class="provider-category">${this.getCategoryName(provider.category)}</div>
                <div class="provider-distance">${distanceText}</div>
                <div class="provider-description">${provider.description}</div>
                <div class="result-actions">
                    <button class="btn-primary" onclick="app.showProviderDetails(${provider.id})">
                        <i class="fas fa-eye"></i> Ver contacto
                    </button>
                </div>
            `;
            
            card.addEventListener('click', () => {
                this.showProviderDetails(provider.id);
            });
            
            resultsList.appendChild(card);
        });
    }
    
    showProviderDetails(providerId) {
        // Si se pasa un ID en lugar de un objeto, buscar el proveedor
        const provider = typeof providerId === 'number' ? 
            this.providers.find(p => p.id === providerId) : providerId;
            
        if (!provider) return;
        
        this.currentProvider = provider;
        
        // Calcular distancia si tenemos ubicación del usuario
        const distance = this.userLocation ? 
            utils.calculateDistance(
                this.userLocation.lat, 
                this.userLocation.lng, 
                provider.lat, 
                provider.lng
            ) : null;
            
        const distanceText = distance ? 
            `${distance.value.toFixed(1)} ${distance.unit}` : 'Distancia no disponible';
        
        // Actualizar el contenido del panel de detalles
        document.getElementById('panelContent').innerHTML = `
            <div class="provider-details">
                <div class="detail-item">
                    <div class="detail-label">Nombre</div>
                    <div class="detail-value">${provider.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Categoría</div>
                    <div class="detail-value">${this.getCategoryName(provider.category)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Distancia</div>
                    <div class="detail-value">${distanceText}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Descripción</div>
                    <div class="detail-value">${provider.description}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Correo electrónico</div>
                    <div class="detail-value">${provider.email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Teléfono</div>
                    <div class="detail-value">${provider.phone}</div>
                </div>
                <div class="contact-actions">
                    <button class="btn-primary" onclick="app.copyToClipboard('${provider.email}', 'Correo electrónico copiado')">
                        <i class="fas fa-copy"></i> Copiar correo
                    </button>
                    <button class="btn-primary" onclick="app.copyToClipboard('${provider.phone}', 'Teléfono copiado')">
                        <i class="fas fa-copy"></i> Copiar teléfono
                    </button>
                </div>
                <div class="contact-actions">
                    <button class="btn-secondary" onclick="app.shareProvider(${provider.id})">
                        <i class="fas fa-share-alt"></i> Compartir perfil
                    </button>
                </div>
            </div>
        `;
        
        // Abrir el panel de detalles
        document.getElementById('detailsPanel').classList.add('open');
        
        // Centrar el mapa en el proveedor y abrir su popup
        this.map.setView([provider.lat, provider.lng], 15);
        
        // Encontrar y abrir el marcador correspondiente
        const marker = this.markers.find(m => m.providerId === provider.id);
        if (marker) {
            marker.openPopup();
        }
        
        // Resaltar la tarjeta en la lista de resultados
        document.querySelectorAll('.result-card').forEach(card => {
            card.classList.remove('active');
            if (parseInt(card.dataset.providerId) === provider.id) {
                card.classList.add('active');
            }
        });
    }
    
    closeDetailsPanel() {
        document.getElementById('detailsPanel').classList.remove('open');
        this.currentProvider = null;
    }
    
    openRegistrationModal() {
        document.getElementById('registrationModal').classList.add('open');
        document.getElementById('providerForm').reset();
        document.getElementById('locationStatus').textContent = '';
        document.getElementById('locationStatus').className = 'location-status';
    }
    
    closeRegistrationModal() {
        document.getElementById('registrationModal').classList.remove('open');
    }
    
    detectLocationForForm() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    document.getElementById('manualLat').value = position.coords.latitude;
                    document.getElementById('manualLng').value = position.coords.longitude;
                    document.getElementById('locationStatus').textContent = 'Ubicación detectada correctamente';
                    document.getElementById('locationStatus').className = 'location-status success';
                },
                (error) => {
                    document.getElementById('locationStatus').textContent = 
                        'Error al detectar la ubicación. Introduce las coordenadas manualmente.';
                    document.getElementById('locationStatus').className = 'location-status error';
                }
            );
        } else {
            document.getElementById('locationStatus').textContent = 
                'La geolocalización no está disponible en este navegador. Introduce las coordenadas manualmente.';
            document.getElementById('locationStatus').className = 'location-status error';
        }
    }
    
    async registerProvider() {
        const form = document.getElementById('providerForm');
        const formData = new FormData(form);
        
        // Validar campos requeridos
        const name = document.getElementById('providerName').value.trim();
        const email = document.getElementById('providerEmail').value.trim();
        const phone = document.getElementById('providerPhone').value.trim();
        const category = document.getElementById('providerCategory').value;
        const description = document.getElementById('providerDescription').value.trim();
        const lat = document.getElementById('manualLat').value.trim();
        const lng = document.getElementById('manualLng').value.trim();
        
        if (!name || !email || !phone || !category || !description || !lat || !lng) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
        
        // Validar coordenadas
        if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            alert('Las coordenadas deben ser números válidos.');
            return;
        }
        
        // Crear objeto proveedor
        const provider = {
            name,
            email,
            phone,
            category,
            description,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };
        
        // Guardar en la base de datos
        const id = await db.addProvider(provider);
        provider.id = id;
        
        // Añadir a la lista de proveedores
        this.providers.push(provider);
        
        // Cerrar el modal
        this.closeRegistrationModal();
        
        // Mostrar el proveedor en el mapa
        this.displayProviders();
        
        // Mostrar mensaje de éxito
        alert('Proveedor registrado correctamente. Ahora aparecerá en el mapa para otros usuarios.');
    }
    
    applyFilters() {
        const categoryFilter = Array.from(document.getElementById('categoryFilter').selectedOptions)
            .map(option => option.value);
        const distanceFilter = document.getElementById('distanceFilter').value;
        const keywordFilter = document.getElementById('keywordFilter').value.toLowerCase();
        
        this.filteredProviders = this.providers.filter(provider => {
            // Filtro por categoría
            if (categoryFilter.length > 0 && !categoryFilter.includes(provider.category)) {
                return false;
            }
            
            // Filtro por palabra clave
            if (keywordFilter && 
                !provider.name.toLowerCase().includes(keywordFilter) && 
                !provider.description.toLowerCase().includes(keywordFilter)) {
                return false;
            }
            
            // Filtro por distancia (si tenemos ubicación del usuario)
            if (this.userLocation && distanceFilter !== 'all') {
                const distance = utils.calculateDistance(
                    this.userLocation.lat, 
                    this.userLocation.lng, 
                    provider.lat, 
                    provider.lng
                );
                
                const maxDistance = parseInt(distanceFilter);
                
                if (distance.unit === 'km' && distance.value > maxDistance) {
                    return false;
                } else if (distance.unit === 'm' && distance.value / 1000 > maxDistance) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.displayProviders();
    }
    
    clearFilters() {
        document.getElementById('categoryFilter').selectedIndex = -1;
        document.getElementById('distanceFilter').value = '5';
        document.getElementById('keywordFilter').value = '';
        this.filteredProviders = [];
        this.displayProviders();
    }
    
    calculateDistances() {
        // Las distancias se calculan en tiempo real cuando se muestran los proveedores
        // Esta función se llama cuando se obtiene la ubicación del usuario
    }
    
    getCategoryName(category) {
        const categories = {
            'gasfiteria': 'Gasfitería',
            'carpinteria': 'Carpintería',
            'electricidad': 'Electricidad',
            'jardineria': 'Jardinería',
            'reparacion': 'Reparaciones generales',
            'electronica': 'Electrónica',
            'pintura': 'Pintura',
            'mecanica': 'Mecánica'
        };
        
        return categories[category] || category;
    }
    
    copyToClipboard(text, message) {
        navigator.clipboard.writeText(text).then(() => {
            alert(message);
        }).catch(err => {
            console.error('Error al copiar al portapapeles: ', err);
        });
    }
    
    async shareProvider(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;
        
        this.currentProvider = provider;
        this.openDataModal('export');
    }
    
    openDataModal(mode) {
        document.getElementById('dataModal').classList.add('open');
        
        if (mode === 'export') {
            document.getElementById('dataModalTitle').textContent = 'Compartir perfil';
            document.getElementById('exportSection').style.display = 'block';
            document.getElementById('importSection').style.display = 'none';
        } else {
            document.getElementById('dataModalTitle').textContent = 'Importar perfil';
            document.getElementById('exportSection').style.display = 'none';
            document.getElementById('importSection').style.display = 'block';
        }
    }
    
    closeDataModal() {
        document.getElementById('dataModal').classList.remove('open');
        document.getElementById('generatedLink').style.display = 'none';
        document.getElementById('importLink').value = '';
    }
    
    generateShareLink() {
        if (!this.currentProvider) return;
        
        // Codificar el perfil en base64
        const providerJSON = JSON.stringify(this.currentProvider);
        const encodedProvider = utils.base64Encode(providerJSON);
        
        // Generar enlace
        const currentUrl = window.location.href.split('?')[0];
        const shareLink = `${currentUrl}?share=${encodedProvider}`;
        
        // Mostrar enlace
        document.getElementById('shareLink').value = shareLink;
        document.getElementById('generatedLink').style.display = 'block';
    }
    
    downloadProviderJSON() {
        if (!this.currentProvider) return;
        
        const dataStr = JSON.stringify(this.currentProvider, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `perfil-${this.currentProvider.name.replace(/\s+/g, '-')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    copyShareLink() {
        const shareLinkInput = document.getElementById('shareLink');
        shareLinkInput.select();
        document.execCommand('copy');
        alert('Enlace copiado al portapapeles');
    }
    
    importFromFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const provider = JSON.parse(e.target.result);
                this.importProvider(provider);
            } catch (error) {
                alert('Error: El archivo no es un JSON válido');
            }
        };
        reader.readAsText(file);
    }
    
    importFromLink() {
        const importLink = document.getElementById('importLink').value.trim();
        if (!importLink) return;
        
        try {
            // Extraer el parámetro share de la URL
            const url = new URL(importLink);
            const shareParam = url.searchParams.get('share');
            
            if (!shareParam) {
                alert('El enlace no contiene un perfil válido');
                return;
            }
            
            // Decodificar el perfil
            const providerJSON = utils.base64Decode(shareParam);
            const provider = JSON.parse(providerJSON);
            
            this.importProvider(provider);
        } catch (error) {
            alert('Error: No se pudo importar el perfil desde el enlace');
        }
    }
    
    async importProvider(provider) {
        // Validar que el provider tenga todos los campos necesarios
        const requiredFields = ['name', 'email', 'phone', 'category', 'description', 'lat', 'lng'];
        const missingFields = requiredFields.filter(field => !provider[field]);
        
        if (missingFields.length > 0) {
            alert(`El perfil no es válido. Faltan campos: ${missingFields.join(', ')}`);
            return;
        }
        
        // Confirmar importación
        const confirmImport = confirm(
            `¿Quieres importar el perfil de ${provider.name}? Esta acción añadirá el proveedor a tu mapa local.`
        );
        
        if (!confirmImport) return;
        
        // Asignar un nuevo ID para evitar conflictos
        delete provider.id;
        
        // Guardar en la base de datos
        const id = await db.addProvider(provider);
        provider.id = id;
        
        // Añadir a la lista de proveedores
        this.providers.push(provider);
        
        // Cerrar el modal
        this.closeDataModal();
        
        // Mostrar el proveedor en el mapa
        this.displayProviders();
        
        alert('Proveedor importado correctamente');
    }
    
    checkForSharedProfile() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareParam = urlParams.get('share');
        
        if (shareParam) {
            try {
                // Decodificar el perfil
                const providerJSON = utils.base64Decode(shareParam);
                const provider = JSON.parse(providerJSON);
                
                // Preguntar si quiere importar
                const importProfile = confirm(
                    `Se ha detectado un perfil compartido para ${provider.name}. ¿Quieres importarlo a tu mapa?`
                );
                
                if (importProfile) {
                    this.importProvider(provider);
                    
                    // Limpiar la URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error('Error al procesar perfil compartido:', error);
            }
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ManosCercaApp();
});