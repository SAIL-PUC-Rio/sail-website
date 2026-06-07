const state = {
  data: null,
  heroIndex: 0,
  heroTimer: null,
  specializationIndex: 0,
  specializationGalleryIndex: 0,
  specializationGalleryTimer: null,
  publicationFilter: '',
  bibbaseLoading: false
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const page = document.body.dataset.page || 'home';

async function init() {
  try {
    const response = await fetch('./data/data.json');
    const data = await response.json();
    state.data = data;

    bindGlobalContent(data);
    renderNavigation(data.navigation);
    renderFooter(data.footer, data.navigation);
    setupSearch(data);
    setupGlobalUi();

    if (page === 'home') initHomePage(data);
    if (page === 'team') initTeamPage(data);
    if (page === 'publications') initPublicationsPage(data);
    if (page === 'contributions') initContributionsPage(data);
    if (page === 'honors') initHonorsPage(data);

    // Handle cross-page scrolling if a target was stored
    handleCrossPageScroll();
  } catch (error) {
    console.error('Could not load site data:', error);
    document.body.innerHTML = '<main class="container" style="padding: 3rem 0;"><h1>Unable to load the website data.</h1><p>Please make sure <strong>data.json</strong> is inside the <strong>data</strong> folder and the site is running through a local server.</p></main>';
  }
}

function handleCrossPageScroll() {
  const scrollTarget = sessionStorage.getItem('scrollTarget');
  if (scrollTarget) {
    sessionStorage.removeItem('scrollTarget');
    // Use a small delay to ensure DOM is fully rendered
    setTimeout(() => {
      const target = $(scrollTarget);
      if (target) {
        const headerOffset = 180;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
}

function bindGlobalContent(data) {
  document.title = page === 'team'
    ? `${data.teamPage?.title || 'Our Team'} · ${data.site.title}`
    : page === 'publications'
      ? `${data.publicationsPage?.title || 'Publications'} · ${data.site.title}`
      : page === 'contributions'
        ? `${data.contributionsPage?.title || 'Contributions'} · ${data.site.title}`
        : page === 'honors'
          ? `${data.honorsAwardsPage?.title || 'Honors & Awards'} · ${data.site.title}`
          : data.site.title;

  document.documentElement.lang = data.site.language || 'en';
  $('[name="description"]')?.setAttribute('content', data.site.description || '');

  const topContact = $('[data-bind="topContactLabel"]');
  if (topContact) topContact.textContent = data.header.topContactLabel;
  const langChip = $('#languageChip');
  if (langChip) langChip.textContent = data.header.languageLabel;

  const institutionLink = $('#institutionLink');
  const institutionLogo = $('#institutionLogo');
  if (institutionLink && institutionLogo) {
    institutionLink.href = data.header.institution.url;
    institutionLogo.src = data.header.institution.logo;
    institutionLogo.alt = data.header.institution.name;
  }
}

function initHomePage(data) {
  $('[data-bind="aboutTitle"]').textContent = data.about.title;
  $('[data-bind="specializationTitle"]').textContent = data.specializationsTitle;
  $('[data-bind="servicesTitle"]').textContent = data.servicesTitle;
  $('[data-bind="coordinationTitle"]').textContent = data.coordinationTitle;
  $('[data-bind="honorsTitle"]').textContent = data.honorsAwardsPage?.title || 'Honors & Awards';
  $('[data-bind="publicationsTitle"]').textContent = data.publicationsTitle;
  $('[data-bind="contactEyebrow"]').textContent = data.contact.eyebrow;
  $('[data-bind="contactTitle"]').textContent = data.contact.title;

  $('#publicationsMoreLink').href = data.publicationsMoreUrl || 'publications.html';
  $('#publicationsMoreLink').classList.toggle('hidden', !data.publicationsMoreUrl);
  

  renderHero(data.heroSlides);
  renderAbout(data.about);
  renderSpecializations(data.specializations);
  renderServices(data.services);
  renderCoordination(data.coordination);
  renderHonorsSlider(data.honorsAwards);
  renderPublicationsPreview(data.publications);
  renderContact(data.contact);
}

function initTeamPage(data) {
  const pageData = data.teamPage || {};
  renderTeamGroups(pageData.groups || []);
}

function initPublicationsPage(data) {
  const pageData = data.publicationsPage || {};
  $('#publicationsPageTitle').textContent = pageData.title || 'Publications';
  $('#publicationsPageIntro').textContent = pageData.intro || '';
  
  // Auto-resize iframe based on content
  const iframe = $('#bibbaseMount');
  if (iframe) {
    const resizeIframe = () => {
      try {
        const height = iframe.contentDocument?.body?.scrollHeight || 1000;
        iframe.style.height = (height + 20) + 'px';
      } catch (e) {
        // If CORS prevents access, keep default min-height
      }
    };
    
    iframe.onload = resizeIframe;
    // Also try after a delay in case content loads dynamically
    setTimeout(resizeIframe, 1000);
    setTimeout(resizeIframe, 2000);
  }
}

function renderNavigation(items) {
  const nav = $('#mainNav');
  const template = $('#navLinkTemplate');
  if (!nav || !template) return;
  nav.innerHTML = '';

  const currentPage = page; // Get page from data-page attribute
  
  items.forEach(item => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.textContent = item.label;
    node.href = item.url;

    const normalized = normalizePageLink(item.url);
    
    // Check if this link matches current page (by file or by data-page attribute)
    const isCurrentPage = normalized === currentPageFile();
    const isCurrentPageByAttribute = (currentPage === 'honors' && item.url.includes('honors')) ||
                                     (currentPage === 'team' && item.url.includes('team')) ||
                                     (currentPage === 'contributions' && item.url.includes('contributions')) ||
                                     (currentPage === 'publications' && item.url.includes('publications'));
    
    if (isCurrentPage || isCurrentPageByAttribute) {
      node.classList.add('is-active');
    }

    if (isSamePageAnchor(item.url)) {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = item.url.includes('#') ? `#${item.url.split('#')[1]}` : item.url;
        const target = $(hash);
        if (target) {
          const headerOffset = 180;
          const elementPosition = target.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
          });
        }
      });
    } else if (item.url.includes('#') && item.url.startsWith('index.html#')) {
      // Handle cross-page anchor links (e.g., from publications.html to index.html#about)
      node.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = item.url.split('#')[1];
        sessionStorage.setItem('scrollTarget', `#${hash}`);
        window.location.href = 'index.html';
      });
    }

    nav.appendChild(node);
  });

  const sections = items
    .filter(item => isSamePageAnchor(item.url))
    .map(item => `#${item.url.split('#')[1] || item.url.replace('#', '')}`);

  if (!sections.length) return;

  // Track visibility ratio for each section
  const sectionVisibility = {};

  const observer = new IntersectionObserver(entries => {
    // Update visibility state for all entries
    entries.forEach(entry => {
      sectionVisibility[entry.target.id] = entry.intersectionRatio;
    });

    // Find the section with the highest visibility ratio
    let mostVisibleId = null;
    let maxRatio = 0;
    
    Object.entries(sectionVisibility).forEach(([id, ratio]) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        mostVisibleId = id;
      }
    });

    // Remove is-active from all navigation links
    $$('.main-nav__link.is-active').forEach(link => {
      link.classList.remove('is-active');
    });

    // Add is-active only to the most visible section (if at least 50% visible)
    if (mostVisibleId && maxRatio >= 0.5) {
      const file = currentPageFile();
      const selector = `.main-nav__link[href="${file}#${mostVisibleId}"]`;
      const link = $(selector) || $(`.main-nav__link[href="#${mostVisibleId}"]`);
      if (link) link.classList.add('is-active');
    }
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

  sections.forEach(selector => {
    const section = $(selector);
    if (section) observer.observe(section);
  });
}

