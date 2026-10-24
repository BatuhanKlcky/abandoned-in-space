/**
 * Application Orchestrator & UI Controller
 * Manages State, Guided Story Tour, Language Switcher (TR/EN), Filters, and HUD Telemetry
 */

class AbandonedInSpaceApp {
  constructor() {
    this.currentBody = 'moon';
    this.currentLang = 'tr';
    this.activeDecade = 'all';
    this.activeCategory = 'all';
    this.searchQuery = '';
    
    this.isTourActive = false;
    this.tourIndex = 0;
    this.tourList = [];

    this.sceneManager = null;
    this.init();
  }

  init() {
    // 1. Initialize 3D Engine
    this.sceneManager = new SpaceSceneManager('canvas-container');
    this.sceneManager.setArtifacts(ARTIFACTS);

    // 2. Set up global hover and select callbacks from 3D scene
    window.onArtifactHover = (artifact, x, y) => this.showTooltip(artifact, x, y);
    window.onArtifactLeave = () => this.hideTooltip();
    window.onArtifactSelect = (artifact) => this.selectArtifact(artifact);

    // 3. UI Bindings
    this.bindControls();

    // 4. Populate Initial State
    this.updateBodyTelemetry();
    this.renderArtifactsList();

    // 5. Audio startup on first user gesture
    const startAudioOnce = () => {
      window.SpaceAudio.startAmbient();
      window.removeEventListener('click', startAudioOnce);
      window.removeEventListener('keydown', startAudioOnce);
    };
    window.addEventListener('click', startAudioOnce);
    window.addEventListener('keydown', startAudioOnce);
  }

