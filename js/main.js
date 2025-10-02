document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // BLOQUE 1: LÓGICA PARA CAMBIO DE TEMA (MODO CLARO/OSCURO)
    // ========================================================
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            themeToggle.textContent = '☀️';
        }
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        themeToggle.textContent = theme === 'dark-mode' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    });

    // ========================================================
    // BLOQUE 2: LÓGICA PARA CARGAR PROYECTOS EN CARRUSEL
    // ========================================================
    const projectsContainer = document.getElementById('projects-container');
    let mySwiper; // Variable para mantener la instancia del carrusel

    const loadProjects = async (language) => {
        if (!projectsContainer) return;

        if (mySwiper) {
            mySwiper.destroy(true, true); // Destruye el carrusel anterior para evitar duplicados
        }

        const response = await fetch('lang/projects-data.json'); // Usamos un archivo separado para los datos
        const projects = await response.json();

        projectsContainer.innerHTML = '';

        projects.forEach(project => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            const imageHtml = project.image ? `<img src="${project.image}" alt="${project.title[language]}">` : '';
            const tagsHtml = project.tags.map(tag => `<span>${tag}</span>`).join('');

            slide.innerHTML = `
                <article class="project-card">
                    ${imageHtml}
                    <div class="project-card-content">
                        <h3>${project.title[language]}</h3>
                        <p>${project.description[language]}</p>
                        <div class="project-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                </article>
            `;
            projectsContainer.appendChild(slide);
        });

        // Inicializa SwiperJS con las opciones del carrusel
        mySwiper = new Swiper('.mySwiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    };

    // ========================================================
    // BLOQUE 3: LÓGICA PARA CAMBIO DE IDIOMA (ESCALABLE)
    // ========================================================
    const langSelector = document.getElementById('lang-selector');
    const componentsToTranslate = ['common', 'about', 'projects'];

    const changeLanguage = async (language) => {
        try {
            const requests = componentsToTranslate.map(component => fetch(`lang/${language}/${component}.json`));
            const responses = await Promise.all(requests);
            const translationsJson = await Promise.all(responses.map(res => res.json()));
            const translations = translationsJson.reduce((acc, current) => ({ ...acc, ...current }), {});

            document.querySelectorAll('[data-key]').forEach(elem => {
                const key = elem.getAttribute('data-key');
                if (translations[key]) {
                    elem.textContent = translations[key];
                }
            });

            document.documentElement.lang = language;
            
            // Llama a la función para cargar/recargar los proyectos en el idioma correcto
            await loadProjects(language);

        } catch (error) {
            console.error('Error al cargar los archivos de traducción:', error);
        }
    };

    langSelector.addEventListener('change', (event) => {
        changeLanguage(event.target.value);
    });

    // Carga inicial de la página en español
    changeLanguage('es');
});