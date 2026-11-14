/**
 * Application Orchestrator & UI Controller (v4.1 — NASA 5 Judging Criteria & Sequential Storytelling Edition)
 * Manages State, 5-Chapter Guided Story Tour, Language Switcher (TR/EN),
 * Live Mars Weather & Rover Telemetry (MEDA / REMS), 1:1 WebXR Surface Walk, and Jury Pitch Mode
 */

const STORY_CHAPTERS = [
  {
    id: 0,
    pill_tr: "I. İlk Dokunuş",
    pill_en: "I. First Contact",
    title_tr: "BÖLÜM I: İNSANLIĞIN BAŞKA BİR DÜNYAYA İLK DOKUNUŞU (1967–1970)",
    title_en: "ACT I: HUMANITY'S FIRST TOUCH ON ANOTHER WORLD (1967–1970)",
    desc_tr: "Hikâyemiz Soğuk Savaş'ın zirvesinde başlıyor: Surveyor 3 ve Apollo 11 ile Ay'a ilk kez dokunduk; Apollo 12 ile Surveyor 3'ün yanına inip Dünya dışı ilk arkeolojik incelemeyi yaptık. Bu makineler çöplük değil, insanlığın evrendeki ilk ayak izleridir.",
    desc_en: "Our story begins at the height of the Space Race: touching the Moon with Surveyor 3 and Apollo 11, then landing Apollo 12 right beside Surveyor 3 for the first extraterrestrial archaeological study.",
    artifactIds: ['surveyor-3', 'apollo-11', 'apollo-12', 'venera-7']
  },
  {
    id: 1,
    pill_tr: "II. Bilim İçin Feda",
    pill_en: "II. Sacrificed for Science",
    title_tr: "BÖLÜM II: BİLİM İÇİN FEDA EDİLENLER & SİSMİK DENEYLER (1970–1999)",
    title_en: "ACT II: SACRIFICED FOR SCIENCE & SEISMIC IMPACTS (1970–1999)",
    desc_tr: "Geride bırakılan her parça görevini bitirmedi: Apollo 13'ün S-IVB roket kademesi Ay'ın iç çekirdeğini haritalamak için sismik çekiç olarak çarptırıldı, Lunar Prospector su buzu aramak için kutup kraterine daldı, Galileo ise Jüpiter atmosferinde buharlaşarak son verisini gönderdi.",
    desc_en: "Abandoned hardware kept serving science: Apollo 13's S-IVB stage was crashed as a seismic hammer to map the lunar interior, Lunar Prospector plunged into a polar crater with Eugene Shoemaker's ashes, and Galileo vaporized inside Jupiter.",
    artifactIds: ['apollo-13-sivb', 'apollo-14', 'apollo-15', 'apollo-16', 'apollo-17', 'lunar-prospector', 'lcross-centaur', 'galileo-probe']
  },
  {
    id: 2,
    pill_tr: "III. Kızıl Gezegen",
    pill_en: "III. Red Planet Pioneers",
    title_tr: "BÖLÜM III: KIZIL GEZEGEN'DE YALNIZ GEZGİNLER (1976–2018)",
    title_en: "ACT III: LONELY ROVERS ON THE RED PLANET (1976–2018)",
    desc_tr: "Mars'taki robotlarımız bizim mekanik uzantılarımız oldu: 90 gün ömür biçilen Opportunity, 15 yıl boyunca 45 km yol kat ettikten sonra küresel toz fırtınasında 'Bataryam bitiyor ve hava kararıyor' diyerek Perseverance Vadisi'nde sonsuz uykuya daldı.",
    desc_en: "Designed for 90 sols, Opportunity roved Mars for 15 years and 45 km before sending its final poetic telemetry in a planet-encircling dust storm: 'My battery is low and it's getting dark.'",
    artifactIds: ['viking-1', 'mars-pathfinder', 'spirit-rover', 'opportunity-rover', 'phoenix-lander', 'insight-lander']
  },
  {
    id: 3,
    pill_tr: "IV. Venüs & Dış Sistem",
    pill_en: "IV. Venus & Outer System",
    title_tr: "BÖLÜM IV: 92 BAR CEHENNEM BASINCI, TİTAN DENİZLERİ VE KUYRUKLU YILDIZLAR (1978–2014)",
    title_en: "ACT IV: VENUSIAN HELL, TITAN'S METHANE SEAS & COMETS (1978–2014)",
    desc_tr: "Keşif sınırlarımız iç gezegenleri aştı: Venüs'ün 465°C'lik fırınında 127 dakika direnen Venera 13 ve Pioneer Venus, Satürn'ün uydusu Titan'ın eksi 179°C'lik metan kıyılarına inen Huygens ve 67P kuyruklu yıldızına tutunan Philae.",
    desc_en: "Humanity pushed to the extremes: Venera 13 and Pioneer Venus enduring 465°C and 92 bar on Venus, Huygens landing on Saturn's moon Titan at -179°C, and Philae touching down on Comet 67P.",
    artifactIds: ['pioneer-venus-day', 'venera-13', 'near-shoemaker-eros', 'cassini-huygens', 'rosetta-philae']
  },
  {
    id: 4,
    pill_tr: "V. Uzay Arkeolojisi",
    pill_en: "V. Space Archaeology",
    title_tr: "BÖLÜM V: GELECEĞİN UZAY ARKEOLOJİSİ & ARTEMIS ANLAŞMALARI (2012–GELECEK)",
    title_en: "ACT V: FUTURE SPACE ARCHAEOLOGY & THE ARTEMIS ACCORDS (2012–FUTURE)",
    desc_tr: "Başka bir gezegende uçan ilk hava aracı Ingenuity'nin kırık kanadıyla Valinor Tepeleri'ndeki son nöbeti ve NASA SP-2024-4559 (Artemis Accords Bölüm 9) kapsamında bu 200+ tonluk kalıntının 'uzay çöpü' değil, korunması gereken Dünya Dışı Kültür Mirası ilan edilmesi.",
    desc_en: "Ingenuity's final vigil at Valinor Hills after 72 flights, and how NASA SP-2024-4559 & Artemis Accords Section 9 transform 200+ tons of discarded gear from 'debris' into protected Extraterrestrial Cultural Heritage.",
    artifactIds: ['curiosity-skycrane', 'perseverance-parachute', 'ingenuity-helicopter']
  }
];