function currentPageFile() {
  const path = window.location.pathname.split('/').pop();
  return path || 'index.html';
}

function normalizePageLink(url) {
  const clean = url.split('#')[0];
  return clean || 'index.html';
}

function isSamePageAnchor(url) {
  if (!url.includes('#')) return false;
  const pagePart = url.split('#')[0];
  return !pagePart || pagePart === currentPageFile();
}

function navigateHero(direction, slides) {
  const totalSlides = slides.length;
  let nextIndex;
  
  if (direction === 'prev') {
    nextIndex = (state.heroIndex - 1 + totalSlides) % totalSlides;
  } else if (direction === 'next') {
    nextIndex = (state.heroIndex + 1) % totalSlides;
  } else {
    nextIndex = direction;
  }
  
  clearInterval(state.heroTimer);
  showHero(nextIndex);
  state.heroTimer = setInterval(() => showHero((state.heroIndex + 1) % totalSlides), 5000);
}

function renderHero(slides) {
  const slidesEl = $('#heroSlides');
  const dotsEl = $('#heroDots');
  const sliderEl = $('#heroSlider');
  if (!slidesEl || !dotsEl || !sliderEl) return;
  slidesEl.innerHTML = '';
  dotsEl.innerHTML = '';

  slides.forEach((slide, index) => {
    const article = document.createElement('article');
    article.className = 'hero-slide';
    article.innerHTML = `
      <img class="hero-slide__image" src="${slide.image}" alt="${slide.title}">
      <div class="hero-slide__overlay"></div>
      <div class="hero-slide__content">
        <h1 class="hero-slide__title">${slide.title}</h1>
        <p class="hero-slide__text">${slide.text}</p>
      </div>
    `;
    slidesEl.appendChild(article);

    const dot = document.createElement('button');
    dot.className = 'hero-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => navigateHero(index, slides));
    dotsEl.appendChild(dot);
  });

  // Create and append arrow buttons
  const prevArrow = document.createElement('button');
  prevArrow.className = 'hero-arrow hero-arrow--prev';
  prevArrow.type = 'button';
  prevArrow.setAttribute('aria-label', 'Previous slide');
  prevArrow.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
  prevArrow.addEventListener('click', () => navigateHero('prev', slides));

  const nextArrow = document.createElement('button');
  nextArrow.className = 'hero-arrow hero-arrow--next';
  nextArrow.type = 'button';
  nextArrow.setAttribute('aria-label', 'Next slide');
  nextArrow.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
  nextArrow.addEventListener('click', () => navigateHero('next', slides));

  sliderEl.appendChild(prevArrow);
  sliderEl.appendChild(nextArrow);

  showHero(0);
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => showHero((state.heroIndex + 1) % slides.length), 5000);
}

