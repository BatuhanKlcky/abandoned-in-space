/**
 * Application Orchestrator & UI Controller
 * Manages State, Guided Story Tour (Planet & Full Solar System), Language Switcher (TR/EN),
 * Live Mars Weather & Rover Telemetry (MEDA / REMS), 1:1 WebXR Surface Walk, and HUD Telemetry
 */

class AbandonedInSpaceApp {
  constructor() {
    this.currentBody = 'moon';
    this.currentLang = 'tr';
    this.activeDecade = 'all';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.activeRover = 'perseverance';

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
    this.initLiveMarsTelemetry();
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
    // Planet Toggle Buttons (Moon, Mars, Venus, Outer System)
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
          this.startTour(false);
        }
      });
    }

    // Tour Banner Controls
    const tourNextBtn = document.getElementById('tour-next-btn');
    const tourPrevBtn = document.getElementById('tour-prev-btn');
    const tourAllBtn = document.getElementById('tour-all-btn');
    const tourExitBtn = document.getElementById('tour-exit-btn');
    if (tourNextBtn) tourNextBtn.addEventListener('click', () => this.nextTourStep());
    if (tourPrevBtn) tourPrevBtn.addEventListener('click', () => this.prevTourStep());
    if (tourAllBtn) tourAllBtn.addEventListener('click', () => this.startTour(true));
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

    // CAD X-Ray Wireframe Button in Holographic Viewer
    const xrayBtn = document.getElementById('btn-mini-wireframe');
    if (xrayBtn) {
      xrayBtn.addEventListener('click', () => {
        if (this.sceneManager) {
          const isWire = this.sceneManager.toggleMiniWireframe();
          xrayBtn.classList.toggle('active', isWire);
          window.SpaceAudio.playTelemetryPing(1350, 0.04);
        }
      });
    }

    // Audio broadcast snippet button
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
            if (eq) eq.classList.add('active');
            playAudioBtn.classList.add('transmitting');
            if (icon) icon.innerText = "🔊";
            if (btnText) btnText.innerText = this.currentLang === 'tr' ? 'YAYINLANIYOR...' : 'TRANSMITTING...';
          },
          () => {
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
        window.SpaceSimulation.cameraMode = 'cinematic';
        window.SpaceSimulation.startSimulation(art);
      }
    };
    if (topSimBtn) topSimBtn.addEventListener('click', triggerSimulation);
    if (drawerSimBtn) drawerSimBtn.addEventListener('click', triggerSimulation);

    // 1:1 Surface Walk & WebXR Controls
    const topWalkBtn = document.getElementById('btn-top-walk');
    const drawerWalkBtn = document.getElementById('btn-drawer-walk');
    const triggerSurfaceWalk = () => {
      const art = this.sceneManager.selectedArtifact || (this.getFilteredArtifacts()[0] || ARTIFACTS[0]);
      if (window.SpaceSimulation) {
        window.SpaceSimulation.startSurfaceWalk(art);
      }
    };
    if (topWalkBtn) topWalkBtn.addEventListener('click', triggerSurfaceWalk);
    if (drawerWalkBtn) drawerWalkBtn.addEventListener('click', triggerSurfaceWalk);

    // Live Mars Rover Tabs & Goto Button
    document.querySelectorAll('.rover-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.rover-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeRover = e.currentTarget.getAttribute('data-rover');
        this.updateLiveMarsCard();
        window.SpaceAudio.playTelemetryPing(1150, 0.04);
      });
    });

    const gotoRoverBtn = document.getElementById('btn-goto-rover');
    if (gotoRoverBtn) {
      gotoRoverBtn.addEventListener('click', () => {
        const targetId = this.activeRover === 'perseverance' ? 'perseverance-parachute' : 'curiosity-skycrane';
        const targetArt = ARTIFACTS.find(a => a.id === targetId);
        if (targetArt) {
          this.selectArtifact(targetArt);
          window.SpaceAudio.playTelemetryPing(1400, 0.06);
        }
      });
    }

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
    const cardLiveMars = document.getElementById('card-live-mars');
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
        if (cardLiveMars) cardLiveMars.style.display = 'none';
        if (cardRelics) cardRelics.style.display = 'flex';
        if (leftDock) leftDock.classList.add('mobile-visible');
        this.closeDrawer();
      });
    }

    if (mBtnTelemetry) {
      mBtnTelemetry.addEventListener('click', () => {
        setMobileTabActive(mBtnTelemetry);
        if (cardTelemetry) cardTelemetry.style.display = 'block';
        if (cardLiveMars) cardLiveMars.style.display = 'block';
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
        else this.startTour(false);
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
      } else if (e.key === 'ArrowRight' && this.isTourActive && (!window.SpaceSimulation || !window.SpaceSimulation.isPlaying)) {
        this.nextTourStep();
      } else if (e.key === 'ArrowLeft' && this.isTourActive && (!window.SpaceSimulation || !window.SpaceSimulation.isPlaying)) {
        this.prevTourStep();
      }
    });
  }

  // --- Live Mars Weather & Rover Telemetry (NASA MEDA / REMS + Live Sol Calculation) ---
  initLiveMarsTelemetry() {
    this.updateLiveMarsCard();
    // Attempt live NASA API check in background to enrich Sol / status if reachable
    fetch('https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && json.soles && json.soles.length > 0 && typeof LIVE_ROVER_TELEMETRY !== 'undefined') {
          const latest = json.soles[0];
          if (latest.max_temp && latest.min_temp) {
            LIVE_ROVER_TELEMETRY.curiosity.weather.maxTempC = parseInt(latest.max_temp, 10) || -14;
            LIVE_ROVER_TELEMETRY.curiosity.weather.minTempC = parseInt(latest.min_temp, 10) || -79;
          }
          if (latest.pressure) {
            LIVE_ROVER_TELEMETRY.curiosity.weather.pressurePa = parseFloat(latest.pressure) || 818.4;
          }
          if (latest.sol) {
            LIVE_ROVER_TELEMETRY.curiosity.sol = parseInt(latest.sol, 10) || LIVE_ROVER_TELEMETRY.curiosity.sol;
          }
          this.updateLiveMarsCard();
        }
      })
      .catch(() => {
        // Offline or CORS restricted: uses calibrated MEDA / REMS telemetry + astronomical Sol clock
      });
  }

  updateLiveMarsCard() {
    if (typeof LIVE_ROVER_TELEMETRY === 'undefined') return;
    const r = LIVE_ROVER_TELEMETRY[this.activeRover];
    if (!r) return;

    const isTr = this.currentLang === 'tr';

    // Compute exact real-time Martian Sol from landing epoch
    const landingEpochMs = this.activeRover === 'perseverance'
      ? Date.parse('2021-02-18T20:55:00Z')
      : Date.parse('2012-08-06T05:17:00Z');
    const marsSolMs = 88775.244 * 1000;
    const computedSol = Math.max(r.sol, Math.floor((Date.now() - landingEpochMs) / marsSolMs));

    const solEl = document.getElementById('live-rover-sol');
    const locEl = document.getElementById('live-rover-loc');
    const tempEl = document.getElementById('live-temp');
    const windEl = document.getElementById('live-wind');
    const pressEl = document.getElementById('live-pressure');
    const odoEl = document.getElementById('live-odometer');
    const badgeEl = document.getElementById('live-api-badge');

    if (solEl) solEl.innerText = `SOL ${computedSol}`;
    if (locEl) locEl.innerText = `${isTr ? r.location_tr : r.location_en} • ${r.lat.toFixed(2)}°, ${r.lon.toFixed(2)}°`;
    if (tempEl) tempEl.innerText = `${r.weather.maxTempC}°C / ${r.weather.minTempC}°C`;
    if (windEl) windEl.innerText = `${r.weather.windSpeedMs} m/s (${r.weather.windDir})`;
    if (pressEl) pressEl.innerText = `${r.weather.pressurePa} Pa`;
    if (odoEl) odoEl.innerText = `${r.odometerKm} km`;
    if (badgeEl) badgeEl.innerText = this.activeRover === 'perseverance' ? 'MEDA SENSÖRÜ' : 'REMS SENSÖRÜ';
  }

  switchPlanet(body) {
    if (this.currentBody === body) return;
    this.currentBody = body;

    document.querySelectorAll('.planet-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-body') === body);
    });

    this.sceneManager.switchBody(body);
    this.updateBodyTelemetry();
    this.closeDrawer();
    this.renderArtifactsList();
  }

  updateBodyTelemetry() {
    const data = CELESTIAL_DATA[this.currentBody];
    if (!data) return;
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
        ${this.currentLang === 'tr' ? 'Bu dönemde eşleşen tarihi kalıntı bulunamadı.' : 'No matching historical relics found in this decade.'}
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

    const xrayBtn = document.getElementById('btn-mini-wireframe');
    if (xrayBtn) xrayBtn.classList.remove('active');

    document.getElementById('drawer-mission').innerText = artifact.mission;
    document.getElementById('drawer-date').innerText = isTr ? artifact.date : artifact.date_en;
    document.getElementById('drawer-title').innerText = isTr ? artifact.name_tr : artifact.name_en;

    document.getElementById('drawer-quote').innerText = `"${isTr ? artifact.quote_tr : artifact.quote_en}"`;
    document.getElementById('drawer-quote-author').innerText = `— ${artifact.quoteAuthor}`;

    document.getElementById('drawer-headline').innerText = isTr ? artifact.headline_tr : artifact.headline_en;
    document.getElementById('drawer-story').innerText = isTr ? artifact.story_tr : artifact.story_en;

    document.getElementById('drawer-why-left').innerText = isTr ? artifact.whyAbandoned_tr : artifact.whyAbandoned_en;
    document.getElementById('drawer-condition').innerText = isTr ? artifact.currentCondition_tr : artifact.currentCondition_en;

    const listEl = document.getElementById('drawer-checklist');
    listEl.innerHTML = '';
    artifact.discardedItems.forEach(itemStr => {
      const li = document.createElement('li');
      li.innerText = itemStr;
      listEl.appendChild(li);
    });

    document.getElementById('spec-mass').innerText = artifact.technicalSpecs.massLeftKg;
    document.getElementById('spec-power').innerText = artifact.technicalSpecs.powerSource;
    document.getElementById('spec-duration').innerText = artifact.technicalSpecs.activeDuration;
    document.getElementById('spec-coords').innerText = artifact.technicalSpecs.coordinatesReadable;

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
              <img class="photo-thumb" src="${photo.url}" alt="${isTr ? photo.title_tr : photo.title_en}" loading="lazy" onerror="this.onerror=null; this.closest('.nasa-photo-card').style.display='none';">
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

    document.getElementById('drawer-audio-text').innerText = artifact.audioSnippet;

    drawer.classList.add('open');

    if (this.sceneManager) {
      setTimeout(() => this.sceneManager.resizeMiniViewer(), 60);
      setTimeout(() => this.sceneManager.resizeMiniViewer(), 480);
    }
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

  // --- Guided Story Tour (Single Body or Grand Solar System Tour) ---
  startTour(allBodies = false) {
    this.tourList = allBodies ? [...ARTIFACTS] : getArtifactsByBody(this.currentBody);
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

    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.innerHTML = `<span>🌐</span> <span>${isTr ? 'EN' : 'TR'}</span>`;
    }

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
    this.updateLiveMarsCard();
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
    app_subtitle: "Ay, Mars, Venüs ve Dış Gezegenlerdeki Tarihi Uzay Kalıntıları ve Hikaye Haritası",
    planet_moon: "AY (MOON)",
    planet_mars: "MARS",
    planet_venus: "VENÜS",
    planet_outer: "TİTAN & DIŞ SİSTEM",
    btn_sim: "SİMÜLASYON",
    btn_walk_top: "1:1 YÜZEY / VR",
    btn_sources: "RESMİ KAYNAKLAR",
    btn_tour: "HİKAYE TURU",
    btn_reset: "GÖRÜNÜMÜ SIFIRLA",
    btn_sound: "SES: AÇIK",
    sound_on: "SES: AÇIK",
    sound_off: "SES: KAPALI",
    telemetry_header: "GÖK CİSMİ TELEMETRİSİ",
    live_mars_header: "📡 CANLI MARS HAVA & TELEMETRİ",
    weather_temp: "HAVA SICAKLIĞI",
    weather_wind: "RÜZGAR HIZI",
    weather_pressure: "BASINÇ",
    weather_odometer: "KAT EDİLEN YOL",
    btn_goto_rover: "Haritada Rover Konumuna Uç",
    radius_label: "YARIÇAP",
    gravity_label: "YERÇEKİMİ",
    temp_label: "YÜZEY SICAKLIĞI",
    atmo_label: "ATMOSFER",
    mass_label: "TOPLAM TERK EDİLEN KÜTLE",
    search_placeholder: "Kalıntı veya görev ara...",
    relics_list_header: "TARİHİ EKİPMANLAR LİSTESİ",
    filter_decade: "DÖNEM:",
    decade_all: "TÜMÜ",
    sim_action_btn: "İNİŞ / ÇARPIŞMA SAHNESİNİ İZLE (3D)",
    sim_action_sub: "Gerçek fizik, itici alevleri ve sismik darbe canlandırması",
    walk_action_btn: "1:1 ÖLÇEKTE YANINDA YÜRÜ (WebXR)",
    walk_action_sub: "Aracın yanında 1.75m astronot göz hizasında yürü (VR / WASD)",
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
    sources_modal_title: "RESMİ NASA VERİ KAYNAKLARI & TARİH SERİSİ ARŞİVLERİ",
    sources_intro: "Bu projede yer alan tüm koordinatlar, iniş tarihleri, donanım envanterleri, NASA History Series (SP-2021-4705, SP-2022-4235, SP-2024-4559, SP-2026-4239) akademik referansları ve telsiz konuşmaları NASA'nın resmi bilimsel arşivlerinden doğrulanmıştır:",
    nasa_photos_label: "📷 GERÇEK NASA UYDU & YÜZEY FOTOĞRAFLARI",
    nasa_photos_subtext: "NASA LROC, HiRISE, Magellan, Cassini ve Rosetta arşivlerinden doğrulanmış kareler (Büyütmek için tıklayın):"
  },
  en: {
    app_subtitle: "Historical Space Artifacts & Storytelling Map Across the Moon, Mars, Venus & Outer System",
    planet_moon: "MOON",
    planet_mars: "MARS",
    planet_venus: "VENUS",
    planet_outer: "TITAN & OUTER SYSTEM",
    btn_sim: "SIMULATION",
    btn_walk_top: "1:1 WALK / VR",
    btn_sources: "OFFICIAL SOURCES",
    btn_tour: "STORY TOUR",
    btn_reset: "RESET VIEW",
    btn_sound: "AUDIO: ON",
    sound_on: "AUDIO: ON",
    sound_off: "AUDIO: OFF",
    telemetry_header: "CELESTIAL TELEMETRY",
    live_mars_header: "📡 LIVE MARS WEATHER & TELEMETRY",
    weather_temp: "AIR TEMP",
    weather_wind: "WIND SPEED",
    weather_pressure: "PRESSURE",
    weather_odometer: "ODOMETER",
    btn_goto_rover: "Fly to Active Rover on Map",
    radius_label: "RADIUS",
    gravity_label: "GRAVITY",
    temp_label: "SURFACE TEMP",
    atmo_label: "ATMOSPHERE",
    mass_label: "TOTAL ABANDONED MASS",
    search_placeholder: "Search relics or missions...",
    relics_list_header: "HISTORICAL ARTIFACTS LIST",
    filter_decade: "DECADE:",
    decade_all: "ALL",
    sim_action_btn: "WATCH LANDING / IMPACT (3D)",
    sim_action_sub: "Authentic physics, thruster plumes, and seismic impact reenactment",
    walk_action_btn: "WALK BESIDE AT 1:1 SCALE (WebXR)",
    walk_action_sub: "Walk at 1.75m astronaut eye-level beside the craft (VR / WASD)",
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
    sources_modal_title: "OFFICIAL NASA DATA SOURCES & HISTORY SERIES ARCHIVES",
    sources_intro: "All coordinates, mission dates, discarded hardware manifests, NASA History Series (SP-2021-4705, SP-2022-4235, SP-2024-4559, SP-2026-4239) citations, and radio transmissions are compiled from NASA's official public archives:",
    nasa_photos_label: "📷 AUTHENTIC NASA SATELLITE & SURFACE PHOTOS",
    nasa_photos_subtext: "Verified archive photography from NASA LROC, HiRISE, Magellan, Cassini & Rosetta (Click to enlarge):"
  }
};

// Initialize App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AbandonedInSpaceApp();
});