  bindControls() {
    // Planet Toggle Buttons
    document.querySelectorAll('.planet-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const body = e.currentTarget.getAttribute('data-body');
        this.switchPlanet(body);
      });
    });

    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.SpaceAudio.toggleSound();
        soundBtn.innerHTML = enabled 
          ? `<span>🔊</span> <span data-i18n="sound_on">${this.currentLang === 'tr' ? 'SES: AÇIK' : 'AUDIO: ON'}</span>`
          : `<span>🔇</span> <span data-i18n="sound_off">${this.currentLang === 'tr' ? 'SES: KAPALI' : 'AUDIO: OFF'}</span>`;
        window.SpaceAudio.playTelemetryPing(800, 0.05);
      });
    }

    // Language Toggle
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }

    // Guided Story Tour Button
    const tourBtn = document.getElementById('btn-tour-toggle');
    if (tourBtn) {
      tourBtn.addEventListener('click', () => {
        if (this.isTourActive) {
          this.endTour();
        } else {
          this.startTour();
        }
      });
    }

    // Tour Banner Controls
    const tourNextBtn = document.getElementById('tour-next-btn');
    const tourPrevBtn = document.getElementById('tour-prev-btn');
    const tourExitBtn = document.getElementById('tour-exit-btn');
    if (tourNextBtn) tourNextBtn.addEventListener('click', () => this.nextTourStep());
    if (tourPrevBtn) tourPrevBtn.addEventListener('click', () => this.prevTourStep());
    if (tourExitBtn) tourExitBtn.addEventListener('click', () => this.endTour());

    // Reset View Button
    const resetBtn = document.getElementById('btn-reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.sceneManager.resetView();
        this.closeDrawer();
        window.SpaceAudio.playTelemetryPing(900, 0.05);
      });
    }

    // Drawer Close Button
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Drawer Prev/Next Site Buttons
    const prevSiteBtn = document.getElementById('btn-prev-artifact');
    const nextSiteBtn = document.getElementById('btn-next-artifact');
    if (prevSiteBtn) {
      prevSiteBtn.addEventListener('click', () => this.navigateAdjacentArtifact(-1));
    }
    if (nextSiteBtn) {
      nextSiteBtn.addEventListener('click', () => this.navigateAdjacentArtifact(1));
    }

    // Audio broadcast snippet button (Spoken Radio Transmission with Quindar tones & static)
    const playAudioBtn = document.getElementById('btn-play-transmission');
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', () => {
        const artifact = this.sceneManager.selectedArtifact;
        if (!artifact) return;

        const speechText = artifact.audioSnippet || artifact.quote_en || "";
        const eq = document.getElementById('audio-equalizer');
        const icon = document.getElementById('audio-btn-icon');
        const btnText = document.getElementById('audio-btn-text');

        window.SpaceAudio.playRadioTransmission(
          speechText,
          () => {
            // onStart
            if (eq) eq.classList.add('active');
            playAudioBtn.classList.add('transmitting');
            if (icon) icon.innerText = "🔊";
            if (btnText) btnText.innerText = this.currentLang === 'tr' ? 'YAYINLANIYOR...' : 'TRANSMITTING...';
          },
          () => {
            // onEnd
            if (eq) eq.classList.remove('active');
            playAudioBtn.classList.remove('transmitting');
            if (icon) icon.innerText = "📻";
            if (btnText) btnText.innerText = this.currentLang === 'tr' ? 'TELSİZİ DİNLE' : 'LISTEN TO TRANSMISSION';
          }
        );
      });
    }

    // 3D Mission Simulation Theater Controls
    const topSimBtn = document.getElementById('btn-top-sim');
    const drawerSimBtn = document.getElementById('btn-drawer-sim');
    const triggerSimulation = () => {
      const art = this.sceneManager.selectedArtifact || (this.getFilteredArtifacts()[0] || ARTIFACTS[0]);
      if (window.SpaceSimulation) {
        window.SpaceSimulation.startSimulation(art);
      }
    };
    if (topSimBtn) topSimBtn.addEventListener('click', triggerSimulation);
    if (drawerSimBtn) drawerSimBtn.addEventListener('click', triggerSimulation);

    // Sources Modal Controls
    const sourcesBtn = document.getElementById('btn-sources-toggle');
    const mSourcesBtn = document.getElementById('m-btn-sources');
    const sourcesModal = document.getElementById('sources-modal');
    const closeSourcesBtn = document.getElementById('btn-close-sources');

    const openSources = () => {
      this.renderSourcesList();
      if (sourcesModal) sourcesModal.classList.add('open');
      window.SpaceAudio.playTelemetryPing(1000, 0.05);
    };

    if (sourcesBtn) sourcesBtn.addEventListener('click', openSources);
    if (mSourcesBtn) mSourcesBtn.addEventListener('click', openSources);
    if (closeSourcesBtn) closeSourcesBtn.addEventListener('click', () => {
      if (sourcesModal) sourcesModal.classList.remove('open');
    });
    if (sourcesModal) {
      sourcesModal.addEventListener('click', (e) => {
        if (e.target === sourcesModal) sourcesModal.classList.remove('open');
      });
    }

    // Photo Lightbox Modal Controls
    const photoModal = document.getElementById('photo-modal');
    const closePhotoBtn = document.getElementById('btn-close-photo');
    if (closePhotoBtn) {
      closePhotoBtn.addEventListener('click', () => {
        if (photoModal) photoModal.classList.remove('open');
      });
    }
    if (photoModal) {
      photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) photoModal.classList.remove('open');
      });
    }

    // Mobile Navigation Controls
    const mBtnMap = document.getElementById('m-btn-map');
    const mBtnRelics = document.getElementById('m-btn-relics');
    const mBtnTelemetry = document.getElementById('m-btn-telemetry');
    const mBtnTour = document.getElementById('m-btn-tour');
    const leftDock = document.getElementById('left-dock');
    const cardTelemetry = document.getElementById('card-telemetry');
    const cardRelics = document.getElementById('card-relics-list');
    const btnMobileCloseList = document.getElementById('btn-mobile-close-list');

    const setMobileTabActive = (activeBtn) => {
      document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
    };

    if (mBtnMap) {
      mBtnMap.addEventListener('click', () => {
        setMobileTabActive(mBtnMap);
        if (leftDock) leftDock.classList.remove('mobile-visible');
        this.closeDrawer();
      });
    }

    if (mBtnRelics) {
      mBtnRelics.addEventListener('click', () => {
        setMobileTabActive(mBtnRelics);
        if (cardTelemetry) cardTelemetry.style.display = 'none';
        if (cardRelics) cardRelics.style.display = 'flex';
        if (leftDock) leftDock.classList.add('mobile-visible');
        this.closeDrawer();
      });
    }

    if (mBtnTelemetry) {
      mBtnTelemetry.addEventListener('click', () => {
        setMobileTabActive(mBtnTelemetry);
        if (cardTelemetry) cardTelemetry.style.display = 'block';
        if (cardRelics) cardRelics.style.display = 'none';
        if (leftDock) leftDock.classList.add('mobile-visible');
        this.closeDrawer();
      });
    }

    if (mBtnTour) {
      mBtnTour.addEventListener('click', () => {
        setMobileTabActive(mBtnTour);
        if (leftDock) leftDock.classList.remove('mobile-visible');
        if (this.isTourActive) this.endTour();
        else this.startTour();
      });
    }

    if (btnMobileCloseList) {
      btnMobileCloseList.addEventListener('click', () => {
        if (leftDock) leftDock.classList.remove('mobile-visible');
        setMobileTabActive(mBtnMap);
      });
    }

    // Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderArtifactsList();
        this.filterScenePins();
      });
    }

    // Decade Filters
    document.querySelectorAll('.decade-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.decade-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeDecade = e.currentTarget.getAttribute('data-decade');
        this.renderArtifactsList();
        this.filterScenePins();
        window.SpaceAudio.playTelemetryPing(1200, 0.04);
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const photoModal = document.getElementById('photo-modal');
        if (photoModal && photoModal.classList.contains('open')) {
          photoModal.classList.remove('open');
          return;
        }
        if (window.SpaceSimulation && window.SpaceSimulation.isPlaying) {
          window.SpaceSimulation.stopSimulation();
          return;
        }
        if (this.isTourActive) this.endTour();
        this.closeDrawer();
        this.sceneManager.resetView();
      } else if (e.key === 'ArrowRight' && this.isTourActive) {
        this.nextTourStep();
      } else if (e.key === 'ArrowLeft' && this.isTourActive) {
        this.prevTourStep();
      }
    });
  }

  switchPlanet(body) {
    if (this.currentBody === body) return;
    this.currentBody = body;

    // Toggle button UI
    document.querySelectorAll('.planet-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-body') === body);
    });

    this.sceneManager.switchBody(body);
    this.updateBodyTelemetry();
    this.closeDrawer();
    this.renderArtifactsList();

    if (this.isTourActive) {
      this.endTour();
    }
  }

  updateBodyTelemetry() {
    const data = CELESTIAL_DATA[this.currentBody];
    const isTr = this.currentLang === 'tr';

    const titleEl = document.getElementById('body-name-text');
    const subtitleEl = document.getElementById('body-tagline-text');
    const radiusEl = document.getElementById('stat-radius');
    const gravityEl = document.getElementById('stat-gravity');
    const tempEl = document.getElementById('stat-temp');
    const atmoEl = document.getElementById('stat-atmosphere');
    const massEl = document.getElementById('stat-total-mass');

    if (titleEl) titleEl.innerText = isTr ? data.name_tr : data.name_en;
    if (subtitleEl) subtitleEl.innerText = isTr ? data.tagline_tr : data.tagline_en;
    if (radiusEl) radiusEl.innerText = `${data.radiusKm.toLocaleString()} km`;
    if (gravityEl) gravityEl.innerText = isTr ? data.gravity : data.gravity_en;
    if (tempEl) tempEl.innerText = isTr ? data.temp_tr : data.temp_en;
    if (atmoEl) atmoEl.innerText = isTr ? data.atmosphere_tr : data.atmosphere_en;
    if (massEl) massEl.innerText = isTr ? data.totalMassLeft_tr : data.totalMassLeft_en;
  }

  getFilteredArtifacts() {
    return ARTIFACTS.filter(a => {
      if (a.body !== this.currentBody) return false;
      if (this.activeDecade !== 'all' && a.decade !== this.activeDecade) return false;
      if (this.searchQuery) {
        const title = (a.name_tr + " " + a.name_en + " " + a.mission + " " + a.locationName).toLowerCase();
        if (!title.includes(this.searchQuery)) return false;
      }
      return true;
    });
  }

  filterScenePins() {
    const filtered = this.getFilteredArtifacts();
    this.sceneManager.updatePins(filtered.map(a => a.id));
  }

  renderArtifactsList() {
    const container = document.getElementById('artifacts-list-container');
    if (!container) return;

    const filtered = this.getFilteredArtifacts();
    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding:14px; color:var(--text-dim); font-size:12px; text-align:center;">
        ${this.currentLang === 'tr' ? 'Eşleşen tarihi kalıntı bulunamadı.' : 'No matching historical relics found.'}
      </div>`;
      return;
    }

    const isTr = this.currentLang === 'tr';

    filtered.forEach(art => {
      const item = document.createElement('div');
      item.className = 'artifact-list-item';
      if (this.sceneManager.selectedArtifact && this.sceneManager.selectedArtifact.id === art.id) {
        item.classList.add('selected');
      }

      item.innerHTML = `
        <div class="item-left">
          <span class="item-name">${isTr ? art.name_tr : art.name_en}</span>
          <span class="item-meta">${art.mission} • ${isTr ? art.date : art.date_en}</span>
        </div>
        <span class="item-badge">${isTr ? art.category_tr : art.category_en}</span>
      `;

      item.addEventListener('click', () => {
        this.selectArtifact(art);
      });

      container.appendChild(item);
    });
  }

  selectArtifact(artifact) {
    if (!artifact) return;

    // Switch body if artifact is on another celestial body
    if (artifact.body !== this.currentBody) {
      this.switchPlanet(artifact.body);
    }

    this.sceneManager.focusOnArtifact(artifact);
    this.openDrawer(artifact);
    this.renderArtifactsList();
  }

  openDrawer(artifact) {
    const isTr = this.currentLang === 'tr';
    const drawer = document.getElementById('story-drawer');
    if (!drawer) return;

    // Populate data
    document.getElementById('drawer-mission').innerText = artifact.mission;
    document.getElementById('drawer-date').innerText = isTr ? artifact.date : artifact.date_en;
    document.getElementById('drawer-title').innerText = isTr ? artifact.name_tr : artifact.name_en;

    document.getElementById('drawer-quote').innerText = `"${isTr ? artifact.quote_tr : artifact.quote_en}"`;
    document.getElementById('drawer-quote-author').innerText = `— ${artifact.quoteAuthor}`;

    document.getElementById('drawer-headline').innerText = isTr ? artifact.headline_tr : artifact.headline_en;
    document.getElementById('drawer-story').innerText = isTr ? artifact.story_tr : artifact.story_en;

    document.getElementById('drawer-why-left').innerText = isTr ? artifact.whyAbandoned_tr : artifact.whyAbandoned_en;
    document.getElementById('drawer-condition').innerText = isTr ? artifact.currentCondition_tr : artifact.currentCondition_en;

    // Discarded items list
    const listEl = document.getElementById('drawer-checklist');
    listEl.innerHTML = '';
    artifact.discardedItems.forEach(itemStr => {
      const li = document.createElement('li');
      li.innerText = itemStr;
      listEl.appendChild(li);
    });

    // Technical Specs
    document.getElementById('spec-mass').innerText = artifact.technicalSpecs.massLeftKg;
    document.getElementById('spec-power').innerText = artifact.technicalSpecs.powerSource;
    document.getElementById('spec-duration').innerText = artifact.technicalSpecs.activeDuration;
    document.getElementById('spec-coords').innerText = artifact.technicalSpecs.coordinatesReadable;

    // Secret Relic / Easter Egg Highlight Card
    const relicCard = document.getElementById('secret-relic-card');
    if (relicCard) {
      if (artifact.secretRelic) {
        document.getElementById('relic-badge').innerText = isTr ? artifact.secretRelic.badge_tr : artifact.secretRelic.badge_en;
        document.getElementById('relic-title').innerText = isTr ? artifact.secretRelic.title_tr : artifact.secretRelic.title_en;
        document.getElementById('relic-desc').innerText = isTr ? artifact.secretRelic.desc_tr : artifact.secretRelic.desc_en;
        relicCard.style.display = 'flex';
      } else {
        relicCard.style.display = 'none';
      }
    }

    // Authentic NASA Satellite & Surface Photography Gallery
    const photosSection = document.getElementById('drawer-photos-section');
    const photosGrid = document.getElementById('drawer-photos-grid');
    if (photosSection && photosGrid) {
      photosGrid.innerHTML = '';
      if (artifact.realPhotos && artifact.realPhotos.length > 0) {
        artifact.realPhotos.forEach(photo => {
          const card = document.createElement('div');
          card.className = 'nasa-photo-card';
          card.innerHTML = `
            <div class="photo-thumb-wrapper">
              <img class="photo-thumb" src="${photo.url}" alt="${isTr ? photo.title_tr : photo.title_en}" loading="lazy">
              <span class="photo-overlay-tag">${photo.catalogId}</span>
            </div>
            <div class="photo-card-info">
              <span class="photo-card-title">${isTr ? photo.title_tr : photo.title_en}</span>
              <span class="photo-card-meta">${photo.instrument}</span>
            </div>
          `;
          card.addEventListener('click', () => {
            this.openPhotoLightbox(photo);
          });
          photosGrid.appendChild(card);
        });
        photosSection.style.display = 'block';
      } else {
        photosSection.style.display = 'none';
      }
    }

    // Audio transmission text
    document.getElementById('drawer-audio-text').innerText = artifact.audioSnippet;

    drawer.classList.add('open');
  }

  openPhotoLightbox(photo) {
    const modal = document.getElementById('photo-modal');
    if (!modal) return;
    const isTr = this.currentLang === 'tr';

    const titleEl = document.getElementById('lightbox-title');
    const imgEl = document.getElementById('lightbox-img');
    const idEl = document.getElementById('lightbox-id');
    const instEl = document.getElementById('lightbox-instrument');
    const descEl = document.getElementById('lightbox-desc');
    const catEl = document.getElementById('lightbox-cat');

    if (catEl) catEl.innerText = isTr ? 'NASA ARŞİVİ' : 'NASA ARCHIVE';
    if (titleEl) titleEl.innerText = isTr ? photo.title_tr : photo.title_en;
    if (imgEl) {
      imgEl.src = photo.url;
      imgEl.alt = isTr ? photo.title_tr : photo.title_en;
    }
    if (idEl) idEl.innerText = photo.catalogId || 'NASA ARCHIVE';
    if (instEl) instEl.innerText = photo.instrument || 'Orbiter Camera';
    if (descEl) descEl.innerText = isTr ? photo.desc_tr : photo.desc_en;

    modal.classList.add('open');
    window.SpaceAudio.playTelemetryPing(1100, 0.04);
  }

  closeDrawer() {
    const drawer = document.getElementById('story-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  navigateAdjacentArtifact(delta) {
    const filtered = this.getFilteredArtifacts();
    if (filtered.length <= 1) return;

    const currentId = this.sceneManager.selectedArtifact ? this.sceneManager.selectedArtifact.id : '';
    let idx = filtered.findIndex(a => a.id === currentId);
    if (idx === -1) idx = 0;

    let nextIdx = (idx + delta + filtered.length) % filtered.length;
    this.selectArtifact(filtered[nextIdx]);
  }

  // --- Guided Story Tour ---
  startTour() {
    this.tourList = getArtifactsByBody(this.currentBody);
    if (this.tourList.length === 0) return;

    this.isTourActive = true;
    this.tourIndex = 0;

    const tourBtn = document.getElementById('btn-tour-toggle');
    if (tourBtn) tourBtn.classList.add('active-tour');

    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.add('active');

    this.updateTourStep();
  }

  updateTourStep() {
    const artifact = this.tourList[this.tourIndex];
    if (!artifact) return;

    const progressEl = document.getElementById('tour-progress-text');
    if (progressEl) {
      progressEl.innerText = `${this.tourIndex + 1} / ${this.tourList.length} — ${this.currentLang === 'tr' ? artifact.name_tr : artifact.name_en}`;
    }

    this.selectArtifact(artifact);
  }

  nextTourStep() {
    if (!this.isTourActive) return;
    this.tourIndex = (this.tourIndex + 1) % this.tourList.length;
    this.updateTourStep();
  }

  prevTourStep() {
    if (!this.isTourActive) return;
    this.tourIndex = (this.tourIndex - 1 + this.tourList.length) % this.tourList.length;
    this.updateTourStep();
  }

  endTour() {
    this.isTourActive = false;
    const tourBtn = document.getElementById('btn-tour-toggle');
    if (tourBtn) tourBtn.classList.remove('active-tour');

    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.remove('active');
  }

  // --- Floating Hover Tooltip ---
  showTooltip(artifact, clientX, clientY) {
    const tooltip = document.getElementById('beacon-tooltip');
    if (!tooltip) return;

    const isTr = this.currentLang === 'tr';
    document.getElementById('tooltip-title').innerText = isTr ? artifact.name_tr : artifact.name_en;
    document.getElementById('tooltip-meta').innerText = `${artifact.mission} • ${artifact.locationName}`;

    tooltip.style.left = `${clientX}px`;
    tooltip.style.top = `${clientY}px`;
    tooltip.classList.add('visible');
  }

  hideTooltip() {
    const tooltip = document.getElementById('beacon-tooltip');
    if (tooltip) tooltip.classList.remove('visible');
  }

  // --- Language Switcher (TR / EN) ---
  toggleLanguage() {
    this.currentLang = this.currentLang === 'tr' ? 'en' : 'tr';
    const isTr = this.currentLang === 'tr';

    // Update lang button text
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.innerHTML = `<span>🌐</span> <span>${isTr ? 'EN' : 'TR'}</span>`;
    }

    // Update all i18n data elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[this.currentLang] && TRANSLATIONS[this.currentLang][key]) {
        el.innerText = TRANSLATIONS[this.currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (TRANSLATIONS[this.currentLang] && TRANSLATIONS[this.currentLang][key]) {
        el.setAttribute('placeholder', TRANSLATIONS[this.currentLang][key]);
      }
    });

    this.updateBodyTelemetry();
    this.renderArtifactsList();

    if (this.sceneManager.selectedArtifact) {
      this.openDrawer(this.sceneManager.selectedArtifact);
    }
  }

  // --- Official Sources Modal Renderer ---
  renderSourcesList() {
    const container = document.getElementById('sources-list-container');
    if (!container || typeof OFFICIAL_SOURCES === 'undefined') return;

    container.innerHTML = '';
    const isTr = this.currentLang === 'tr';

    OFFICIAL_SOURCES.forEach(source => {
      const card = document.createElement('div');
      card.className = 'source-item-card';
      card.innerHTML = `
        <div class="source-header-row">
          <span class="source-title">${isTr ? source.name_tr : source.name_en}</span>
          <span class="source-curator">${source.curator}</span>
        </div>
        <p class="source-desc">${isTr ? source.desc_tr : source.desc_en}</p>
        <div class="source-link-row">
          <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="source-link">
            <span>${isTr ? 'Resmi Arşive Git ↗' : 'Visit Official Archive ↗'}</span>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

// Internationalization Strings
const TRANSLATIONS = {
  tr: {
    app_subtitle: "Ay ve Mars'taki Tarihi NASA Kalıntıları ve Hikaye Haritası",
    btn_sim: "SİMÜLASYON",
    btn_sources: "RESMİ KAYNAKLAR",
    btn_tour: "HİKAYE TURU",
    btn_reset: "GÖRÜNÜMÜ SIFIRLA",
    btn_sound: "SES: AÇIK",
    sound_on: "SES: AÇIK",
    sound_off: "SES: KAPALI",
    telemetry_header: "GÖK CİSMİ TELEMETRİSİ",
    radius_label: "YARIÇAP",
    gravity_label: "YERÇEKİMİ",
    temp_label: "YÜZEY SICAKLIĞI",
    atmo_label: "ATMOSFER",
    mass_label: "TOPLAM TERK EDİLEN KÜTLE",
    search_placeholder: "Kalıntı veya görev ara...",
    relics_list_header: "TARİHİ EKİPMANLAR LİSTESİ",
    sim_action_btn: "İNİŞ / ÇARPIŞMA SAHNESİNİ İZLE (3D)",
    why_left_label: "NEDEN GERİDE BIRAKILDI?",
    condition_label: "BUGÜNKÜ DURUMU (YILLAR SONRA)",
    discarded_label: "TERK EDİLEN TEÇHİZAT LİSTESİ",
    specs_label: "TEKNİK TELEMETRİ BİLGİSİ",
    transmission_label: "TELSİZ VE TELEMETRİ SESİ",
    play_audio_btn: "TELSİZİ DİNLE",
    btn_prev_site: "Önceki Kalıntı",
    btn_next_site: "Sonraki Kalıntı",
    hint_controls: "360° Gezin • Yakınlaş • Noktalara Tıkla",
    tour_active_title: "REHBERLİ HİKAYE TURU",
    sources_modal_title: "RESMİ NASA VERİ KAYNAKLARI & ARŞİVLERİ",
    sources_intro: "Bu projede yer alan tüm koordinatlar, yüzey fotoğrafları analizi, geride bırakılan donanım envanterleri ve telsiz konuşmaları NASA'nın kamuya açık resmi bilimsel arşivlerinden doğrulanmıştır:",
    nasa_photos_label: "📷 GERÇEK NASA UYDU & YÜZEY FOTOĞRAFLARI",
    nasa_photos_subtext: "NASA LROC ve Mars MRO uydularından doğrulanmış arşiv kareleri (Büyütmek için tıklayın):"
  },
  en: {
    app_subtitle: "Historical NASA Artifacts & Storytelling Map on the Moon and Mars",
    btn_sim: "SIMULATION",
    btn_sources: "OFFICIAL SOURCES",
    btn_tour: "STORY TOUR",
    btn_reset: "RESET VIEW",
    btn_sound: "AUDIO: ON",
    sound_on: "AUDIO: ON",
    sound_off: "AUDIO: OFF",
    telemetry_header: "CELESTIAL TELEMETRY",
    radius_label: "RADIUS",
    gravity_label: "GRAVITY",
    temp_label: "SURFACE TEMP",
    atmo_label: "ATMOSPHERE",
    mass_label: "TOTAL ABANDONED MASS",
    search_placeholder: "Search relics or missions...",
    relics_list_header: "HISTORICAL ARTIFACTS LIST",
    sim_action_btn: "WATCH LANDING / IMPACT (3D)",
    why_left_label: "WHY WAS IT LEFT BEHIND?",
    condition_label: "CURRENT CONDITION (DECADES LATER)",
    discarded_label: "DISCARDED EQUIPMENT CHECKLIST",
    specs_label: "TECHNICAL SPECS & TELEMETRY",
    transmission_label: "RADIO AUDIO & TELEMETRY",
    play_audio_btn: "LISTEN TO TRANSMISSION",
    btn_prev_site: "Previous Site",
    btn_next_site: "Next Site",
    hint_controls: "Rotate 360° • Zoom • Tap Beacons",
    tour_active_title: "GUIDED STORY TOUR",
    sources_modal_title: "OFFICIAL NASA DATA SOURCES & ARCHIVES",
    sources_intro: "All coordinates, mission dates, discarded hardware manifests, and air-to-ground radio transmissions are compiled from NASA's official public archives:",
    nasa_photos_label: "📷 AUTHENTIC NASA SATELLITE & SURFACE PHOTOS",
    nasa_photos_subtext: "Verified archive photography from NASA LROC & Mars MRO orbiters (Click to enlarge):"
  }
};

// Initialize App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AbandonedInSpaceApp();
});