function showHero(index) {
  const dots = $$('.hero-dot', $('#heroDots'));
  state.heroIndex = index;
  $('#heroSlides').style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
}

function renderAbout(about) {
  $('#aboutColumnOne').innerHTML = about.columns[0] || '';
  $('#aboutColumnTwo').innerHTML = about.columns[1] || '';
}

function renderCoordination(coordination) {
  const imageContent = `
    <div class="coordination-image">
      <img src="${coordination.coordinator.photo}" alt="${coordination.coordinator.name}">
    </div>
  `;
  $('#coordinationImage').innerHTML = imageContent;
  
  const descriptionContent = `
    ${coordination.description || ''}
  `;
  $('#coordinationDescription').innerHTML = descriptionContent;
}

function renderSpecializations(items) {
  const tabsEl = $('#specializationTabs');
  tabsEl.innerHTML = '';

  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'specialization-tab';
    button.type = 'button';
    button.role = 'tab';
    button.innerHTML = `<strong>${item.title}</strong><span aria-hidden="true">↗</span>`;
    button.addEventListener('click', () => showSpecialization(index));
    tabsEl.appendChild(button);
  });

  showSpecialization(0);
}

function showSpecialization(index) {
  const item = state.data.specializations[index];
  state.specializationIndex = index;
  state.specializationGalleryIndex = 0;

  $$('.specialization-tab').forEach((tab, tabIndex) => {
    tab.classList.toggle('is-active', tabIndex === index);
    tab.setAttribute('aria-selected', String(tabIndex === index));
  });

  $('#specializationPanel').innerHTML = `
    <div>
      <h3 class="specialization-panel__title">${item.title}</h3>
      <div class="specialization-panel__text rich-copy">${item.description}</div>
    </div>
    <div>
      <div class="specialization-panel__gallery" id="specializationGallery"></div>
      <div class="specialization-gallery-dots" id="specializationGalleryDots"></div>
    </div>
  `;

  const gallery = $('#specializationGallery');
  const dots = $('#specializationGalleryDots');
  item.images.forEach((image, imageIndex) => {
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt || item.title;
    img.classList.toggle('is-visible', imageIndex === 0);
    gallery.appendChild(img);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'specialization-gallery-dot';
    dot.classList.toggle('is-active', imageIndex === 0);
    dot.setAttribute('aria-label', `View ${item.title} image ${imageIndex + 1}`);
    dot.addEventListener('click', () => showSpecializationGallery(imageIndex));
    dots.appendChild(dot);
  });

  clearInterval(state.specializationGalleryTimer);
  if (item.images.length > 1) {
    state.specializationGalleryTimer = setInterval(() => {
      const next = (state.specializationGalleryIndex + 1) % item.images.length;
      showSpecializationGallery(next);
    }, 4200);
  }
}

