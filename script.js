const toggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
if (toggle && navList) {
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        navList.classList.toggle('is-open');
    });
    navList.addEventListener('click', e => {
        if (e.target.matches('a')) {
            navList.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Carrossel simples
const track = document.querySelector('.carousel__track');
const slides = Array.from(document.querySelectorAll('.carousel__slide'));
const prevBtn = document.querySelector('.carousel__btn.prev');
const nextBtn = document.querySelector('.carousel__btn.next');
const dotsWrap = document.querySelector('.carousel__dots');
let current = 0;
let autoTimer;

function updateCarousel(index) {
    slides.forEach(s => s.classList.remove('is-active'));
    slides[index].classList.add('is-active');
    // translate viewport
    const offset = -index * 100;
    if (track) track.style.transform = `translateX(${offset}%)`;
    // Update buttons
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    // Update dots
    if (dotsWrap) {
        dotsWrap.querySelectorAll('button').forEach((b, i) => {
            b.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
    }
    current = index;
    restartAuto();
}

function go(dir) {
    const next = Math.min(Math.max(current + dir, 0), slides.length - 1);
    if (next !== current) updateCarousel(next);
}

function buildDots() {
    if (!dotsWrap) return;
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
        b.addEventListener('click', () => updateCarousel(i));
        dotsWrap.appendChild(b);
    });
}

function autoAdvance() {
    const next = current + 1 < slides.length ? current + 1 : 0;
    updateCarousel(next);
}

function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(autoAdvance, 6000);
}

if (slides.length && track) {
    buildDots();
    updateCarousel(0);
    prevBtn?.addEventListener('click', () => go(-1));
    nextBtn?.addEventListener('click', () => go(1));
    track.parentElement?.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.parentElement?.addEventListener('mouseleave', restartAuto);
}

// FAQ toggle
document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        const ans = btn.nextElementSibling;
        if(ans){ ans.hidden = expanded; }
    });
});

// Mini lead form
const leadMini = document.getElementById('leadMini');
if(leadMini){
    const email = leadMini.querySelector('input[name=email]');
    const msg = leadMini.querySelector('.mini-msg');
    leadMini.addEventListener('submit', e => {
        e.preventDefault();
        if(!email.value.trim()) { msg.textContent = 'Digite seu e-mail.'; return; }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value)){ msg.textContent = 'E-mail inválido.'; return; }
        msg.textContent = 'Enviando...';
        setTimeout(()=>{ msg.textContent = 'Enviado! Confira sua caixa.'; leadMini.reset(); }, 900);
    });
}

// Ano no footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// Newsletter footer
const newsForm = document.querySelector('.newsletter');
if(newsForm){
    const input = newsForm.querySelector('input[type=email]');
    newsForm.addEventListener('submit', e => {
        e.preventDefault();
        if(!input.value.trim()) { input.focus(); return; }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value)){ input.focus(); input.select(); return; }
        const btn = newsForm.querySelector('button');
        btn.disabled = true; btn.textContent = 'Enviando...';
        setTimeout(()=>{ btn.textContent='Inscrito!'; },900);
    });
}

// Catálogo: filtro por categoria (tabs)
const tabs = document.querySelectorAll('.catalog-tabs .tab');
const products = document.querySelectorAll('.product-card');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t=>t.classList.remove('is-active')); tab.classList.add('is-active');
        const filter = tab.dataset.filter;
        products.forEach(p => {
            if(filter==='all' || p.dataset.cat.includes(filter)) { p.style.display='flex'; }
            else { p.style.display='none'; }
        });
    });
});

// Dados mock de produtos
const PRODUTOS = {
    manualFitness: {
        titulo: 'Manual Fitness Completo',
        preco: '47',
        desc: 'O guia definitivo com um plano alimentar de 1500 kcal, uma rotina de treinos semanais e dicas essenciais de motivação e disciplina para você alcançar seus resultados.',
        itens: [
            'Parte 1: Plano Alimentar (1500 kcal)',
            'Parte 2: Plano de Treino Semanal',
            'Parte 3: Motivação e Disciplina',
            'Download imediato e acesso vitalício'
        ]
    }
};

// Modal detalhes (melhorado)
const modal = document.getElementById('modalDetalhe');
const modalTitle = modal?.querySelector('#modalTitulo');
const modalDesc = modal?.querySelector('.modal-desc');
const modalList = modal?.querySelector('.modal-list');
const modalPrice = modal?.querySelector('.price-lg');
const modalClose = modal?.querySelector('.modal__close');
let lastFocused;

function populateModal(data){
    modalTitle.textContent = data.titulo;
    modalDesc.textContent = data.desc;
    modalList.innerHTML = '';
    data.itens.forEach(it => { const li=document.createElement('li'); li.textContent=it; modalList.appendChild(li); });
    modalPrice.textContent = 'R$ '+data.preco;
}

function fallbackModal(){
    modalTitle.textContent = 'Produto não encontrado';
    modalDesc.textContent = 'Não foi possível carregar os detalhes. Tente novamente.';
    modalList.innerHTML = '';
    modalPrice.textContent = 'R$ --';
}

function openModal(id){
    if(!modal) return;
    lastFocused = document.activeElement;
    const data = PRODUTOS[id];
    if(data){ populateModal(data); } else { fallbackModal(); console.warn('ID de produto inválido:', id); }
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    // foco inicial
    requestAnimationFrame(()=>{
        (modalClose || modal.querySelector('.modal__close'))?.focus();
    });
}
function closeModal(){
    if(!modal) return;
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

// Trap de foco simples
document.addEventListener('keydown', e => {
    if(modal?.getAttribute('aria-hidden') === 'false' && e.key === 'Tab'){
        const focusables = modal.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if(!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length -1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
});
document.addEventListener('click', e => {
    const btn = e.target.closest('.js-detail');
    if(btn){ openModal(btn.dataset.id); }
    const closeBtn = e.target.closest('.modal__close');
    if(closeBtn || e.target.hasAttribute('data-dismiss')){ closeModal(); }
});
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

// Evita salto ao clicar em Comprar Agora dentro do modal
document.addEventListener('click', e => {
    const buyLink = e.target.closest('.modal [href="#"]');
    if(buyLink){ e.preventDefault(); }
});

// Compra de planos vitalícios (simulação)
document.addEventListener('click', e => {
    const btnPlan = e.target.closest('.js-buy-plan');
    if(btnPlan){
        const plan = btnPlan.dataset.plan;
        btnPlan.disabled = true; const original = btnPlan.textContent; btnPlan.textContent = 'Processando...';
        setTimeout(()=>{ btnPlan.textContent = 'Ativo ✅'; btnPlan.classList.add('is-active'); }, 900);
        console.log('Plano adquirido:', plan);
    }
});