class AbandonedInSpaceApp {
  constructor() {
    this.currentBody = 'moon';
    this.currentLang = 'en';
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
    this.sceneManager = new SpaceSceneManager('canvas-container');
    this.sceneManager.setArtifacts(ARTIFACTS);

    window.onArtifactHover = (artifact, x, y) => this.showTooltip(artifact, x, y);
    window.onArtifactLeave = () => this.hideTooltip();
    window.onArtifactSelect = (artifact) => this.selectArtifact(artifact);

    this.bindControls();
    this.applyLanguage('en');
    this.initLiveMarsTelemetry();

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
          ? `<span>🔊</span> <span class="btn-text-collapsible" data-i18n="sound_on">${this.currentLang === 'tr' ? 'SES' : 'AUDIO'}</span>`
          : `<span>🔇</span> <span class="btn-text-collapsible" data-i18n="sound_off">${this.currentLang === 'tr' ? 'SESSİZ' : 'MUTE'}</span>`;
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

    // Guided Story Tour Button (Starts 5-Act Full Narrative Tour by default for best Storytelling!)
    const tourBtn = document.getElementById('btn-tour-toggle');
    if (tourBtn) {
      tourBtn.addEventListener('click', () => {
        if (this.isTourActive) {
          this.endTour();
        } else {
          this.startTour(true);
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

    // 5-Chapter Narrative Pills
    document.querySelectorAll('.chapter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const chIdx = parseInt(e.currentTarget.getAttribute('data-chapter'), 10) || 0;
        this.jumpToStoryChapter(chIdx);
      });
    });

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
        else this.startTour(true);
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

  // --- Live Mars Weather & Rover Telemetry ---
  initLiveMarsTelemetry() {
    this.updateLiveMarsCard();
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
      .catch(() => {});
  }

  updateLiveMarsCard() {
    if (typeof LIVE_ROVER_TELEMETRY === 'undefined') return;
    const r = LIVE_ROVER_TELEMETRY[this.activeRover];
    if (!r) return;

    const isTr = this.currentLang === 'tr';

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
    if (badgeEl) badgeEl.innerText = this.activeRover === 'perseverance' ? (isTr ? 'MEDA SENSÖRÜ' : 'MEDA SENSOR') : (isTr ? 'REMS SENSÖRÜ' : 'REMS SENSOR');
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
        const title = (a.name_tr + " " + a.name_en + " " + a.mission + " " + a.locationName + " " + (a.locationName_en || "")).toLowerCase();
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

  getVerificationMetadata(artifact) {
    const isTr = this.currentLang === 'tr';
    if (artifact.body === 'moon') {
      if (artifact.id === 'lunar-prospector') {
        return {
          monograph: "NASA SP-2022-4235 (Near-Earth Objects Research) & SP-2026-4239 (Discovery Program)",
          dataset: isTr ? "Lunar Prospector GRS/NS & LROC Güney Kutbu Haritası" : "Lunar Prospector GRS/NS & LROC South Pole Mapping",
          heritage: isTr ? "Eugene Shoemaker Anıt Alanı & Artemis Accords Bölüm 9" : "Eugene Shoemaker Memorial & Artemis Accords Section 9"
        };
      }
      return {
        monograph: "NASA SP-2024-4559 (Governing the Moon: A History — S. Buono)",
        dataset: isTr ? "NASA 2012 Lunar Artifacts Catalogue & LROC NAC (0.5m/px)" : "NASA 2012 Lunar Artifacts Catalogue & LROC NAC (0.5m/px)",
        heritage: isTr ? "Artemis Accords Bölüm 9 — Korunan İnsanlık Ay Mirası" : "Artemis Accords Section 9 — Protected Lunar Heritage Site"
      };
    } else if (artifact.body === 'mars') {
      if (artifact.id === 'mars-pathfinder') {
        return {
          monograph: "NASA SP-2026-4239 (NASA's Discovery Program — D. W. Brown)",
          dataset: isTr ? "MRO HiRISE & IMP Yüzey Telemetrisi (Ares Vallis)" : "MRO HiRISE & IMP Surface Telemetry (Ares Vallis)",
          heritage: isTr ? "Carl Sagan Anıt İstasyonu (COSPAR Kategori IV)" : "Carl Sagan Memorial Station (COSPAR Category IV)"
        };
      }
      return {
        monograph: "NASA SP-2021-4705 (50 Years of Solar System Exploration)",
        dataset: isTr ? "MRO HiRISE (0.25m/px) & NASA PDS / MEDA-REMS Telemetrisi" : "MRO HiRISE (0.25m/px) & NASA PDS / MEDA-REMS Telemetry",
        heritage: isTr ? "COSPAR Gezegen Koruma & Mars Yüzey Arkeoloji Envanteri" : "COSPAR Planetary Protection & Mars Surface Inventory"
      };
    } else if (artifact.body === 'venus') {
      return {
        monograph: "NASA SP-2021-4705 (50 Years of Solar System Exploration) & NSSDCA",
        dataset: isTr ? "NASA Magellan SAR Radar (PIA00271) & Pioneer Venus Telemetrisi" : "NASA Magellan SAR Radar (PIA00271) & Pioneer Venus Telemetry",
        heritage: isTr ? "Venüs 92 Bar Yüksek Basınç Yüzey Mirası" : "Venus 92-Bar Supercritical Surface Relic"
      };
    } else {
      if (artifact.id === 'near-shoemaker-eros') {
        return {
          monograph: "NASA SP-2022-4235 (Near-Earth Objects) & SP-2026-4239 (Discovery Program)",
          dataset: isTr ? "NEAR MSI & GRS Gama Işını Spektrometresi (PIA03112)" : "NEAR MSI & GRS Gamma-Ray Spectrometer (PIA03112)",
          heritage: isTr ? "İlk Asteroit Yüzey İniş Noktası (433 Eros)" : "First Asteroid Surface Touchdown Site (433 Eros)"
        };
      }
      return {
        monograph: "NASA SP-2021-4705 (50 Years of Solar System Exploration — Cassini/Galileo)",
        dataset: isTr ? "Cassini-Huygens DISR (PIA07232) & Rosetta OSIRIS (PIA18899)" : "Cassini-Huygens DISR (PIA07232) & Rosetta OSIRIS (PIA18899)",
        heritage: isTr ? "Dış Güneş Sistemi En Uzak İnsan Yapımı Anıtı" : "Farthest Human-Made Monument in the Outer Solar System"
      };
    }
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
    const items = isTr ? artifact.discardedItems : (artifact.discardedItems_en || artifact.discardedItems);
    items.forEach(itemStr => {
      const li = document.createElement('li');
      li.innerText = itemStr;
      listEl.appendChild(li);
    });

    const specs = isTr ? artifact.technicalSpecs : (artifact.technicalSpecs_en || artifact.technicalSpecs);
    document.getElementById('spec-mass').innerText = specs.massLeftKg;
    document.getElementById('spec-power').innerText = specs.powerSource;
    document.getElementById('spec-duration').innerText = specs.activeDuration;
    document.getElementById('spec-coords').innerText = specs.coordinatesReadable;

    // Populate NASA Verification & Scientific Proof Card
    const verMeta = this.getVerificationMetadata(artifact);
    const monoEl = document.getElementById('ver-monograph');
    const dataEl = document.getElementById('ver-dataset');
    const herEl = document.getElementById('ver-heritage');
    if (monoEl) monoEl.innerText = verMeta.monograph;
    if (dataEl) dataEl.innerText = verMeta.dataset;
    if (herEl) herEl.innerText = verMeta.heritage;

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

  // --- 5-Chapter Guided Story Tour ---
  buildOrderedNarrativeTourList() {
    const ordered = [];
    STORY_CHAPTERS.forEach(ch => {
      ch.artifactIds.forEach(id => {
        const found = ARTIFACTS.find(a => a.id === id);
        if (found) ordered.push(found);
      });
    });
    return ordered.length > 0 ? ordered : [...ARTIFACTS];
  }

  startTour(allBodies = true) {
    this.tourList = allBodies ? this.buildOrderedNarrativeTourList() : getArtifactsByBody(this.currentBody);
    if (this.tourList.length === 0) return;

    this.isTourActive = true;
    this.tourIndex = 0;

    const tourBtn = document.getElementById('btn-tour-toggle');
    if (tourBtn) tourBtn.classList.add('active-tour');

    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.add('active');

    this.updateTourStep();
  }

  jumpToStoryChapter(chapterIdx) {
    const chapter = STORY_CHAPTERS[chapterIdx];
    if (!chapter) return;

    if (!this.isTourActive || this.tourList.length < 15) {
      this.tourList = this.buildOrderedNarrativeTourList();
      this.isTourActive = true;
      const tourBtn = document.getElementById('btn-tour-toggle');
      if (tourBtn) tourBtn.classList.add('active-tour');
      const banner = document.getElementById('tour-banner');
      if (banner) banner.classList.add('active');
    }

    const firstId = chapter.artifactIds[0];
    const targetIdx = this.tourList.findIndex(a => a.id === firstId);
    if (targetIdx !== -1) {
      this.tourIndex = targetIdx;
      this.updateTourStep();
    }
  }

  updateTourStep() {
    const artifact = this.tourList[this.tourIndex];
    if (!artifact) return;

    const isTr = this.currentLang === 'tr';
    const progressEl = document.getElementById('tour-progress-text');
    if (progressEl) {
      progressEl.innerText = `${this.tourIndex + 1} / ${this.tourList.length} — ${isTr ? artifact.name_tr : artifact.name_en}`;
    }

    // Find which Story Chapter this artifact belongs to
    const activeChapter = STORY_CHAPTERS.find(ch => ch.artifactIds.includes(artifact.id)) || STORY_CHAPTERS[0];
    document.querySelectorAll('.chapter-pill').forEach((pill, idx) => {
      pill.classList.toggle('active', idx === activeChapter.id);
      pill.innerText = isTr ? STORY_CHAPTERS[idx].pill_tr : STORY_CHAPTERS[idx].pill_en;
    });

    const chTitleEl = document.getElementById('narrative-chapter-title');
    const chDescEl = document.getElementById('narrative-chapter-desc');
    if (chTitleEl) chTitleEl.innerText = isTr ? activeChapter.title_tr : activeChapter.title_en;
    if (chDescEl) chDescEl.innerText = isTr ? activeChapter.desc_tr : activeChapter.desc_en;

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
    document.getElementById('tooltip-meta').innerText = `${artifact.mission} • ${isTr ? artifact.locationName : (artifact.locationName_en || artifact.locationName)}`;

    tooltip.style.left = `${clientX}px`;
    tooltip.style.top = `${clientY}px`;
    tooltip.classList.add('visible');
  }

  hideTooltip() {
    const tooltip = document.getElementById('beacon-tooltip');
    if (tooltip) tooltip.classList.remove('visible');
  }

  // --- Language Switcher (TR / EN) ---
  applyLanguage(lang) {
    this.currentLang = lang;
    const isTr = this.currentLang === 'tr';

    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.innerHTML = `<span>🌐</span> <span style="font-weight:${isTr ? '400' : '700'}; color:${isTr ? '#94a3b8' : '#00f0ff'};">EN</span><span style="opacity:0.4; margin:0 3px;">|</span><span style="font-weight:${isTr ? '700' : '400'}; color:${isTr ? '#00f0ff' : '#94a3b8'};">TR</span>`;
      langBtn.setAttribute('title', isTr ? 'Switch to English' : 'Türkçe Dilini Seç');
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

    // Update Interactive Element Tooltips for Browser Hover
    const tooltips = {
      'btn-sound-toggle': isTr ? 'Sesi Aç / Kapat' : 'Toggle Audio / Ambient Sound',
      'btn-sources-toggle': isTr ? 'Resmi NASA Veri Kaynakları ve Tarih Serisi PDF Arşivleri' : 'Official NASA Data Sources & History Series PDF Archives',
      'btn-tour-toggle': isTr ? '5 Bölümlük Rehberli Hikaye Turunu Başlat' : 'Start 5-Act Guided Narrative Tour',
      'btn-reset-view': isTr ? 'Kamera Bakış Açısını Sıfırla' : 'Reset Camera View',
      'btn-top-sim': isTr ? 'Seçili Görevin İniş veya Çarpışma Sahnesini Başlat (3D)' : 'Launch 3D Descent / Kinetic Impact Reenactment',
      'btn-top-walk': isTr ? '1:1 Ölçekte Yüzeyde Yürü & WebXR VR/AR Başlat' : '1:1 Scale Astronaut Surface Walk & WebXR VR/AR',
      'tour-all-btn': isTr ? '5 Bölümlük Tüm Güneş Sistemi Büyük Hikâye Turu (25 Görev)' : 'Full 5-Act Grand Solar System Story Tour (25 Missions)',
      'btn-drawer-sim': isTr ? '3D İniş ve Fizik Simülasyonunu Aç' : 'Launch 3D Descent & Physics Simulation',
      'btn-drawer-walk': isTr ? 'Meta Quest / Vision Pro WebXR veya Masaüstü 1:1 Yüzey Yürüyüşü' : 'Meta Quest / Vision Pro WebXR or Desktop 1:1 Surface Walk',
      'btn-mini-wireframe': isTr ? 'CAD Tel Kafes (Wireframe) Görünümünü Aç / Kapat' : 'Toggle CAD Wireframe (X-Ray) Mode',
      'btn-sim-walk': isTr ? '1:1 Astronot Göz Hizasında Yüzey Yürüyüşü Modu' : '1:1 Astronaut Eye-Level Surface Walk Mode',
      'btn-sim-webxr': isTr ? 'Meta Quest veya Apple Vision Pro ile WebXR VR/AR Başlat' : 'Launch WebXR VR/AR with Meta Quest or Apple Vision Pro',
      'btn-replay-sim': isTr ? 'Simülasyonu Baştan Başlat' : 'Replay Simulation from Beginning',
      'btn-close-sim': isTr ? 'Simülasyonu Kapat (ESC)' : 'Exit Simulation (ESC)',
      'vr-game-mini-pill': isTr ? 'Normal Arayüz Butonlarını Geri Getirmek İçin Tıklayın veya [H] Tuşuna Basın' : 'Toggle Fullscreen HUD Mode [H / TAB] or Exit [ESC]',
      'btn-walk-view-toggle': isTr ? '1. Şahıs / 3. Şahıs Kamera Açısı (V)' : 'Toggle 1st / 3rd Person View (V)',
      'btn-walk-cabin': isTr ? 'İniş Sonrası Basınçlı EVA Kapağını Aç / Kapat (E)' : 'Open / Close Airlock Hatch (E)',
      'btn-walk-torch': isTr ? 'NASA EVA Fenerini Aç / Kapat (F)' : 'Toggle NASA EVA Flashlight (F)',
      'btn-walk-clean-ui': isTr ? 'Sinematik Tam Ekran Modu (H / TAB)' : 'Cinematic Fullscreen Mode (H / TAB)',
      'walk-btn-up': isTr ? 'İleri Yürü (W)' : 'Walk Forward (W)',
      'walk-btn-left': isTr ? 'Sola Yürü (A)' : 'Strafe Left (A)',
      'walk-btn-jump': isTr ? 'Düşük Yerçekimi Sıçraması (SPACE)' : 'Low-Gravity Jump (SPACE)',
      'walk-btn-right': isTr ? 'Sağa Yürü (D)' : 'Strafe Right (D)',
      'walk-btn-down': isTr ? 'Geri Yürü (S)' : 'Walk Backward (S)',
      'btn-enter-quest-vr': isTr ? 'Meta Quest 3S gözlüğü içinde gerçek VR moduna gir' : 'Enter Immersive VR Mode in Meta Quest 3S'
    };
    Object.keys(tooltips).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('title', tooltips[id]);
    });

    document.querySelectorAll('.planet-btn').forEach(btn => {
      const body = btn.getAttribute('data-body');
      if (body === 'moon') btn.setAttribute('title', isTr ? 'Ay Yüzeyini İncele' : 'Explore Lunar Surface');
      else if (body === 'mars') btn.setAttribute('title', isTr ? 'Mars Yüzeyini İncele' : 'Explore Martian Surface');
      else if (body === 'venus') btn.setAttribute('title', isTr ? 'Venüs Yüzeyindeki Sovyet Venera ve NASA Pioneer Sondalarını İncele' : 'Explore Soviet Venera & NASA Pioneer Probes on Venus');
      else if (body === 'outer') btn.setAttribute('title', isTr ? 'Titan (Huygens), 67P Kuyruklu Yıldızı (Philae) ve Dış Güneş Sistemi Kalıntılarını İncele' : 'Explore Titan (Huygens), Comet 67P (Philae) & Outer System Relics');
    });

    const miniKeys = document.getElementById('vr-game-mini-keys');
    if (miniKeys) miniKeys.innerText = isTr ? '[H / TAB]: Arayüz • [ESC]: Çıkış' : '[H / TAB]: UI • [ESC]: Exit';

    this.updateBodyTelemetry();
    this.updateLiveMarsCard();
    this.renderArtifactsList();

    // Update Tour Chapter Pills & Default Banner Text
    document.querySelectorAll('.chapter-pill').forEach((pill, idx) => {
      if (STORY_CHAPTERS[idx]) {
        pill.innerText = isTr ? STORY_CHAPTERS[idx].pill_tr : STORY_CHAPTERS[idx].pill_en;
      }
    });
    const defaultCh = STORY_CHAPTERS[0];
    const chTitleEl = document.getElementById('narrative-chapter-title');
    const chDescEl = document.getElementById('narrative-chapter-desc');
    if (chTitleEl && !this.isTourActive) chTitleEl.innerText = isTr ? defaultCh.title_tr : defaultCh.title_en;
    if (chDescEl && !this.isTourActive) chDescEl.innerText = isTr ? defaultCh.desc_tr : defaultCh.desc_en;

    // Update Simulation Camera Select Options
    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) {
      Array.from(camSelect.options).forEach(opt => {
        const k = opt.getAttribute('data-i18n');
        if (k && TRANSLATIONS[this.currentLang] && TRANSLATIONS[this.currentLang][k]) {
          opt.innerText = TRANSLATIONS[this.currentLang][k];
        }
      });
    }

    // Update Audio Toggle Button text
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      const isMuted = window.SpaceAudio ? window.SpaceAudio.isMuted : false;
      const textSpan = soundBtn.querySelector('.btn-text-collapsible');
      if (textSpan) {
        textSpan.innerText = isMuted
          ? (isTr ? 'SESSİZ' : 'MUTE')
          : (isTr ? 'SES' : 'AUDIO');
      }
    }

    // Update Rover Button Label
    const gotoRoverLabel = document.getElementById('goto-rover-label');
    if (gotoRoverLabel) {
      gotoRoverLabel.innerText = isTr ? 'Haritada Rover Konumuna Uç' : 'Fly to Active Rover on Map';
    }

    // Update Simulation Theater if running or open
    if (window.SpaceSimulation) {
      window.SpaceSimulation.updateSimulationLanguage();
    }

    if (this.isTourActive) {
      this.updateTourStep();
    } else if (this.sceneManager && this.sceneManager.selectedArtifact) {
      this.openDrawer(this.sceneManager.selectedArtifact);
    }
  }