function showSpecializationGallery(index) {
  state.specializationGalleryIndex = index;
  $$('#specializationGallery img').forEach((img, imgIndex) => img.classList.toggle('is-visible', imgIndex === index));
  $$('#specializationGalleryDots .specialization-gallery-dot').forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
}

function renderServices(items) {
  const grid = $('#servicesGrid');
  const template = $('#serviceCardTemplate');
  grid.innerHTML = '';

  items.forEach(item => {
    const node = template.content.firstElementChild.cloneNode(true);
    const wrapper = item.url ? document.createElement('a') : document.createElement('div');
    if (item.url) {
      wrapper.href = item.url;
      wrapper.target = '_blank';
      wrapper.rel = 'noopener noreferrer';
    }
    node.querySelector('.service-card__image').src = item.image;
    node.querySelector('.service-card__image').alt = item.title;
    node.querySelector('.service-card__title').textContent = item.title;
    node.querySelector('.service-card__text').textContent = item.description;
    wrapper.appendChild(node);
    grid.appendChild(wrapper);
  });
}

function renderPublicationsPreview(items) {
  renderContentSlider(items, '#publicationsSlider', '#publicationCardTemplate', publication => ({
    title: publication.title,
    meta: publication.authors ? `${publication.authors} · ${publication.year || ''}` : (publication.year || ''),
    venue: publication.venue || '',
    url: publication.url,
  }));
}

function renderContentSlider(items, sliderSelector, templateSelector, mapper) {
  const slider = $(sliderSelector);
  const template = $(templateSelector);
  slider.innerHTML = '';

  items.forEach(item => {
    const mapped = mapper(item);
    const node = template.content.firstElementChild.cloneNode(true);
    node.href = mapped.url || '#';
    node.querySelector('.content-card__title').textContent = mapped.title;
    node.querySelector('.content-card__meta').textContent = mapped.meta || '';
    const venueEl = node.querySelector('.content-card__venue');
    if (venueEl) venueEl.textContent = mapped.venue || '';
    slider.appendChild(node);
  });
}

function renderContact(contact) {
  $('#contactPrimaryLink').href = contact.primaryAction.url || '#';
  $('#contactPrimaryLabel').textContent = contact.primaryAction.label;

  const details = $('#contactDetails');
  details.innerHTML = '';

  contact.blocks.forEach(block => {
    const article = document.createElement('article');
    article.className = 'contact-block';
    article.innerHTML = `<h3>${block.title}</h3>`;

    if (block.type === 'links') {
      const linksWrap = document.createElement('div');
      linksWrap.className = 'contact-links';
      block.items.forEach(item => {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'contact-link';

        const icon = document.createElement('img');
        icon.src = item.logo;
        icon.alt = item.label;
        icon.className = 'contact-link-icon';
        link.appendChild(icon);
        link.appendChild(document.createTextNode(item.label));
        linksWrap.appendChild(link);
      });
      article.appendChild(linksWrap);
    } else {
      block.lines.forEach(line => {
        const p = document.createElement('p');
        if (line.url) {
          const a = document.createElement('a');
          a.href = line.url;
          a.textContent = line.text;
          if (line.url.startsWith('http')) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
          p.appendChild(a);
        } else {
          p.textContent = line.text;
        }
        article.appendChild(p);
      });
    }
    details.appendChild(article);
  });
}

