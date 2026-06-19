const BASE_URL = 'https://6a33956ec6ca2aee43866289.mockapi.io/'; 

let map; 

function initHero() {
    document.getElementById('event-description').innerText = 
        'Էրեբունին հանդիսացել է ռազմաստրատեգիական կարևորագույն կենտրոն Արարատյան դաշտում։ Ուրարտական պետության անկումից հետո էլ այն շարունակել է գոյատևել՝ փոխակերպվելով դարերի միջով ընդհուպ մինչև ժամանակակից Երևանը։';
}

async function loadTimeline() {
    try {
        const response = await fetch(`${BASE_URL}/timeline`);
        const data = await response.json();
        
        const container = document.getElementById('timeline-container');
        if (container) container.innerHTML = '';

        data.forEach(item => {
            if (item.period === 'PLAN') {
                const planImg = document.getElementById('castlePlan');
                if (planImg) planImg.src = item.details; 
                const planTitle = document.getElementById('plan-main-title');
                if (planTitle) planTitle.innerText = item.title;
            } else {
                const card = document.createElement('a');
                
                // ՍՏՈՒԳՈՒՄ ԵՆՔ ԲԱԶԱՅԻ ՀՂՈՒՄԸ. Եթե կա, տանում ենք դրսի հղումով, եթե ոչ՝ ներքին էջով
                if (item.source_url && item.source_url.trim() !== "") {
                    card.href = item.source_url;
                    card.target = '_blank';
                } else {
                    card.href = `timeline-detail.html?id=${item.id}`; 
                }

                card.className = 'timeline-card';
                card.style.display = 'block';
                card.style.textDecoration = 'none';
                card.style.transition = 'transform 0.2s';

                card.innerHTML = `
                    <h3>${item.period} ֊ ${item.title}</h3>
                    <p style="color: #cccccc; margin: 0;">${item.details}</p>
                    <span style="color: #ffb703; font-size: 12px; display: block; margin-top: 10px; text-align: right;">Կարդալ ավելին ➔</span>
                `;

                card.addEventListener('mouseenter', () => card.style.transform = 'translateX(5px)');
                card.addEventListener('mouseleave', () => card.style.transform = 'translateX(0px)');

                if (container) container.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Ժամանակագրության բեռնման սխալ:', error);
    }
}

async function loadCharactersAndMap() {
    try {
        const response = await fetch(`${BASE_URL}/characters`);
        const data = await response.json();
        
        const container = document.getElementById('characters-container');
        if (container) container.innerHTML = '';

        data.forEach(char => {
            let avatarContent = '';
            if (char.avatar_text && char.avatar_text.startsWith('http')) {
                avatarContent = `<img src="${char.avatar_text}" alt="${char.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                avatarContent = char.avatar_text || '';
            }

            const card = document.createElement('a');
            
            // ՍՏՈՒԳՈՒՄ ԵՆՔ ԲԱԶԱՅԻ ՀՂՈՒՄԸ ԿԵՐՊԱՐՆԵՐԻ ՀԱՄԱՐ
            if (char.source_url && char.source_url.trim() !== "") {
                card.href = char.source_url;
                card.target = '_blank';
            } else {
                card.href = `character-detail.html?id=${char.id}`; 
            }

            card.className = 'char-card';
            card.style.textDecoration = 'none';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justify = 'space-between';

            card.innerHTML = `
                <div>
                    <div class="char-header">
                        <div class="char-avatar">${avatarContent}</div>
                        <div>
                            <h3 style="color: #ffffff; margin: 0;">${char.name}</h3>
                            <p style="color: #ffb703; font-size: 14px; margin: 0;">${char.role}</p>
                        </div>
                    </div>
                    <p style="color: #b3b3b3; margin: 0;">${char.description}</p>
                    ${char.has_location ? `<p style="color: #ffb703; font-size: 12px; margin-top: 10px; margin-bottom: 0;">📍 Կապված վայրը՝ ${char.location_name}</p>` : ''}
                </div>
                <span style="color: #ffb703; font-size: 12px; text-align: right; display: block; margin-top: 15px;">Մանրամասն պատմություն ➔</span>
            `;
            if (container) container.appendChild(card);

            if (char.has_location && map) {
                L.marker([parseFloat(char.latitude), parseFloat(char.longitude)])
                    .addTo(map)
                    .bindPopup(`<b>${char.location_name}</b><br>${char.name}֊ի հիմնադրած ամրոցը:`)
                    .openPopup();
            }
        });
    } catch (error) {
        console.error('Կերպարների բեռնման սխալ:', error);
    }
}

function setupMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        map = L.map('map').setView([40.1406, 44.5381], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tablet = document.getElementById('tablet3d');
    
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 }; 

    const planContainer = document.querySelector('.plan-container');
    if (planContainer) {
        planContainer.addEventListener('mousemove', (e) => {
            const rect = planContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            planContainer.style.transform = `perspective(1000px) rotateY(${x / 15}deg) rotateX(${-y / 15}deg)`;
        });
        planContainer.addEventListener('mouseleave', () => {
            planContainer.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        });
    }

    if (tablet) {
        tablet.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        tablet.addEventListener('touchstart', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !tablet) return;
        const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
        rotation.y += deltaMove.x * 0.5; 
        rotation.x -= deltaMove.y * 0.5;
        rotation.x = Math.max(-60, Math.min(60, rotation.x));
        tablet.style.transform = `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || !tablet) return;
        const deltaMove = { x: e.touches[0].clientX - previousMousePosition.x, y: e.touches[0].clientY - previousMousePosition.y };
        rotation.y += deltaMove.x * 0.5;
        rotation.x -= deltaMove.y * 0.5;
        rotation.x = Math.max(-60, Math.min(60, rotation.x));
        tablet.style.transform = `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('touchend', () => { isDragging = false; });

    initHero();
    setupMap();
    loadTimeline(); 
    loadCharactersAndMap(); 
});