  toggleLanguage() {
    this.applyLanguage(this.currentLang === 'tr' ? 'en' : 'tr');
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
    live_radar_badge: "CANLI RADAR",
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
    decade_1960: "1960'LAR",
    decade_1970: "1970'LER",
    decade_1980: "1980'LER",
    decade_1990: "1990'LAR",
    decade_2000: "2000'LER",
    decade_2010: "2010'LAR",
    decade_2020: "2020'LER",
    sim_action_btn: "İNİŞ / ÇARPIŞMA SAHNESİNİ İZLE (3D)",
    sim_action_sub: "Gerçek fizik, itici alevleri ve sismik darbe canlandırması",
    walk_action_btn: "1:1 ÖLÇEKTE YANINDA YÜRÜ (WebXR)",
    walk_action_sub: "Aracın yanında 1.75m astronot göz hizasında yürü (VR / WASD)",
    why_left_label: "NEDEN GERİDE BIRAKILDI?",
    condition_label: "BUGÜNKÜ DURUMU (YILLAR SONRA)",
    discarded_label: "TERK EDİLEN TEÇHİZAT LİSTESİ",
    specs_label: "TEKNİK TELEMETRİ BİLGİSİ",
    spec_mass_title: "KORUNAN KÜTLE",
    spec_power_title: "GÜÇ KAYNAĞI",
    spec_duration_title: "AKTİF GÖREV ÖMRÜ",
    spec_coords_title: "KOORDİNATLAR",
    nasa_proof_badge: "📜 NASA VERİ DOĞRULAMA & BİLİMSEL GEÇERLİLİK KANITI",
    ver_monograph_label: "AKADEMİK MONOGRAFİ:",
    ver_dataset_label: "UYDU & SENSÖR VERİSİ:",
    ver_heritage_label: "KORUMA STATÜSÜ:",
    transmission_label: "TELSİZ VE TELEMETRİ SESİ",
    play_audio_btn: "TELSİZİ DİNLE",
    btn_prev_site: "Önceki Kalıntı",
    btn_next_site: "Sonraki Kalıntı",
    hint_controls_kbd: "Fare / Dokun",
    hint_controls: "360° Gezin • Yakınlaş • Noktalara Tıkla",
    m_label_map: "Harita",
    m_label_relics: "Kalıntılar",
    m_label_telemetry: "Telemetri",
    m_label_tour: "Tur",
    m_label_sources: "Kaynaklar",
    tour_active_title: "📖 5 BÖLÜMLÜK HİKÂYE AKIŞI",
    tour_prev_btn: "◀ Önceki",
    tour_next_btn: "Sonraki ▶",
    tour_all_btn: "🌌 5 Bölümlük Tam Hikâye (25)",
    tour_exit_btn: "Turu Bitir ✕",
    tour_ch1: "I. İlk Dokunuş",
    tour_ch2: "II. Bilim İçin Feda",
    tour_ch3: "III. Kızıl Gezegen",
    tour_ch4: "IV. Venüs & Dış Sistem",
    tour_ch5: "V. Uzay Arkeolojisi & Gelecek",
    sim_badge_title: "🛰️ İNİŞ SİMÜLASYONU",
    sim_cam_label: "KAMERA:",
    cam_opt_cinematic: "Sinematik Yönetmen",
    cam_opt_follow: "Takip Kamerası",
    cam_opt_ground: "Yüzey Sabit Kamerası",
    cam_opt_free: "Serbest 360° Kamera (Mouse/Touch)",
    cam_opt_walk: "🥽 1:1 Yüzey Yürüyüşü (WASD / WebXR)",
    btn_sim_walk: "1:1 Yürüyüş",
    btn_sim_replay: "Tekrar Oynat",
    btn_sim_exit: "✕ ÇIKIŞ",
    vr_game_mission_text: "🎮 VR OYUN MODU AKTİF • Numune: 0/8",
    vr_game_mini_keys: "[H / TAB]: Arayüz • [ESC]: Çıkış",
    btn_enter_quest_vr: "🥽 META QUEST 3S — VR'A GİR",
    walk_btn_jump: "SIÇRA",
    gauge_alt_label: "İRTİFA / GÖZ HİZASI",
    gauge_speed_label: "HIZ / MESAFE",
    gauge_thrust_label: "İTME GÜCÜ / MOD",
    hud_phase_terminal: "ALÇALMA VE FRENLEME AŞAMASI (TERMINAL DESCENT)",
    sources_modal_title: "RESMİ NASA VERİ KAYNAKLARI & TARİH SERİSİ ARŞİVLERİ",
    sources_intro: "Bu projede yer alan tüm koordinatlar, iniş tarihleri, donanım envanterleri, NASA History Series (SP-2021-4705, SP-2022-4235, SP-2024-4559, SP-2026-4239) akademik referansları ve telsiz konuşmaları NASA'nın resmi bilimsel arşivlerinden doğrulanmıştır:",
    sources_license_note: "✦ NASA Açık Veri Politikası (Open Data Policy), data.nasa.gov ve images.nasa.gov kapsamında eğitim ve bilimsel araştırma amacıyla derlenmiştir.",
    nasa_photos_label: "📷 GERÇEK NASA UYDU & YÜZEY FOTOĞRAFLARI",
    nasa_photos_subtext: "NASA LROC, HiRISE, Magellan, Cassini ve Rosetta arşivlerinden doğrulanmış kareler (Büyütmek için tıklayın):",
    lb_nasa_archive: "NASA ARŞİVİ",
    lb_catalog_label: "KATALOG NO:",
    lb_instrument_label: "ENSTRÜMAN:"
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
    live_radar_badge: "LIVE RADAR",
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
    decade_1960: "1960s",
    decade_1970: "1970s",
    decade_1980: "1980s",
    decade_1990: "1990s",
    decade_2000: "2000s",
    decade_2010: "2010s",
    decade_2020: "2020s",
    sim_action_btn: "WATCH LANDING / IMPACT (3D)",
    sim_action_sub: "Authentic physics, thruster plumes, and seismic impact reenactment",
    walk_action_btn: "WALK BESIDE AT 1:1 SCALE (WebXR)",
    walk_action_sub: "Walk at 1.75m astronaut eye-level beside the craft (VR / WASD)",
    why_left_label: "WHY WAS IT LEFT BEHIND?",
    condition_label: "CURRENT CONDITION (DECADES LATER)",
    discarded_label: "DISCARDED EQUIPMENT CHECKLIST",
    specs_label: "TECHNICAL SPECS & TELEMETRY",
    spec_mass_title: "PRESERVED MASS",
    spec_power_title: "POWER SOURCE",
    spec_duration_title: "ACTIVE MISSION DURATION",
    spec_coords_title: "COORDINATES",
    nasa_proof_badge: "📜 NASA DATA VERIFICATION & SCIENTIFIC VALIDITY PROOF",
    ver_monograph_label: "ACADEMIC MONOGRAPH:",
    ver_dataset_label: "ORBITER & SENSOR DATA:",
    ver_heritage_label: "HERITAGE STATUS:",
    transmission_label: "RADIO AUDIO & TELEMETRY",
    play_audio_btn: "LISTEN TO TRANSMISSION",
    btn_prev_site: "Previous Site",
    btn_next_site: "Next Site",
    hint_controls_kbd: "Mouse / Touch",
    hint_controls: "Rotate 360° • Zoom • Tap Beacons",
    m_label_map: "Map",
    m_label_relics: "Relics",
    m_label_telemetry: "Telemetry",
    m_label_tour: "Tour",
    m_label_sources: "Sources",
    tour_active_title: "📖 5-ACT STORYTELLING TOUR",
    tour_prev_btn: "◀ Previous",
    tour_next_btn: "Next ▶",
    tour_all_btn: "🌌 Full 5-Act Story (25)",
    tour_exit_btn: "Exit Tour ✕",
    tour_ch1: "I. First Contact",
    tour_ch2: "II. Sacrificed for Science",
    tour_ch3: "III. Red Planet",
    tour_ch4: "IV. Venus & Outer System",
    tour_ch5: "V. Space Archaeology & Future",
    sim_badge_title: "🛰️ DESCENT SIMULATION",
    sim_cam_label: "CAMERA:",
    cam_opt_cinematic: "Cinematic Director",
    cam_opt_follow: "Chase Cam",
    cam_opt_ground: "Ground Cam",
    cam_opt_free: "Free 360° Camera (Mouse/Touch)",
    cam_opt_walk: "🥽 1:1 Surface Walk (WASD / WebXR)",
    btn_sim_walk: "1:1 Walk",
    btn_sim_replay: "Replay",
    btn_sim_exit: "✕ EXIT",
    vr_game_mission_text: "🎮 VR GAME MODE ACTIVE • Samples: 0/8",
    vr_game_mini_keys: "[H / TAB]: UI • [ESC]: Exit",
    btn_enter_quest_vr: "🥽 META QUEST 3S — ENTER VR",
    walk_btn_jump: "JUMP",
    gauge_alt_label: "ALTITUDE / EYE LEVEL",
    gauge_speed_label: "SPEED / DISTANCE",
    gauge_thrust_label: "THRUST / MODE",
    hud_phase_terminal: "TERMINAL DESCENT & BRAKING PHASE",
    sources_modal_title: "OFFICIAL NASA DATA SOURCES & HISTORY SERIES ARCHIVES",
    sources_intro: "All coordinates, mission dates, discarded hardware manifests, NASA History Series (SP-2021-4705, SP-2022-4235, SP-2024-4559, SP-2026-4239) citations, and radio transmissions are compiled from NASA's official public archives:",
    sources_license_note: "✦ Compiled under NASA Open Data Policy, data.nasa.gov, and images.nasa.gov for educational and scientific research purposes.",
    nasa_photos_label: "📷 AUTHENTIC NASA SATELLITE & SURFACE PHOTOS",
    nasa_photos_subtext: "Verified archive photography from NASA LROC, HiRISE, Magellan, Cassini & Rosetta (Click to enlarge):",
    lb_nasa_archive: "NASA ARCHIVE",
    lb_catalog_label: "CATALOG ID:",
    lb_instrument_label: "INSTRUMENT:"
  }
};

// Initialize App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AbandonedInSpaceApp();
});