function renderTeamGroups(groups) {
  const mount = $('#teamGroups');
  mount.innerHTML = '';

  groups.forEach(group => {
    const section = document.createElement('section');
    section.className = 'team-group';
    section.innerHTML = `
      <div class="section-heading-row team-group__header">
        <div>
          <h2 class="section-title">${group.title}</h2>
          <p class="team-group__description">${group.description || ''}</p>
        </div>
      </div>
    `;

    // Special rendering for Former Students as a bullet list
    if (group.title === 'Former Students') {
      const list = document.createElement('ul');
      list.className = 'former-students-list';

      group.members.forEach(member => {
        const item = document.createElement('li');
        item.className = 'former-student-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'former-student-name';
        nameSpan.textContent = member.name;
        item.appendChild(nameSpan);

        const linksDiv = document.createElement('div');
        linksDiv.className = 'former-student-links';
        
        (member.links || []).forEach(link => {
          const a = document.createElement('a');
          a.href = link.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'former-student-link';
          a.textContent = link.label;
          linksDiv.appendChild(a);
        });
        
        item.appendChild(linksDiv);
        list.appendChild(item);
      });

      section.appendChild(list);
    } else {
      // Original card grid rendering for other groups
      const grid = document.createElement('div');
      grid.className = 'team-grid';

      group.members.forEach(member => {
        const article = document.createElement('article');
        article.className = 'team-card card card--soft';
        article.innerHTML = `
          <div class="team-card__media">
            <img src="${member.photo || './images/Team.jpeg'}" alt="${member.name}">
          </div>
          <div class="team-card__body">
            <h3 class="team-card__name">${member.name}</h3>
            <p class="team-card__role">${member.role || ''}</p>
            <p class="team-card__bio">${member.bio || ''}</p>
            <div class="team-card__meta"></div>
            <div class="team-card__links"></div>
          </div>
        `;

        const links = $('.team-card__links', article);
        (member.links || []).forEach(item => {
          const link = document.createElement('a');
          link.href = item.url;
          link.target = item.url.startsWith('http') ? '_blank' : '_self';
          link.rel = item.url.startsWith('http') ? 'noopener noreferrer' : '';
          link.className = 'team-card__link';
          link.textContent = item.label;
          links.appendChild(link);
        });

        grid.appendChild(article);
      });

      section.appendChild(grid);
    }

    mount.appendChild(section);
  });
}

function renderPublicationsPageList(items) {
  const mount = $('#publicationsList');
  const grouped = groupPublicationsByYear(items, state.publicationFilter);
  mount.innerHTML = '';

  if (!grouped.length) {
    mount.innerHTML = '<div class="card card--soft empty-state">No publications matched your search.</div>';
    return;
  }

  grouped.forEach(group => {
    const section = document.createElement('section');
    section.className = 'publication-year';
    section.innerHTML = `<h2 class="publication-year__title">${group.year}</h2>`;
    const list = document.createElement('div');
    list.className = 'publication-list';

    group.items.forEach(item => {
      const article = document.createElement('article');
      article.className = 'publication-item card card--soft';
      article.innerHTML = `
        <h3 class="publication-item__title">${item.title}</h3>
        <p class="publication-item__authors">${item.authors || ''}</p>
        <p class="publication-item__venue">${item.venue || ''}</p>
        <div class="publication-item__actions"></div>
      `;
      const actions = $('.publication-item__actions', article);
      if (item.url) {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'ghost-button';
        link.textContent = 'Open publication';
        actions.appendChild(link);
      }
      list.appendChild(article);
    });

    section.appendChild(list);
    mount.appendChild(section);
  });
}

function groupPublicationsByYear(items, filterTerm = '') {
  const filtered = items.filter(item => {
    const text = `${item.title} ${item.authors || ''} ${item.venue || ''} ${item.year || ''}`.toLowerCase();
    return !filterTerm || text.includes(filterTerm);
  });

  const map = new Map();
  filtered
    .sort((a, b) => String(b.year).localeCompare(String(a.year)) || a.title.localeCompare(b.title))
    .forEach(item => {
      const year = item.year || 'Other';
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(item);
    });

  return [...map.entries()].map(([year, groupItems]) => ({ year, items: groupItems }));
}


function renderFooter(footer, navigation) {
  $('#footerLogo').src = footer.logo;
  $('#footerLogo').alt = footer.logoAlt || 'Footer logo';
  $('#footerDescription').textContent = footer.description;
  $('#footerCopyright').textContent = footer.copyright;

  const links = $('#footerLinks');
  links.innerHTML = '';
  navigation.forEach(item => {
    const link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.label;
    links.appendChild(link);
  });

  const partners = $('#partnerLogos');
  partners.innerHTML = '';
  footer.partners.forEach(partner => {
    const img = document.createElement('img');
    img.src = partner.logo;
    img.alt = partner.name;
    partners.appendChild(img);
  });
}

