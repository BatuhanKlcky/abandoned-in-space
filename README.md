# 🛰️ Abandoned but not Forgotten: NASA's Discarded Equipment on the Moon and Mars
### (Terk Edilmiş Ama Unutulmamış: Ay ve Mars'taki Tarihi NASA Ekipmanları)

> **"Buradan barış ve umutla ayrılıyoruz; geri döndüğümüzde tüm insanlık için döneceğiz."** — *Gene Cernan (Apollo 17, Ay'da yürüyen son insan)*

İnsanlığın Dünya dışındaki gök cisimlerinde (Ay ve Mars) bıraktığı tarihi donanımların, iniş kademelerinin, keşif araçlarının ve bilimsel anıtların 3D interaktif haritası ve eğitici hikaye anlatımı platformu.

---

## 🌟 Öne Çıkan Özellikler

1. **3D İnteraktif Gök Cisimleri (Three.js WebGL)**:
   - **Ay (The Moon)**: Sessizlik Denizi, Fırtınalar Okyanusu, Fra Mauro, Hadley Rille, Descartes Yaylaları, Taurus-Littrow ve kutup kraterleri.
   - **Mars (Kızıl Gezegen)**: Chryse Planitia, Ares Vallis, Gusev Krateri, Meridiani Planum, Vastitas Borealis, Gale Krateri, Elysium Planitia ve Jezero Krateri.
   - Çevrimdışı ve CORS hatasız çalışan, kraterleri ve bazalt denizlerini dinamik üreten yüksek çözünürlüklü prosedürel yüzey ve kabartma (bump) haritaları.
   - Gerçek eksen eğiklikleri (Mars ~25.2°, Ay ~1.5°), atmosferik ışık saçılması (Mars'ın turuncu korona parıltısı), 6.000 parçacıklı Samanyolu yıldız tarlası ve dinamik Güneş ışıklandırması.

2. **Tarihi Kalıntılar & Etkileşimli Radar İşaretçileri (Beacons)**:
   - Gerçek enlem/boylam koordinatlarına göre küre üzerine yerleştirilmiş, radyal darbe halkaları (pulse wave) yayan 3D ışıklı işaretçiler.
   - İşaretçiye tıklandığında kameranın pürüzsüz bir şekilde yüzeydeki o noktaya doğru sinematik uçuşu (`OrbitControls` yumuşak kamera geçişi).

3. **3D Holografik Mini-Görüntüleyici (Mini-Model Viewport)**:
   - Hikaye çekmecesinde ilgili ekipmanın 3D minyatür rekonstrüksiyonu (Apollo İniş Kademesi, 6 tekerlekli Mars Gezgini, Ingenuity Mars Helikopteri, Sky Crane Gökyüzü Vinci veya Saturn V Roket Kademesi).

4. **Derin Tarihi Hikaye Anlatımı & Telemetri Çekmecesi**:
   - **Neden Geride Bırakıldı?**: Yörüngeye dönüş kütle hesapları, tek yönlü teknoloji gösterileri, batarya ömürleri veya kasıtlı sismik çarpışma deneyleri.
   - **Bugünkü Durumu**: Onlarca yıllık sert vakum, Güneş'in filtresiz UV ışınımı, mikrometeorit çarpmaları, Mars'ın küresel toz fırtınaları veya kutup kuru buzları altında bugünkü fiziki halleri.
   - **Terk Edilen Eşyalar Listesi**: Altın plaketler, silikon iyi niyet diskleri, lazer reflektörleri, Hasselblad kameraları, Alan Shepard'ın vurduğu golf topları, Charlie Duke'un bıraktığı aile fotoğrafı, "Fallen Astronaut" anıtı ve Eugene Shoemaker'ın küllerini taşıyan hatıra kapsülü.
   - **Telsiz & Ses Kayıtları**: Web Audio API ile sentezlenen otantik NASA Apollo *Quindar Tonu* (2525 Hz bip tonu) ve telsiz cızırtısı.

5. **Rehberli Hikaye Turu (Guided Story Tour)**:
   - "HİKAYE TURU" butonu ile Apollo 11'den başlayarak kronolojik olarak tüm tarihi bölgeleri sırayla otomatik gezdiren, kamera geçişlerini ve hikayeleri ekrana getiren etkileşimli mod.

6. **Filtreler & Arama**:
   - **Dönem Filtresi**: 1960'lar, 1970'ler, 1990'lar, 2000'ler, 2010'lar ve 2020'ler.
   - **Anında Arama**: Görev adına, ekipman türüne veya bölgeye göre anlık filtreleme ("Apollo", "Opportunity", "Golf", "Ingenuity", "Sojourner").
   - **Çift Dil Desteği (TR / EN)**: Tek tıkla Türkçe ve İngilizce arasında geçiş.

---

## 🚀 Nasıl Çalıştırılır?

Proje dizininde Python veya Node.js ile yerel sunucu başlatabilirsiniz:

### Yöntem 1: Python ile (Önerilen)
```bash
python server.py
```
*(Tarayıcınız otomatik olarak `http://localhost:8080` adresinde açılacaktır.)*

Alternatif olarak:
```bash
python -m http.server 8080
```

### Yöntem 2: Node.js ile
```bash
npx serve .
```

---

## 📁 Proje Dizin Yapısı

```
abandoned-in-space/
├── index.html          # Ana HUD ve WebGL kapsayıcı arayüzü
├── server.py           # Tek tıkla çalıştırıcı yerel Python sunucusu
├── README.md           # Proje belgelendirmesi ve tarihi arka plan
├── css/
│   └── style.css       # NASA JPL / Mission Control cam estetiği (Glassmorphism)
└── js/
    ├── data.js         # Ay ve Mars'taki NASA kalıntılarının tarihi veri tabanı
    ├── textures.js     # Yüksek kaliteli prosedürel Ay ve Mars yüzey haritası üreteci
    ├── audio.js        # Web Audio API ile Quindar tonu ve uzay ambiyansı sentezleyici
    ├── scene.js        # Three.js 3D gezegen motoru, işaretçiler ve holografik mini-model
    └── app.js          # Uygulama mantığı, rehberli tur, filtreler ve dil yönetimi
```
