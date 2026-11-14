# 🛰️ Abandoned but not Forgotten: NASA's Discarded Equipment Across the Solar System (v4.0)
### (Terk Edilmiş Ama Unutulmamış: Ay, Mars, Venüs ve Dış Gezegenlerdeki Tarihi Uzay Ekipmanları)

> **"Buradan barış ve umutla ayrılıyoruz; geri döndüğümüzde tüm insanlık için döneceğiz."** — *Gene Cernan (Apollo 17, Ay'da yürüyen son insan)*

İnsanlığın Dünya dışındaki gök cisimlerinde (**Ay, Mars, Venüs, Titan, 67P Kuyruklu Yıldızı, 433 Eros Asteroidi ve Jüpiter**) bıraktığı **25 tarihi donanımın**, iniş kademelerinin, keşif araçlarının ve bilimsel anıtların 3D interaktif haritası, **1:1 WebXR Yüzey Yürüyüşü** ve eğitici hikaye anlatımı platformu.

🔗 **Canlı Web Adresi (GitHub Pages):** [https://batuhanklcky.github.io/abandoned-in-space/](https://batuhanklcky.github.io/abandoned-in-space/)

---

## 🌟 v4.0 Öne Çıkan Özellikler & Yol Haritası Entegrasyonu

1. **🪐 4 Farklı Gök Cismi & Dış Güneş Sistemi Görevleri (25 Tarihi Görev)**:
   - **Ay (The Moon - 10 Görev)**: Surveyor 3, Apollo 11, Apollo 12, Apollo 13 S-IVB, Apollo 14, Apollo 15 (LRV), Apollo 16, Apollo 17, Lunar Prospector ve LCROSS Centaur.
   - **Mars (Kızıl Gezegen - 8 Görev)**: Viking 1, Mars Pathfinder & Sojourner, Spirit, Opportunity, Phoenix, Curiosity Sky Crane, InSight ve Perseverance & Ingenuity.
   - **Venüs (92 Bar Basınç Cehennemi - 3 Görev)**: Sovyet **Venera 7** (başka bir gezegenden ilk veri), **NASA Pioneer Venus Day Probe** (beklenmedik şekilde 67.5 dakika yüzeyden sinyal gönderen titanyum küre) ve **Venera 13** (465°C'de ilk renkli Venüs panoraması ve ses kaydı).
   - **Titan & Dış Sistem (4 Görev)**: Satürn'ün uydusu Titan'a inen **ESA/NASA Cassini-Huygens**, **67P/Churyumov-Gerasimenko** kuyruklu yıldızına inen **Rosetta & Philae**, **433 Eros** asteroidine doğaçlama inen **NEAR Shoemaker** ve Jüpiter'in 22 barlık atmosferinde buharlaşan **Galileo Atmosferik Sondası**.

2. **🥽 WebXR ile VR/AR Entegrasyonu & 1:1 Ölçekte Yüzey Yürüyüşü**:
   - Kullanıcıların **Meta Quest**, **Apple Vision Pro** (`navigator.xr` WebXR Immersive VR/AR API) veya masaüstü/mobil tarayıcıda **1.75 metre astronot göz hizasında** Apollo Ay Modülü, Venera 13, Huygens veya Mars gezginlerinin yanında **1:1 gerçek ölçekte** yürümesini sağlar.
   - `WASD` / Ok tuşları ve dokunmatik ekran D-Pad kontrolleri, fare/dokunmatik 360° vizör bakışı, gezegenin gerçek yerçekimi ivmesine (`1.62 m/s²` Ay, `3.72 m/s²` Mars, `8.87 m/s²` Venüs, `1.35 m/s²` Titan) göre çalışan `SPACE` sıçrama fiziği ve zeminde `5m / 10m / 15m` holografik ölçek halkaları.

3. **📡 Canlı Telemetri & Mars Hava Durumu (NASA MEDA / REMS)**:
   - Halen Mars'ta aktif olan **Perseverance (Jezero Krateri - MEDA)** ve **Curiosity (Gale Krateri - REMS)** gezginlerinin iniş epoch'una göre astronomik olarak hesaplanan anlık **Mars Günü (Sol)** sayacı, minimum/maksimum hava sıcaklığı, atmosfer basıncı (`Pa`), rüzgar hızı/yönü, kat edilen kilometre (`odometer`) ve **"📍 Haritada Rover Konumuna Uç"** doğrudan odaklanma özelliği.

4. **🛠️ Blender Gerektirmeyen Çok Parçalı Prosedürel PBR 3D Modeller & CAD X-Ray**:
   - Tüm uzay aracı modelleri (`Apollo LM`, `Rover`, `Ingenuity`, `Venera 13`, `Huygens`, `Philae`, `Sky Crane`, `S-IVB`, `Galileo`) harici 3D yazılıma ihtiyaç duymadan doğrudan Three.js içinde kırışık **Kapton altın folyo kabartma dokuları (`generateKaptonFoilBump`)**, fotovoltaik güneş paneli dokuları (`generateSolarPanelTexture`) ve **CAD X-Ray (Tel Kafes)** inceleme moduyla üretilmiştir.

5. **📚 Resmi NASA History Series Monografileri & Açık Veri Kaynakları**:
   - **NASA SP-2024-4559**: *Governing the Moon: A History* (Stephen S. Buono) — Artemis Accords Bölüm 9 mirası ve Ay'daki 190 tonluk antropolojik envanter.
   - **NASA SP-2026-4239**: *NASA's Discovery Program: Competitive Planetary Exploration in the 21st Century* (David W. Brown) — Mars Pathfinder, Sojourner ve NEAR Shoemaker.
   - **NASA SP-2022-4235**: *A History of Near-Earth Objects Research* (Conway, Yeomans & Rosenburg) — Eugene Shoemaker'ın Ay'daki külleri ve 433 Eros asteroidi.
   - **NASA SP-2021-4705**: *50 Years of Solar System Exploration: Historical Perspectives* (Linda Billings, ed.) — Viking, Pioneer Venus, Galileo ve Cassini-Huygens.
   - **data.nasa.gov** & **images.nasa.gov** resmi fotoğraf ve telemetri katalogları.

---

## 🚀 Nasıl Çalıştırılır?

Proje dizininde Python veya Node.js ile yerel sunucu başlatabilirsiniz:

```bash
python server.py
```
*(Tarayıcınız otomatik olarak `http://localhost:8080` adresinde açılacaktır.)*