function setupSearch(data) {
  const input = $('#siteSearch');
  const results = $('#searchResults');
  if (!input || !results) return;
  const index = buildSearchIndex(data);

  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    results.innerHTML = '';
    if (!term) return;

    const matches = index.filter(item => item.searchable.includes(term)).slice(0, 8);
    if (!matches.length) {
      results.innerHTML = '<div class="search-result">No matching content found.</div>';
      return;
    }

    matches.forEach(match => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = match.url;
      link.innerHTML = `<strong>${match.title}</strong><div>${match.preview}</div>`;
      results.appendChild(link);
    });
  });
}

function buildSearchIndex(data) {
  const items = [];
  data.navigation.forEach(item => items.push({ title: item.label, preview: item.url, url: item.url, searchable: `${item.label} ${item.url}`.toLowerCase() }));
  (data.services || []).forEach(item => items.push({ title: item.title, preview: item.description, url: 'index.html#services', searchable: `${item.title} ${item.description}`.toLowerCase() }));
  (data.specializations || []).forEach(item => items.push({ title: item.title, preview: stripHtml(item.description).slice(0, 120), url: 'index.html#specializations', searchable: `${item.title} ${stripHtml(item.description)}`.toLowerCase() }));
  (data.publications || []).forEach(item => items.push({ title: item.title, preview: item.authors || '', url: item.url || 'publications.html', searchable: `${item.title} ${item.authors || ''} ${item.venue || ''}`.toLowerCase() }));
  (data.teamPage?.groups || []).forEach(group => {
    (group.members || []).forEach(member => items.push({
      title: member.name,
      preview: `${member.role || ''} · ${group.title}`,
      url: 'team.html',
      searchable: `${member.name} ${member.role || ''} ${member.bio || ''} ${group.title}`.toLowerCase()
    }));
  });
  (data.honorsAwards || []).forEach(item => items.push({ title: item.title, preview: item.description, url: 'honors-awards.html', searchable: `${item.title} ${item.description}`.toLowerCase() }));
  (data.contributionsPage?.groups || []).forEach(group => {
    (group.contributions || []).forEach(contribution => items.push({
      title: contribution.title,
      preview: contribution.description,
      url: 'contributions.html',
      searchable: `${contribution.title} ${contribution.description} ${group.title}`.toLowerCase()
    }));
  });
  return items;
}

function setupGlobalUi() {
  $('#searchToggle')?.addEventListener('click', () => {
    const box = $('#searchBox');
    const expanded = $('#searchToggle').getAttribute('aria-expanded') === 'true';
    $('#searchToggle').setAttribute('aria-expanded', String(!expanded));
    box.hidden = expanded;
    if (!expanded) $('#siteSearch')?.focus();
  });

  $('#menuToggle')?.addEventListener('click', () => {
    const nav = $('#mainNav');
    const expanded = $('#menuToggle').getAttribute('aria-expanded') === 'true';
    $('#menuToggle').setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open');
  });

  $$('[data-slider]').forEach(button => {
    button.addEventListener('click', () => {
      let slider;
      if (button.dataset.slider === 'publications') {
        slider = $('#publicationsSlider');
      } else if (button.dataset.slider === 'honors') {
        slider = $('#honorsSlider');
      }
      if (!slider) return;
      const direction = button.dataset.direction === 'next' ? 1 : -1;
      const amount = slider.clientWidth * 0.85 * direction;
      const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10;
      const isAtStart = slider.scrollLeft <= 10;

      if (direction === 1 && isAtEnd) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (direction === -1 && isAtStart) {
        slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: amount, behavior: 'smooth' });
      }
    });
  });
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function initContributionsPage(data) {
  const pageData = data.contributionsPage || {};
  renderContributionGroups(pageData.groups || []);
}

function initHonorsPage(data) {
  const pageData = data.honorsAwardsPage || {};
  $('#honorsPageTitle').textContent = pageData.title || 'Honors & Awards';
  $('#honorsPageIntro').textContent = pageData.intro || '';
  renderHonorsPage(data.honorsAwards || []);
}

