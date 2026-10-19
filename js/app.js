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

    // Audio broadcast snippet button
    const playAudioBtn = document.getElementById('btn-play-transmission');
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', () => {
        window.SpaceAudio.playQuindarTone();
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

    // Audio transmission text
    document.getElementById('drawer-audio-text').innerText = artifact.audioSnippet;

    drawer.classList.add('open');
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

    this.updateBodyTelemetry();
    this.renderArtifactsList();

    if (this.sceneManager.selectedArtifact) {
      this.openDrawer(this.sceneManager.selectedArtifact);
    }
  }
}

// Internationalization Strings
const TRANSLATIONS = {
  tr: {
    app_subtitle: "Ay ve Mars'taki Tarihi NASA Kalıntıları ve Hikaye Haritası",
    btn_tour: "HİKAYE TURU",
    btn_reset: "GÖRÜNÜMÜ SIFIRLA",
    btn_sound: "SES",
    telemetry_header: "GÖK CİSMİ TELEMETRİSİ",
    radius_label: "YARIÇAP",
    gravity_label: "YERÇEKİMİ",
    temp_label: "YÜZEY SICAKLIĞI",
    atmo_label: "ATMOSFER",
    mass_label: "TOPLAM TERK EDİLEN KÜTLE",
    search_placeholder: "Kalıntı veya görev ara...",
    relics_list_header: "TARİHİ EKİPMANLAR LİSTESİ",
    why_left_label: "NEDEN GERİDE BIRAKILDI?",
    condition_label: "BUGÜNKÜ DURUMU (YILLAR SONRA)",
    discarded_label: "TERK EDİLEN TEÇHİZAT LİSTESİ",
    specs_label: "TEKNİK TELEMETRİ BİLGİSİ",
    transmission_label: "TELSİZ VE TELEMETRİ KAYDI",
    play_audio_btn: "TELSİZ TONUNU ÇAL",
    btn_prev_site: "Önceki Kalıntı",
    btn_next_site: "Sonraki Kalıntı",
    hint_controls: "Fare ile 360° Gezin • Tekerlek ile Yakınlaş • Noktalara Tıkla",
    tour_active_title: "REHBERLİ HİKAYE TURU"
  },
  en: {
    app_subtitle: "Historical NASA Artifacts & Storytelling Map on the Moon and Mars",
    btn_tour: "STORY TOUR",
    btn_reset: "RESET VIEW",
    btn_sound: "AUDIO",
    telemetry_header: "CELESTIAL TELEMETRY",
    radius_label: "RADIUS",
    gravity_label: "GRAVITY",
    temp_label: "SURFACE TEMP",
    atmo_label: "ATMOSPHERE",
    mass_label: "TOTAL ABANDONED MASS",
    search_placeholder: "Search relics or missions...",
    relics_list_header: "HISTORICAL ARTIFACTS LIST",
    why_left_label: "WHY WAS IT LEFT BEHIND?",
    condition_label: "CURRENT CONDITION (DECADES LATER)",
    discarded_label: "DISCARDED EQUIPMENT CHECKLIST",
    specs_label: "TECHNICAL SPECS & TELEMETRY",
    transmission_label: "RADIO AUDIO & TELEMETRY",
    play_audio_btn: "PLAY QUINDAR BEEP",
    btn_prev_site: "Previous Site",
    btn_next_site: "Next Site",
    hint_controls: "Drag to Rotate 360° • Scroll to Zoom • Click Beacons to Inspect",
    tour_active_title: "GUIDED STORY TOUR"
  }
};

// Initialize App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AbandonedInSpaceApp();
});
