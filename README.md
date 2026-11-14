# 🛰️ Abandoned but not Forgotten: NASA's Discarded Equipment Across the Solar System (v4.6)
### (Terk Edilmiş Ama Unutulmamış: Ay, Mars, Venüs ve Dış Gezegenlerdeki Tarihi Uzay Ekipmanları)

> **"Buradan barış ve umutla ayrılıyoruz; geri döndüğümüzde tüm insanlık için döneceğiz."** — *Gene Cernan (Apollo 17, Ay'da yürüyen son insan)*

İnsanlığın Dünya dışındaki gök cisimlerinde (**Ay, Mars, Venüs, Titan, 67P Kuyruklu Yıldızı, 433 Eros Asteroidi ve Jüpiter**) bıraktığı **25 tarihi donanımın**, iniş kademelerinin, keşif araçlarının ve bilimsel anıtların 3D interaktif haritası, **1:1 WebXR Yüzey Yürüyüşü & İç Kabin Keşfi** ve eğitici hikaye anlatımı platformu.

🔗 **Canlı Web Adresi (GitHub Pages):** [https://batuhanklcky.github.io/abandoned-in-space/](https://batuhanklcky.github.io/abandoned-in-space/)
🏆 **Yarışma Kategorisi:** [NASA Space Apps Challenge 2026 — NASA's Discarded Equipment Storytelling](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources)

---

## 🌟 v4.6 Öne Çıkan Özellikler & Yol Haritası Entegrasyonu

1. **🪐 4 Farklı Gök Cismi & Dış Güneş Sistemi Görevleri (25 Tarihi Görev)**:
   - **Ay (The Moon - 10 Görev)**: Surveyor 3, Apollo 11, Apollo 12, Apollo 13 S-IVB, Apollo 14, Apollo 15 (LRV), Apollo 16, Apollo 17, Lunar Prospector ve LCROSS Centaur.
   - **Mars (Kızıl Gezegen - 8 Görev)**: Viking 1, Mars Pathfinder & Sojourner, Spirit, Opportunity, Phoenix, Curiosity Sky Crane, InSight ve Perseverance & Ingenuity.
   - **Venüs (92 Bar Basınç Cehennemi - 3 Görev)**: Sovyet **Venera 7** (başka bir gezegenden ilk veri), **NASA Pioneer Venus Day Probe** (beklenmedik şekilde 67.5 dakika yüzeyden sinyal gönderen titanyum küre) ve **Venera 13** (465°C'de ilk renkli Venüs panoraması ve ses kaydı).
   - **Titan & Dış Sistem (4 Görev)**: Satürn'ün uydusu Titan'a inen **ESA/NASA Cassini-Huygens**, **67P/Churyumov-Gerasimenko** kuyruklu yıldızına inen **Rosetta & Philae**, **433 Eros** asteroidine doğaçlama inen **NEAR Shoemaker** ve Jüpiter'in 22 barlık atmosferinde buharlaşan **Galileo Atmosferik Sondası**.

2. **🥽 WebXR ile VR/AR Entegrasyonu, 1:1 Yüzey Yürüyüşü & Merdivenle Girilebilir İç Kabin**:
   - Kullanıcıların **Meta Quest**, **Apple Vision Pro** (`navigator.xr` WebXR Immersive VR/AR API) veya masaüstü/mobil tarayıcıda **1.75 metre astronot göz hizasında** (1. Şahıs ve 3. Şahıs Apollo A7L / Artemis xEMU astronot modeliyle) araçların yanında yürümesini, **ayak izi (`bootprint`)** bırakmasını ve **12 basamaklı dış EVA merdivenini tırmanarak (`+4.5m`) uzay aracının / roketin / uydunun basınçlı iç kabinine girmesini** sağlar.
   - İç kabinde CNC işlenmiş üçgen **Isogrid** alüminyum duvarlar, **19 adet tıklanabilir 3B pahlı DSKY bilgisayar tuşu**, **altıgen somunlu ve güvenlik korkuluklu 3B toggle şalterler**, **3B tırtıklı çevirmeli kadranlar**, **ACA 3-eksenli yönelim joystick'i**, **itki gaz kolu**, **Master Alarm butonu** ve **120 adet tıklanabilir devre kesici (Panel 11)** yer alır.

3. **📡 Canlı Telemetri & Mars Hava Durumu (NASA MEDA / REMS)**:
   - Halen Mars'ta aktif olan **Perseverance (Jezero Krateri - MEDA)** ve **Curiosity (Gale Krateri - REMS)** gezginlerinin iniş epoch'una göre astronomik olarak hesaplanan anlık **Mars Günü (Sol)** sayacı, minimum/maksimum hava sıcaklığı, atmosfer basıncı (`Pa`), rüzgar hızı/yönü ve kat edilen kilometre (`odometer`).

---

## 📋 NASA Space Apps Challenge 2026 — Global Ödül Uygunluk & Resmi Başvuru Beyanları

### 1. NASA & Space Agency Partner Data (Hangi NASA Verisini Nasıl Kullandık?)
Global ödüllere uygunluk kapsamında projemizde doğrudan [NASA Space Apps Challenge — NASA's Discarded Equipment Storytelling Resources](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) sayfasındaki resmi NASA ve ortak uzay ajansı (ESA) veri kaynakları kullanılmıştır:
- **NASA Catalogue of Manmade Material on the Moon (2012, NASA HQ / History Program Office):** Ay yüzeyindeki 70'ten fazla iniş ve çarpışma noktasındaki ~190 tonluk insan yapımı teçhizatın kütle, koordinat ve parça envanteri (`js/data.js` içerisindeki `ARTIFACTS` dizisi) bu katalogdan çıkarılmıştır.
- **NASA History Series Akademik Monografileri (`SP-2024-4559`, `SP-2026-4239`, `SP-2022-4235`, `SP-2021-4705`):**
  - *SP-2024-4559 (Governing the Moon: A History — Stephen S. Buono):* Artemis Accords Bölüm 9 kapsamında uzay kalıntılarının "Dünya Dışı Kültür Mirası" statüsü.
  - *SP-2026-4239 (NASA's Discovery Program — David W. Brown):* Mars Pathfinder/Sojourner, Lunar Prospector ve NEAR Shoemaker görev verileri.
  - *SP-2022-4235 (A History of Near-Earth Objects Research):* Eugene Shoemaker'ın Ay'daki külleri ve 433 Eros asteroidi verileri.
  - *SP-2021-4705 (50 Years of Solar System Exploration — Linda Billings, ed.):* Viking 1, Pioneer Venus Day Probe, Galileo ve Cassini-Huygens verileri.
- **NASA Planetary Data System (PDS) & LROC / MRO HiRISE / Magellan / Cassini-Huygens (`images.nasa.gov`):** 25 kalıntının enlem-boylam koordinatları 3D küreler üzerine trigonometrik projeksiyonla (`latLongToVector3`) yerleştirilmiş ve her kalıntı kartına resmi NASA PIA/AS katalog fotoğrafları entegre edilmiştir.
- **NASA Open Data Portal (`data.nasa.gov`) — Mars Perseverance MEDA & Curiosity REMS:** İniş epoch zamanından itibaren geçen gerçek astronomik Mars Günü (`Sol = 88,775.244 s`), hava sıcaklığı, basınç ve rüzgar telemetrisi canlı olarak hesaplanmaktadır.
- **ESA / NASA Rosetta-Philae & Cassini-Huygens Ortak Veri Arşivleri:** Satürn'ün uydusu Titan (`10.25°G, 192.32°B`) ve 67P/Churyumov-Gerasimenko kuyruklu yıldızı (Abydos bölgesi) iniş verileri kullanılmıştır.

### 2. References (Kullanılan Tüm Veri, Kod, Görsel ve Araçların Listesi)
- **Resmi Veri Setleri & Kataloglar:**
  1. NASA Space Apps Challenge 2026 Resource Hub: `https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources`
  2. NASA (2012). *Catalogue of Manmade Material on the Moon*. (`https://www.nasa.gov/wp-content/uploads/2015/01/582183main_LRO_2012_ poster_back.pdf`)
  3. Buono, S. S. (2024). *Governing the Moon: A History* (NASA SP-2024-4559).
  4. Brown, D. W. (2026). *NASA's Discovery Program: Competitive Planetary Exploration in the 21st Century* (NASA SP-2026-4239).
  5. Conway, E. M., Yeomans, D. K., & Rosenburg, M. A. (2022). *A History of Near-Earth Objects Research* (NASA SP-2022-4235).
  6. Billings, L. (Ed.). (2021). *50 Years of Solar System Exploration: Historical Perspectives* (NASA SP-2021-4705).
  7. NASA Planetary Data System (PDS) Geosciences Node: `https://pds-geosciences.wustl.edu/`
  8. NASA Image and Video Library (`images.nasa.gov`) & Open Data Portal (`data.nasa.gov`).
  9. Lunar Reconnaissance Orbiter Camera (LROC) QuickMap (`https://quickmap.lroc.asu.edu/`) & MRO HiRISE (`https://www.uahirise.org/`).
- **Görseller & Doku Haritaları:**
  - Küre haritaları: Kamu malı (Public Domain) NASA LRO CGI Moon Kit ve NASA Viking/MGS Mars küresel mozaikleri (`three-globe` CDN üzerinden).
  - Tüm uzay aracı kaplamaları (Kapton altın folyo, güneş panelleri, CNC Isogrid iç kabin duvarları, DSKY tuşları ve astronot çizme izleri) HTML5 `Canvas2D` ile matematiksel olarak üretilmiştir (**Resmi NASA logosu kesinlikle kullanılmamıştır**).
- **Yazılım Kütüphaneleri & Web Standartları:**
  - `Three.js (r128)` & `THREE.OrbitControls`, `WebXR Device API (navigator.xr)`, `Web Audio API` (2525 Hz Quindar ton sentezleyici), `Web Speech API`, `Google Fonts (Space Grotesk, Inter, JetBrains Mono)`.

### 3. Use of Super Intelligence (Yapay Zekâ Kullanım Beyanı, Filigran ve Kurallara Uygunluk)
- **Yapay Zekâ Araçlarının Kullanımı:** Evet, yazılım geliştirme sürecinde kodlama asistanı olarak **Google DeepMind Antigravity (AI Pair-Programming Assistant)** kullanılmıştır.
- **Fikrin Özgünlüğü (İnsan Tarafından Kurgulanmıştır):** Projenin ana fikri (*uzayda terk edilen 205 tonluk ekipmanın 5 perdelik interaktif bir uzay arkeolojisi müzesine dönüştürülmesi ve 1:1 WebXR modunda merdivenle uzay araçlarının içine girilerek kontrol panellerinin incelenmesi*) **tamamen geliştirici (insan) tarafından** tasarlanmış; yapay zekâya fikir buldurulmamıştır.
- **Görünür Filigran (`Visible Watermark`):** Yapay zekâ destekli algoritmalarla üretilen tüm 3D WebGL sahnelerinde (`#canvas-container` ve `#simulation-modal`) ve prosedürel `Canvas2D` kabin ekranlarında **görünür filigran (`⚙️ AI-DESTEKLİ PROSEDÜREL WEBGL / THREE.JS SİMÜLASYONU • NASA LOGOSU İÇERMEZ`)** yer almaktadır.
- **Kod ve Verilerde Açıklama (`Code & Data Attribution`):** `js/data.js`, `js/simulation.js`, `js/scene.js` ve `js/textures.js` dosyalarının başlıklarında ve ilgili fonksiyonlarında yapay zekâ destekli prosedürel üretim ve NASA kaynak eşleştirmeleri açıkça belgelenmiştir.
- **NASA Logosu Kuralına Tam Uyum:** Yarışma kuralları gereği üretilen hiçbir 3D modelde, arayüzde veya prosedürel görselde **resmi NASA logosu ("Meatball" veya "Worm") kesinlikle kullanılmamıştır**.

---

## 🚀 Nasıl Çalıştırılır?

Proje dizininde Python ile yerel sunucu başlatabilirsiniz:

```bash
python server.py
```
*(Tarayıcınız otomatik olarak `http://localhost:8080` adresinde açılacaktır.)*