function renderContributionGroups(groups) {
  const mount = $('#contributionGroups');
  mount.innerHTML = '';

  groups.forEach(group => {
    const section = document.createElement('section');
    section.className = 'contribution-group';
    section.innerHTML = `
      <div class="section-heading-row contribution-group__header">
        <div>
          <h2 class="section-title">${group.title}</h2>
          <p class="contribution-group__description">${group.description || ''}</p>
        </div>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'contribution-grid';

    group.contributions.forEach(contribution => {
      const article = document.createElement('article');
      article.className = 'contribution-card card card--soft';
      article.innerHTML = `
        <div class="contribution-card__media">
          <img src="${contribution.image || './images/Team.jpeg'}" alt="${contribution.title}">
        </div>
        <div class="contribution-card__body">
          <h3 class="contribution-card__title">${contribution.title}</h3>
          <p class="contribution-card__description">${contribution.description || ''}</p>
          <div class="contribution-card__tags"></div>
        </div>
      `;

      const tags = $('.contribution-card__tags', article);
      (contribution.tags || []).forEach(tag => {
        const link = document.createElement('a');
        link.href = tag.url;
        link.target = tag.url.startsWith('http') ? '_blank' : '_self';
        link.rel = tag.url.startsWith('http') ? 'noopener noreferrer' : '';
        link.className = 'contribution-card__tag';
        link.textContent = tag.label;
        tags.appendChild(link);
      });

      grid.appendChild(article);
    });

    section.appendChild(grid);
    mount.appendChild(section);
  });
}

function renderHonorsSlider(items) {
  const slider = $('#honorsSlider');
  if (!slider) return;
  slider.innerHTML = '';

  // Sort by year descending (most recent first) and take top 6
  const recent = items
    .sort((a, b) => b.year - a.year)
    .slice(0, 6);

  recent.forEach(item => {
    const card = document.createElement('div');
    card.className = 'honors-slider-card honors-card card card--soft';
    card.innerHTML = `
      <div class="honors-card__media">
        <img src="${item.image || './images/Team.jpeg'}" alt="${item.title}">
      </div>
      <div class="honors-card__body">
        <h3 class="honors-card__title">${item.title}</h3>
        <p class="honors-card__year">${item.year}</p>
        <p class="honors-card__description">${item.description || ''}</p>
        <div class="honors-card__links"></div>
      </div>
    `;

    const links = card.querySelector('.honors-card__links');
    (item.links || []).forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = link.url.startsWith('http') ? '_blank' : '_self';
      a.rel = link.url.startsWith('http') ? 'noopener noreferrer' : '';
      a.className = 'honors-card__link';
      a.textContent = link.label;
      a.addEventListener('click', (e) => e.stopPropagation());
      links.appendChild(a);
    });

    slider.appendChild(card);
  });
}

function renderHonorsPreview(items, count = 3) {
  const grid = $('#honorsPreview');
  if (!grid) return;
  grid.innerHTML = '';

  const preview = items.slice(0, count);
  preview.forEach(item => {
    const article = document.createElement('article');
    article.className = 'honors-card card card--soft';
    article.innerHTML = `
      <div class="honors-card__media">
        <img src="${item.image || './images/Team.jpeg'}" alt="${item.title}">
      </div>
      <div class="honors-card__body">
        <h3 class="honors-card__title">${item.title}</h3>
        <p class="honors-card__year">${item.year}</p>
        <p class="honors-card__description">${item.description || ''}</p>
        <div class="honors-card__links"></div>
      </div>
    `;

    const links = $('.honors-card__links', article);
    (item.links || []).forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = link.url.startsWith('http') ? '_blank' : '_self';
      a.rel = link.url.startsWith('http') ? 'noopener noreferrer' : '';
      a.className = 'honors-card__link';
      a.textContent = link.label;
      links.appendChild(a);
    });

    grid.appendChild(article);
  });
}

function renderHonorsPage(items) {
  const mount = $('#honorsContainer');
  if (!mount) return;
  mount.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'honors-grid';

  items.forEach(item => {
    const article = document.createElement('article');
    article.className = 'honors-card card card--soft';
    article.innerHTML = `
      <div class="honors-card__media">
        <img src="${item.image || './images/Team.jpeg'}" alt="${item.title}">
      </div>
      <div class="honors-card__body">
        <h3 class="honors-card__title">${item.title}</h3>
        <p class="honors-card__year">${item.year}</p>
        <p class="honors-card__description">${item.description || ''}</p>
        <div class="honors-card__links"></div>
      </div>
    `;

    const links = $('.honors-card__links', article);
    (item.links || []).forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = link.url.startsWith('http') ? '_blank' : '_self';
      a.rel = link.url.startsWith('http') ? 'noopener noreferrer' : '';
      a.className = 'honors-card__link';
      a.textContent = link.label;
      links.appendChild(a);
    });

    grid.appendChild(article);
  });

  mount.appendChild(grid);
}

init();
