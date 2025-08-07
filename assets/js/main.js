document.addEventListener('DOMContentLoaded', function() {
    // --- CACHE DE SELETORES ---
    const themeSwitch = document.querySelector('.theme-switch');
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const navOverlay = document.querySelector('.nav-overlay');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a');
    const body = document.body;
    const dropdownHeaders = document.querySelectorAll('.tema-header');
    const publicationsGrid = document.querySelector('.publicacoes-grid');

    // --- LÓGICA DE TEMA ---
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // --- LÓGICA DO MENU DE NAVEGAÇÃO ---
    const toggleMenu = () => {
        const isActive = navMenu.classList.contains('active');
        menuToggle.classList.toggle('active', !isActive);
        navMenu.classList.toggle('active', !isActive);
        navOverlay.classList.toggle('active', !isActive);
        body.style.overflow = !isActive ? 'hidden' : '';
    };

    if (menuToggle && closeMenuBtn && navOverlay && navMenu) {
        [menuToggle, closeMenuBtn, navOverlay].forEach(el => el.addEventListener('click', toggleMenu));
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // --- LÓGICA DO ACCORDION (COM ACESSIBILIDADE) ---
    const toggleSection = (headerToActivate) => {
        const contentToActivate = headerToActivate.nextElementSibling;
        const isAlreadyActive = contentToActivate.classList.contains('active');

        // Fecha todos os outros e reseta seus atributos ARIA
        dropdownHeaders.forEach(header => {
            const content = header.nextElementSibling;
            if (content !== contentToActivate) {
                content.classList.remove('active');
                header.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                if (header.querySelector('.dropdown-arrow')) {
                    header.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
                }
            }
        });

        // Abre/fecha o dropdown clicado e atualiza seu ARIA
        if (!isAlreadyActive) {
            contentToActivate.classList.add('active');
            headerToActivate.classList.add('active');
            headerToActivate.setAttribute('aria-expanded', 'true');
            if (headerToActivate.querySelector('.dropdown-arrow')) {
                headerToActivate.querySelector('.dropdown-arrow').style.transform = 'rotate(180deg)';
            }
        } else {
            contentToActivate.classList.remove('active');
            headerToActivate.classList.remove('active');
            headerToActivate.setAttribute('aria-expanded', 'false');
            if (headerToActivate.querySelector('.dropdown-arrow')) {
                headerToActivate.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
            }
        }
    };

    if (dropdownHeaders.length > 0) {
        dropdownHeaders.forEach(header => {
            // Evento de clique para mouse
            header.addEventListener('click', () => toggleSection(header));

            // Evento de teclado para acessibilidade
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Previne o comportamento padrão (ex: rolar a página com a barra de espaço)
                    toggleSection(header);
                }
            });
        });

        // Abrir o primeiro grupo por padrão e ajustar seu ARIA
        if (dropdownHeaders[0]) {
            toggleSection(dropdownHeaders[0]);
        }
    }

    // --- LÓGICA PARA CARREGAR PUBLICAÇÕES DINAMICAMENTE ---
    const createPublicationCard = (pub) => {
        return `
            <div class="publicacao-card">
                <div class="publicacao-image">
                    <img src="${pub.imageSrc}" alt="${pub.imageAlt}">
                </div>
                <div class="publicacao-content">
                    <span class="publicacao-meta">${pub.meta}</span>
                    <h3 class="publicacao-title">${pub.title}</h3>
                    <p class="publicacao-description">${pub.description}</p>
                </div>
                <a href="${pub.linkHref}" target="_blank" class="publicacao-link">${pub.linkText}</a>
            </div>
        `;
    };

    const loadPublications = async () => {
        if (!publicationsGrid) return;

        publicationsGrid.innerHTML = "<p>Carregando publicações...</p>";

        try {
            const response = await fetch('data/publications.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const publications = await response.json();

            if (publications.length > 0) {
                publicationsGrid.innerHTML = publications.map(createPublicationCard).join('');
            } else {
                publicationsGrid.innerHTML = "<p>Nenhuma publicação encontrada.</p>";
            }
        } catch (error) {
            console.error("Erro ao carregar as publicações:", error);
            publicationsGrid.innerHTML = "<p>Não foi possível carregar as publicações no momento. Tente novamente mais tarde.</p>";
        }
    };

    loadPublications();
});
