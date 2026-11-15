/**
 * Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment across the Solar System
 * Verified Historical Database — Enriched with NASA History Series Monographs:
 * - NASA SP-2024-4559 (Governing the Moon: A History)
 * - NASA SP-2026-4239 (NASA's Discovery Program)
 * - NASA SP-2022-4235 (A History of Near-Earth Objects Research)
 * - NASA SP-2021-4705 (50 Years of Solar System Exploration)
 */

const ARTIFACTS = [
  {
    "id": "apollo-11",
    "body": "moon",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Saturn V (SA-506) / Apollo Ay Modülü İniş Kademesi (LM-5 Eagle)",
    "craftType_en": "Saturn V (SA-506) / Apollo Lunar Module Descent Stage (LM-5 Eagle)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Apollo 11 'Kartal' İniş Kademesi & Sessizlik Denizi Kalıntıları",
    "name_en": "Apollo 11 'Eagle' Lunar Module Descent Stage & Tranquility Base Relics",
    "mission": "Apollo 11",
    "date": "20 Temmuz 1969",
    "date_en": "July 20, 1969",
    "decade": "1960",
    "category": "lander",
    "category_tr": "İniş Kademesi",
    "category_en": "Descent Stage",
    "coords": {
      "lat": 0.67408,
      "lng": 23.47297
    },
    "locationName": "Mare Tranquillitatis (Sessizlik Denizi)",
    "modelType": "lander",
    "headline_tr": "İnsanlığın Başka Bir Dünyaya İndiği Nokta: Bir Fırlatma Rampası Olarak Kalan 'Kartal'",
    "headline_en": "The Spot Where Humanity First Landed: 'Eagle' Remaining as a Launchpad",
    "quote_tr": "İnsan için küçük, insanlık için dev bir adım.",
    "quote_en": "That's one small step for man, one giant leap for mankind.",
    "quoteAuthor": "Neil Armstrong",
    "story_tr": "20 Temmuz 1969'da Neil Armstrong ve Buzz Aldrin, 'Eagle' (Kartal) Ay Modülü ile Sessizlik Denizi'ne indi. Ay yüzeyinde 21 saat 36 dakika kaldılar ve 2 saat 31 dakika süren tarihi bir yürüyüş gerçekleştirdiler.\n\nDünya'ya geri dönebilmek için Ay Modülü iki parçaya ayrılacak şekilde tasarlanmıştı: Üstte astronotların bulunduğu Yükseliş Kademesi (Ascent Stage) ve alttaki İniş Kademesi (Descent Stage). İniş kademesi, roket motoru ve altın yaldızlı iniş ayaklarıyla birlikte yüzeyde kaldı ve yükseliş kademesi için bir fırlatma platformu işlevi gördü.\n\nAyrıca astronotların Yükseliş Kademesi'ni mümkün olduğunca hafifletmesi gerekiyordu. Ay'dan topladıkları paha biçilemez 21.5 kg taş ve regolit örneğine yer açmak ve yakıt tasarrufu sağlamak için kask kameralarını, taşınabilir yaşam destek sırt çantalarını (PLSS), ay botlarını (overshoes) ve dışkı/idrar torbalarını doğrudan ay yüzeyine fırlattılar.\n\n[Resmi Kaynak Notu — NASA SP-2024-4559 \"Governing the Moon\"]: 31 Aralık 2020 tarihinde yasalaşan \"One Small Step to Protect Human Heritage in Space Act\" ve Artemis Anlaşmaları (Bölüm 9) kapsamında, Sessizlik Denizi'ndeki Apollo 11 iniş kademesi, bilimsel deney paketleri ve ayak izleri insanlığın dokunulmaz kültür mirası koruma bölgesi ilan edilmiştir.",
    "story_en": "On July 20, 1969, Neil Armstrong and Buzz Aldrin landed in the Sea of Tranquility. To return home, the Eagle Lunar Module separated into two: the Ascent Stage blasted off, using the Descent Stage and its gold-foiled landing gear as a launch platform.\n\nTo offset the weight of 21.5 kg of lunar soil and rock samples, every spare gram had to be jettisoned. The astronauts tossed their portable life-support backpacks (PLSS), overshoes, Hasselblad film cameras, and waste bags directly onto the lunar dust before sealing the hatch.\n\n[Official Monograph Citation — NASA SP-2024-4559 \"Governing the Moon\"]: Under the \"One Small Step to Protect Human Heritage in Space Act\" (2020) and Section 9 of the Artemis Accords, Tranquility Base and its discarded Apollo 11 hardware are legally designated as protected outer space heritage zones.",
    "whyAbandoned_tr": "Yörüngeye dönüş mekaniği gereği: Yükseliş kademesinin yerçekimini yenip komuta modülüyle kenetlenebilmesi için ağır iniş motoru, iniş ayakları, yakıt tankları ve fazla ekipmanlar feda edilmek zorundaydı.",
    "whyAbandoned_en": "Orbital mechanics constraint: The ascent stage needed to shed mass to escape lunar gravity and dock with Columbia. Heavy landing engines, legs, and spent tanks acted as a sacrificial launchpad.",
    "currentCondition_tr": "Ay'da rüzgar, su veya atmosferik erozyon bulunmadığı için metal iskelet ve iniş ayakları sapasağlam duruyor. Ancak 55 yılı aşkın süredir Güneş'in filtresiz morötesi (UV) ışınımı ve kozmik radyasyon nedeniyle altın yalıtım folyoları (Kapton) solmuş ve mikrometeorit çarpmalarıyla delinmiş durumda.",
    "currentCondition_en": "With no atmospheric erosion or wind, the structural frame and footpads remain intact. However, 55+ years of intense solar UV and cosmic rays have bleached the gold Kapton foil, accompanied by microscopic micrometeorite pitting.",
    "discardedItems": [
      "Apollo 11 İniş Kademesi (LM-5 Descent Stage)",
      "Lazer Yansıtıcı Aynası (LRRR - Lazerle Dünya-Ay mesafesini hala ölçüyor)",
      "Pasif Sismik Deney Paketi (PSEP)",
      "Tarihi Bronz Hatıra Plaketi ('Biz tüm insanlık adına barış için geldik')",
      "73 dünya liderinin iyi niyet mesajlarını taşıyan mikroskobik silikon disk",
      "Neil Armstrong ve Buzz Aldrin'in Ay Botları ve Yaşam Destek Çantaları",
      "Hasselblad 70mm Yüzey Kamerası",
      "Altın Barış Zeytin Dalı İğnesi"
    ],
    "technicalSpecs": {
      "massLeftKg": "2,034 kg (kuru iniş kademesi) + ~150 kg ekipman",
      "powerSource": "Gümüş-Çinko Pilleri (tükendi)",
      "activeDuration": "21 saat 36 dakika yüzey kalışı",
      "coordinatesReadable": "0°40'26.69\" K, 23°28'22.69\" D"
    },
    "audioSnippet": "Houston, Tranquility Base here. The Eagle has landed.",
    "realPhotos": [
      {
        "title_tr": "LROC Uydusundan Apollo 11 İniş Alanı (Gölge & Ayak İzleri)",
        "title_en": "LROC Satellite View of Apollo 11 Site (Shadow & Paths)",
        "catalogId": "NASA PIA12909 / LROC NAC",
        "instrument": "Lunar Reconnaissance Orbiter (0.5m/piksel)",
        "url": "assets/photos/apollo11_lroc.jpg",
        "desc_tr": "Ay yörüngesindeki LRO uydusundan çekilen bu fotoğrafta 'Kartal' iniş kademesi, döktüğü gölgesi ve astronotların ALSEP deney alanına doğru yürürken bıraktığı koyu ayak izi patikaları açıkça görülmektedir.",
        "desc_en": "Orbital view showing the Eagle descent stage, its cast shadow, and dark astronaut walking trails toward the ALSEP."
      },
      {
        "title_tr": "Buzz Aldrin ve Sessizlik Denizi'ndeki Ay Modülü",
        "title_en": "Buzz Aldrin & Lunar Module in Sea of Tranquility",
        "catalogId": "NASA AS11-40-5927",
        "instrument": "Hasselblad 70mm EVA Yüzey Kamerası",
        "url": "assets/photos/apollo11_aldrin.jpg",
        "desc_tr": "Neil Armstrong'un vizör yansımasında görüldüğü tarihi karede Buzz Aldrin ve arkasında geride bırakılan altın Mylar folyo kaplı İniş Kademesi yer almaktadır.",
        "desc_en": "Iconic photo by Neil Armstrong showing Buzz Aldrin with the gold Mylar-wrapped descent stage in the background."
      },
      {
        "title_tr": "Ay Yüzeyindeki İlk İnsan Bot İzi",
        "title_en": "The Iconic Lunar Bootprint",
        "catalogId": "NASA AS11-40-5877",
        "instrument": "Hasselblad 70mm Yüzey Kamerası",
        "url": "assets/photos/apollo11_bootprint.jpg",
        "desc_tr": "Ay regolitinin mikroskobik tutunma özelliklerini test etmek için çekilen ve insanlığın başka bir dünyadaki ayak izini simgeleyen ünlü kare.",
        "desc_en": "Captured to assess lunar soil cohesion, becoming an enduring symbol of humanity on another world."
      }
    ],
    "secretRelic": {
      "badge_tr": "🕊️ GİZLİ TARİHİ ESER: 73 DÜNYA LİDERİNİN MİKRODİSKİ & ALTIN ZEYTİN DALI",
      "badge_en": "🕊️ SECRET RELIC: 73 WORLD LEADERS' MICRO-DISK & GOLD OLIVE BRANCH",
      "title_tr": "Ay Tozuna Bırakılan Küresel Barış Mesajı",
      "title_en": "A Global Message of Peace Preserved in the Dust",
      "desc_tr": "Neil Armstrong ve Buzz Aldrin, madeni para büyüklüğünde silikon bir mikrodiks bıraktı. İçinde Türkiye Cumhurbaşkanı Cevdet Sunay dahil 73 dünya liderinin iyi niyet mesajları mikroskobik olarak kazınmıştır. Yanında ise barışın sembolü olarak som altından minyatür bir zeytin dalı iğnesi yer almaktadır.",
      "desc_en": "Armstrong and Aldrin placed a silicon micro-disk etched with goodwill messages from 73 world leaders alongside a solid gold olive branch pin as an eternal symbol of peace."
    },
    "locationName_en": "Mare Tranquillitatis (Sea of Tranquility)",
    "discardedItems_en": [
      "Apollo 11 Lunar Module Descent Stage (LM-5 'Eagle')",
      "Laser Ranging Retroreflector (LRRR - still measuring Earth-Moon distance via laser)",
      "Passive Seismic Experiment Package (PSEP)",
      "Historic Bronze Commemorative Plaque ('Here Men From The Planet Earth First Set Foot Upon The Moon...')",
      "Microscopic Silicon Disk with Goodwill Messages from 73 World Leaders",
      "Neil Armstrong & Buzz Aldrin's Lunar Overshoes and Portable Life Support Systems (PLSS)",
      "Hasselblad 500EL 70mm Lunar Surface Data Camera",
      "Gold Olive Branch Pin (Symbol of Peace)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "2,034 kg (dry descent stage) + ~150 kg equipment",
      "powerSource": "Silver-Zinc Batteries (depleted)",
      "activeDuration": "21 hours 36 minutes surface stay",
      "coordinatesReadable": "0°40'26.69\" N, 23°28'22.69\" E"
    }
  },
  {
    "id": "apollo-12-surveyor",
    "body": "moon",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ (ÇİFTE KEŞİF)",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING (DUAL EXPLORATION)",
    "craftType_tr": "Saturn V (SA-507) / LM-6 Intrepid & Atlas-Centaur / Surveyor 3",
    "craftType_en": "Saturn V (SA-507) / LM-6 Intrepid & Atlas-Centaur / Surveyor 3",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Apollo 12 & Surveyor 3: Başka Bir Dünyadaki İlk Arkeolojik Ziyaret",
    "name_en": "Apollo 12 & Surveyor 3: The First Extraterrestrial Archaeology",
    "mission": "Apollo 12 / Surveyor 3",
    "date": "19 Kasım 1969",
    "date_en": "November 19, 1969",
    "decade": "1960",
    "category": "lander",
    "category_tr": "İniş Kademesi & Robotik Sonda",
    "category_en": "Descent Stage & Robotic Probe",
    "coords": {
      "lat": -3.01239,
      "lng": -23.42157
    },
    "locationName": "Oceanus Procellarum (Fırtınalar Okyanusu)",
    "modelType": "lander",
    "headline_tr": "İki Farklı Görevin Ay Yüzeyinde Sessizce Birbirine Baktığı Krater",
    "headline_en": "A Crater Where Two Different Space Missions Silently Face Each Other",
    "quote_tr": "Aman Tanrım! Neil için küçük olabilir ama benim için epey büyük bir adım oldu!",
    "quote_en": "Whoopee! Man, that may have been a small one for Neil, but that's a long one for me!",
    "quoteAuthor": "Pete Conrad (Merdivenden inerken)",
    "story_tr": "Apollo 12 astronotları Pete Conrad ve Alan Bean, tarihin en inanılmaz hedef vuruşlarından birini gerçekleştirdi: Nisan 1967'de Ay'a inmiş olan insansız Surveyor 3 uzay aracından sadece 160 metre uzağa kondular.\n\nAstronotlar kratere yürüyerek Surveyor 3'e ulaştılar. Bir insanın başka bir dünyada önceden bırakılmış bir robotik cihazı incelediği ilk an buydu! Surveyor 3'ün TV kamerasını ve toprak kepçesini aletlerle keserek Dünya'ya geri getirdiler. Amaç, 2.5 yıl boyunca Ay'ın aşırı sıcaklıklarına ve radyasyonuna maruz kalan malzemelerin ne kadar yıprandığını laboratuvarda incelemekti.\n\nBugün Fırtınalar Okyanusu'nda hem Surveyor 3'ün geriye kalan üç ayaklı gövdesi, hem de Apollo 12'nin 'Intrepid' iniş kademesi yan yana bir açık hava uzay müzesi gibi yatmaktadır.",
    "story_en": "Apollo 12 achieved a pinpoint landing just 160 meters from Surveyor 3, an uncrewed lander that arrived in 1967. Conrad and Bean walked up to Surveyor 3—the first extraterrestrial archaeological examination in history. They retrieved its TV camera to analyze long-term lunar exposure on Earth. Both spacecraft still stand silently in Oceanus Procellarum.",
    "whyAbandoned_tr": "Surveyor 3 görev süresi bitince terk edilmişti; Apollo 12 iniş kademesi ise yükseliş aşamasının fırlatılması için platform olarak bırakıldı.",
    "whyAbandoned_en": "Surveyor 3 was a one-way robotic test; Apollo 12's descent stage served as the launch platform for the homeward-bound ascent module.",
    "currentCondition_tr": "Surveyor 3 kesilmiş kabloları ve eksik kamerasıyla krater yamacında eğik durmaktadır. Apollo 12'nin iniş motoru egzozunun savurduğu kum zerrelerinin Surveyor gövdesinde yarattığı mikro-kumlanma izleri korunmaktadır.",
    "currentCondition_en": "Surveyor 3 rests at an angle on the crater rim with its severed camera cabling. Sandblasting pits from Apollo 12's descent engine plume remain preserved on Surveyor's surface.",
    "discardedItems": [
      "Apollo 12 'Intrepid' İniş Kademesi",
      "Surveyor 3 İnsansız İniş Aracı Gövdesi",
      "SNAP-27 Plütonyum Radyoizotop Termoelektrik Jeneratörü (RTG)",
      "ALSEP Bilimsel Deney İstasyonu",
      "Güneş Rüzgarı Bileşimi Deneyi folyosu"
    ],
    "technicalSpecs": {
      "massLeftKg": "~2,211 kg Apollo 12 + ~280 kg Surveyor 3",
      "powerSource": "Nükleer RTG (Plütonyum-238) & Güneş Panelleri",
      "activeDuration": "Apollo: 31.5 saat yüzey; Surveyor: 65 gün",
      "coordinatesReadable": "3°0'44\" G, 23°25'17\" B"
    },
    "audioSnippet": "Conrad: 'We're right on the edge of the surveyor crater, Houston!'",
    "realPhotos": [
      {
        "title_tr": "Pete Conrad ve Surveyor 3 İnsansız Sondası",
        "title_en": "Pete Conrad Inspecting Surveyor 3",
        "catalogId": "NASA AS12-48-7133",
        "instrument": "Hasselblad 70mm Yüzey Kamerası",
        "url": "assets/photos/apollo12_surveyor.jpg",
        "desc_tr": "Tarihin ilk dünya dışı arkeolojik incelemesi: Pete Conrad, 2.5 yıl önce Ay'a inmiş olan insansız Surveyor 3'ü inceliyor. Ufukta Apollo 12 Ay Modülü Intrepid görülüyor.",
        "desc_en": "History's first extraterrestrial archaeology: Pete Conrad inspects the Surveyor 3 robot with the Apollo 12 LM on the horizon."
      }
    ],
    "secretRelic": {
      "badge_tr": "🔬 DÜNYA'YA GETİRİLEN ROBOT PARÇASI: SURVEYOR KAMERASI",
      "badge_en": "🔬 RETRIEVED HARDWARE: SURVEYOR 3 TV CAMERA",
      "title_tr": "Uzayda 2.5 Yıl Kalan Malzemelerin Analizi",
      "title_en": "First Analysis of Long-Term Space Exposure",
      "desc_tr": "Astronotlar özel aletlerle Surveyor 3'ün TV kamerasını ve kablolarını keserek Dünya'ya getirdi. Yapılan biyolojik incelemelerde, montaj sırasında cihaza bulaşan bir bakterinin Ay vakumunda ve dondurucu soğuğunda 2.5 yıl boyunca spor halinde hayatta kalmış olabileceği keşfedildi.",
      "desc_en": "Astronauts severed Surveyor 3's optical camera to study material fatigue on Earth, offering the first clues on how equipment endures the harsh lunar environment."
    },
    "locationName_en": "Oceanus Procellarum (Ocean of Storms)",
    "discardedItems_en": [
      "Apollo 12 'Intrepid' Lunar Module Descent Stage",
      "Surveyor 3 Unmanned Lander Structure (First extraterrestrial archaeology subject)",
      "Surveyor 3 TV Camera, Soil Sampler Scoop, and Tubing (Retrieved by Conrad & Bean for Earth lab analysis)",
      "Apollo 12 ALSEP Central Station (SNAP-27 RTG)",
      "Lunar Surface Magnetometer (LSM)",
      "Solar Wind Spectrometer Experiment (SWS)",
      "Astronaut PLSS Backpacks, Lunar Boots, and Urine Collection Assemblies"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "~2,211 kg Apollo 12 + ~280 kg Surveyor 3",
      "powerSource": "Nuclear RTG (Plutonium-238) & Solar Panels",
      "activeDuration": "Apollo: 31.5 hrs surface; Surveyor: 65 days",
      "coordinatesReadable": "3°0'44\" S, 23°25'17\" W"
    }
  },
  {
    "id": "apollo-13-s4b",
    "body": "moon",
    "landingStatus": "crashed",
    "landingStatus_tr": "KİNETİK ÇARPIŞMA / KAZA SAHASI",
    "landingStatus_en": "KINETIC IMPACT / CRASH SITE",
    "craftType_tr": "Saturn V (SA-508) S-IVB Üçüncü Roket Kademesi (Kinetik Çarpıştırıcı)",
    "craftType_en": "Saturn V (SA-508) S-IVB Third Rocket Stage (Kinetic Impactor)",
    "vrAllowed": false,
    "vrDisallowReason_tr": "Apollo 13 S-IVB Saturn V roket kademesi 2.58 km/s (9.288 km/s) hızla Ay yüzeyine çarparak 30 metrelik bir krater açmıştır. Bu bir kinetik kaza/çarpışma alanı olduğu ve yüzeye iniş yapılmadığı için 1:1 VR yüzey yürüyüşü engellenmiştir.",
    "vrDisallowReason_en": "The Apollo 13 Saturn V S-IVB booster slammed into the lunar surface at 2.58 km/s (9,288 km/h), excavating a 30m crater. Because this was a destructive kinetic impact with no soft landing, 1:1 VR surface walk is disabled.",
    "name_tr": "Apollo 13 S-IVB Saturn V Roket Kademesi Çarpma Krateri",
    "name_en": "Apollo 13 S-IVB Saturn V Third Stage Impact Site",
    "mission": "Apollo 13",
    "date": "14 Nisan 1970",
    "date_en": "April 14, 1970",
    "decade": "1970",
    "category": "impact",
    "category_tr": "Çarpma Sondası / Roket Kademesi",
    "category_en": "Impact Probe / Rocket Stage",
    "coords": {
      "lat": -2.75,
      "lng": -27.83
    },
    "locationName": "Fırtınalar Okyanusu Güneyi",
    "modelType": "stage",
    "headline_tr": "Ay'ı Bir Çan Gibi Üç Saat Boyunca Çaldıran Devasa Roket Enkazı",
    "headline_en": "The Giant Rocket Stage That Made the Moon 'Ring Like a Bell' for 3 Hours",
    "quote_tr": "Ay bir çan gibi çınladı; iç yapısı tahminimizden çok daha sert ve kuru olmalı.",
    "quote_en": "The Moon rang like a bell; its interior must be much more rigid and dry than expected.",
    "quoteAuthor": "Dr. Maurice Ewing (Apollo Sismoloji Ekip Lideri)",
    "story_tr": "Apollo 13 uzay aracında oksijen tankı patlayıp mürettebat ölüm kalım savaşı verirken, onları Ay'a doğru fırlatan devasa Saturn V roketinin 3. kademesi (S-IVB) önceden programlandığı rotada ilerlemeye devam etti.\n\n14 ton ağırlığındaki bu dev roket gövdesi, saatte 9.200 km (2.58 km/s) hızla doğrudan Ay yüzeyine çakıldı. Çarpmanın kinetik enerjisi yaklaşık 11 ton TNT patlayıcıya eşitti ve 30 metre çapında taze bir krater açtı.\n\nBu kasıtlı bir deneydi: 137 km ötedeki Apollo 12 sismometresi çarpışma dalgalarını kaydetti. Ay'ın iç yapısı sıvı barındırmadığı ve tamamen kuru kayaçlardan oluştuğu için şok dalgaları tam 3 saat 20 dakika boyunca sönümlenmeden yankılandı.",
    "story_en": "While the crew was fighting for survival after the oxygen tank explosion, the 14-ton Saturn V third stage (S-IVB) slammed into the lunar surface at 9,200 km/h as planned. The impact created a 30m crater. Apollo 12's seismometer detected the shockwaves: because the Moon lacks water and volatile dampening layers, the entire lunar crust reverberated for over 3 hours!",
    "whyAbandoned_tr": "Ay'ın iç tabakalarını (kabuk ve manto kalınlığını) sismik olarak haritalamak amacıyla kasıtlı kinetik darbe hedefi olarak fırlatıldı.",
    "whyAbandoned_en": "Deliberately crashed as a kinetic impactor to trigger seismic vibrations, measuring lunar mantle and crust thickness.",
    "currentCondition_tr": "Roket kademesi kinetik darbeyle tamamen buharlaşmış ve parçalanmıştır. 30 metre genişliğinde parlak püskürük desenli (ejecta) bir krater olarak mevcudiyetini korur.",
    "currentCondition_en": "The rocket stage was pulverized upon impact. A sharp 30-meter crater with radiant white ejecta rays marks its final resting place.",
    "discardedItems": [
      "Saturn V S-IVB-508 Roket Kademesi Kalıntıları",
      "J-2 Sıvı Hidrojen/Oksijen Roket Motoru Parçaları",
      "Enstrümantasyon Ünitesi (IU) Elektronikleri"
    ],
    "technicalSpecs": {
      "massLeftKg": "13,925 kg (boş roket kademesi)",
      "powerSource": "Yok (Kinetik darbe)",
      "activeDuration": "Çarpma anı: 14 Nisan 1970 01:09 UTC",
      "coordinatesReadable": "2°45' G, 27°50' B"
    },
    "audioSnippet": "[Apollo 12 Seismometer Telemetry Tone Spike]",
    "realPhotos": [
      {
        "title_tr": "Apollo 13 Hasarlı Servis Modülü",
        "title_en": "Damaged Apollo 13 Service Module",
        "catalogId": "NASA AS13-59-8562",
        "instrument": "Hasselblad 70mm",
        "url": "assets/photos/apollo13_sm.jpg",
        "desc_tr": "Oksijen tankı patlamasından sonra ayrılan Servis Modülü'nün dış panelindeki devasa patlama yarığı. Bu esnada 14 tonluk roket kademesi Ay'a doğru son hızla ilerliyordu.",
        "desc_en": "Severe panel blowout damage on the Apollo 13 service module, captured as the S-IVB booster was diving toward lunar impact."
      }
    ],
    "secretRelic": {
      "badge_tr": "🔔 SİSMİK EFSANE: AY'IN BİR ÇAN GİBİ ÇINLAMASI",
      "badge_en": "🔔 SEISMIC PHENOMENON: THE MOON RINGING LIKE A BELL",
      "title_tr": "3 Saat 20 Dakika Boyunca Dinmeyen Yankı",
      "title_en": "A Reverberation That Lasted Over 3 Hours",
      "desc_tr": "14 tonluk dev roket gövdesi saatte 9.200 km hızla Ay'a çarptığında, 137 km uzaktaki sismometre tam 3 saat 20 dakika boyunca kesintisiz titreşim kaydetti. Bilim insanları Ay'ın iç yapısının kuru ve katı olduğunu bu çarpışma sayesinde öğrendi.",
      "desc_en": "The impact of the 14-ton rocket stage caused the Moon's dry, rigid lithosphere to vibrate for 3 hours and 20 minutes, proving the lunar interior lacks water-dampening mantle layers."
    },
    "locationName_en": "Southern Oceanus Procellarum",
    "discardedItems_en": [
      "Saturn V S-IVB-508 Third Rocket Stage Debris",
      "J-2 Liquid Hydrogen/Liquid Oxygen Rocket Engine Remains",
      "Instrument Unit (IU) Avionics Ring Fragments",
      "Auxiliary Propulsion System (APS) Module Debris",
      "30-Meter Impact Crater Formed by 13.9-Ton Kinetic Strike"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "13,925 kg (empty booster stage)",
      "powerSource": "None (Kinetic Impact)",
      "activeDuration": "Impact timestamp: April 14, 1970 01:09 UTC",
      "coordinatesReadable": "2°45' S, 27°50' W"
    }
  },
  {
    "id": "apollo-14-fra-mauro",
    "body": "moon",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Saturn V (SA-509) / Apollo Ay Modülü İniş Kademesi (LM-8 Antares) + MET El Arabası",
    "craftType_en": "Saturn V (SA-509) / Apollo Lunar Module Descent Stage (LM-8 Antares) + MET Handcart",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Apollo 14 'Antares' & Ay'ın İlk El Arabası (MET)",
    "name_en": "Apollo 14 'Antares' & The Lunar Wheelbarrow (MET)",
    "mission": "Apollo 14",
    "date": "5 Şubat 1971",
    "date_en": "February 5, 1971",
    "decade": "1970",
    "category": "lander",
    "category_tr": "İniş Kademesi & El Arabası",
    "category_en": "Descent Stage & Modular Transporter",
    "coords": {
      "lat": -3.6453,
      "lng": -17.47136
    },
    "locationName": "Fra Mauro Tepeleri",
    "modelType": "lander",
    "headline_tr": "Alan Shepard'ın Ay'da Vurduğu İki Golf Topu ve 'Ay El Arabası'",
    "headline_en": "Alan Shepard's Two Golf Balls and the 'Lunar Rickshaw'",
    "quote_tr": "Millerce, millercesine ve millercesine gitti!",
    "quote_en": "Miles and miles and miles!",
    "quoteAuthor": "Alan Shepard (Golf topuna vurduktan sonra)",
    "story_tr": "Apollo 14, Apollo 13 faciasından sonra Ay'a yapılan ilk başarılı dönüş seferiydi. Alan Shepard ve Edgar Mitchell, Fra Mauro'nun engebeli tepelerine indi. Henüz Ay Arazi Aracı (Rover) icat edilmediği için NASA mühendisleri 'Modular Equipment Transporter' (MET) adında iki tekerlekli çekçek benzeri bir el arabası tasarlamıştı.\n\nAstronotlar ağır taş örneklerini ve kameraları bu el arabasına yükleyip engebeli krater yamaçlarında kan ter içinde çekmek zorunda kaldılar. Görevin sonunda Alan Shepard, gizlice yanında getirdiği 6 demir golf sopası başlığını acil durum numune toplama çubuğuna taktı ve iki adet golf topuna vurdu.\n\nToplardan biri krater çukuruna düşerken diğeri düşük yerçekimi nedeniyle yüzlerce metre uzağa fırladı. Hem golf topları, hem el arabası hem de 'Antares' iniş kademesi hala oradadır.",
    "story_en": "Shepard and Mitchell landed in Fra Mauro. Lacking an electric rover, they pulled the Modular Equipment Transporter (MET)—nicknamed the lunar wheelbarrow—up steep crater inclines. Before leaving, Shepard famously pulled out a modified six-iron club and struck two golf balls into the lunar vacuum. Both balls and the MET remain at Fra Mauro.",
    "whyAbandoned_tr": "MET el arabasının ve iniş donanımının Dünya'ya dönüş kabininde taşınması gereksiz ağırlık yaratacağı için görev bitiminde terk edildi.",
    "whyAbandoned_en": "The MET wheelbarrow and landing stage had no flight purpose for ascent and were discarded to preserve payload margins.",
    "currentCondition_tr": "Kauçuk tekerlekli MET arabası ve iniş kademesi Fra Mauro'nun ince tozunda 50 yıldır bozulmadan durmaktadır. Ay topları LRO uydusu tarafından yüksek çözünürlükle tespit edilmiştir.",
    "currentCondition_en": "The MET cart with its specialized rubber tires stands undisturbed. Modern LRO orbiter imagery can still resolve the landing stage and disturbed dust tracks.",
    "discardedItems": [
      "Apollo 14 İniş Kademesi",
      "Modular Equipment Transporter (MET El Arabası)",
      "2 Adet Wilson Golf Topu",
      "Aktif Sismik Deney Havanı (Thumper/Mortar)",
      "Apollo Lazer Reflektörü (LRRR)"
    ],
    "technicalSpecs": {
      "massLeftKg": "2,144 kg iniş donanımı + 25 kg MET",
      "powerSource": "SNAP-27 RTG Nükleer Jeneratör",
      "activeDuration": "33 saat 31 dakika yüzey kalışı",
      "coordinatesReadable": "3°38'43\" G, 17°28'17\" B"
    },
    "audioSnippet": "Shepard: 'Here's another one... miles and miles and miles!'",
    "realPhotos": [
      {
        "title_tr": "Fra Mauro Düzlüğünde Apollo 14 İniş Kademesi",
        "title_en": "Apollo 14 Lunar Module at Fra Mauro",
        "catalogId": "NASA AS14-66-9306",
        "instrument": "Hasselblad 70mm Yüzey Kamerası",
        "url": "assets/photos/apollo14_lm.jpg",
        "desc_tr": "Antares iniş kademesi, arka planda engebeli Fra Mauro krater tepeleriyle birlikte.",
        "desc_en": "Antares descent stage with the steep slopes of Fra Mauro rising toward Cone Crater in the background."
      }
    ],
    "secretRelic": {
      "badge_tr": "🏌️ EFSANEVİ ESER: ALAN SHEPARD'IN AY GOLF TOPLARI",
      "badge_en": "🏌️ LEGENDARY RELIC: ALAN SHEPARD'S MOON GOLF BALLS",
      "title_tr": "İnsanlığın Başka Bir Dünyadaki İlk Golf Vuruşu",
      "title_en": "The First Golf Drive on Another World",
      "desc_tr": "Komutan Alan Shepard, çorabının içine saklayarak getirdiği Wilson 6 demir golf sopası ucunu acil durum numune çubuğuna taktı. İki beyaz golf topuna vurdu. İkinci top Ay'ın 1/6 yerçekiminde yüzlerce metre öteye fırladı. Shepard telsizden 'Millerce, millercesine gitti!' diye bağırdı. O 2 golf topu bugün hala Fra Mauro'da yatmaktadır.",
      "desc_en": "Shepard fastened a 6-iron clubhead smuggled in his sock onto an extension handle. Swinging one-handed in his spacesuit, he drove two golf balls into the vacuum, exclaiming 'Miles and miles and miles!' Both balls still lie in Fra Mauro's soil."
    },
    "locationName_en": "Fra Mauro Highlands",
    "discardedItems_en": [
      "Apollo 14 Lunar Module Descent Stage ('Antares')",
      "Modular Equipment Transporter (MET - The 'Lunar Wheelbarrow')",
      "Two Wilson Sporting Goods Golf Balls (Struck by Alan Shepard with improvised 6-iron)",
      "Apollo 14 ALSEP Science Station (Active Seismic Experiment, Suprathermal Ion Detector)",
      "Cone Crater Geological Sampling Trench Tools",
      "PLSS Backpacks, Lunar Overshoes, and Equipment Jettison Pallet"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "2,144 kg descent hardware + 25 kg MET",
      "powerSource": "SNAP-27 RTG Nuclear Generator",
      "activeDuration": "33 hours 31 minutes surface stay",
      "coordinatesReadable": "3°38'43\" S, 17°28'17\" W"
    }
  },
  {
    "id": "apollo-15-hadley",
    "body": "moon",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Saturn V (SA-510) / Apollo Ay Modülü (LM-10 Falcon) + Ay Taşıtı (LRV-001)",
    "craftType_en": "Saturn V (SA-510) / Apollo Lunar Module (LM-10 Falcon) + Lunar Roving Vehicle (LRV-001)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Apollo 15 'Falcon' & 1 Numaralı Ay Arazi Aracı (LRV-001)",
    "name_en": "Apollo 15 'Falcon' & The First Lunar Roving Vehicle (LRV-001)",
    "mission": "Apollo 15",
    "date": "30 Temmuz 1971",
    "date_en": "July 30, 1971",
    "decade": "1970",
    "category": "rover",
    "category_tr": "Arazi Aracı (Rover) & İniş Kademesi",
    "category_en": "Roving Vehicle & Descent Stage",
    "coords": {
      "lat": 26.1322,
      "lng": 3.63386
    },
    "locationName": "Hadley Rille (Apennine Dağları)",
    "modelType": "rover",
    "headline_tr": "İlk Elektrikli Ay Arabası, Düşen Astronot Heykeli ve Galileo Çekiç Deneyi",
    "headline_en": "The First Electric Moon Buggy, The Fallen Astronaut Memorial, and Galileo's Hammer",
    "quote_tr": "Bay Galileo'nun haklı olduğunu kanıtladık: Vakumda bir çekiç ile şahin tüyü aynı anda yere düşer.",
    "quote_en": "Mr. Galileo was correct: In a vacuum, a hammer and a feather hit the ground simultaneously.",
    "quoteAuthor": "David Scott (Apollo 15 Komutanı)",
    "story_tr": "Apollo 15, Ay keşfinde devrim yaratan 'J-görevleri' serisinin ilkiydi. Astronotlar David Scott ve James Irwin, yanlarında katlanabilir elektrikli bir araba (Lunar Roving Vehicle - LRV-001) götürdüler. Bu araba sayesinde 27.9 kilometre yol kat ettiler ve derin Hadley Vadisi'nin kenarına kadar ulaştılar.\n\nScott, görevin sonunda LRV'yi iniş kademesinden 300 metre uzağa park etti ve aracın üzerindeki TV kamerasını yükseliş kalkışını canlı yayında çekecek şekilde ayarladı.\n\nBurada iki tarihi an daha yaşandı: Scott, vakumda tüy ile çekicin aynı anda düştüğünü gösteren Galileo deneyini yaptı ve tüy ile çekici yerde bıraktı. Ayrıca uzay yarışında hayatını kaybeden 14 Sovyet kozmonotu ve Amerikan astronotunu anmak için 8.5 cm'lik alüminyum bir heykelcik olan 'Düşen Astronot' (Fallen Astronaut) ve yanındaki isim plaketini ay tozuna dikti.",
    "story_en": "Apollo 15 deployed the first Lunar Roving Vehicle (LRV-001), traveling 27.9 km across Hadley Rille. Commander David Scott famously dropped a falcon feather and an aluminum geological hammer simultaneously, verifying Galileo's law of falling bodies. Before leaving, he placed 'Fallen Astronaut'—an 8.5 cm aluminum figurine commemorating 14 US and Soviet space travelers who lost their lives—along with a memorial plaque.",
    "whyAbandoned_tr": "Elektrikli araba katlanıp fırlatılamazdı; görevi bittikten sonra kalkışı görüntülemek için kalıcı bir gözlem istasyonu olarak bırakıldı.",
    "whyAbandoned_en": "The 210 kg rover had completed its mission and lacked the ability to be reloaded into the ascent module; its camera televised the liftoff.",
    "currentCondition_tr": "LRV-001 tekerlekleri tel örgülü çinko kaplamasıyla hala park edildiği yerde duruyor. Düşen Astronot heykelciği ve Galileo'nun tüyü ile çekici Hadley Rille manzarasında dokunulmamış halde bekliyor.",
    "currentCondition_en": "LRV-001 rests where parked, its woven mesh tires intact. The Fallen Astronaut statuette, plaque, hammer, and feather remain in the dust of the Apennines.",
    "discardedItems": [
      "Apollo 15 'Falcon' İniş Kademesi",
      "Lunar Roving Vehicle #1 (İlk Ay Arabası)",
      "'Düşen Astronot' (Fallen Astronaut) Alüminyum Heykelciği ve Anıt Plaketi",
      "Galileo Deneyi Şahin Tüyü ve Jeolog Çekici",
      "Genesis Rock (Yaratılış Taşı) çıkarma ekipmanları",
      "Sub-uydu Fırlatıcı Mekanizması"
    ],
    "technicalSpecs": {
      "massLeftKg": "2,809 kg iniş kademesi + 210 kg LRV",
      "powerSource": "LRV Gümüş-Çinko Potasyum Hidroksit Pilleri (36V)",
      "activeDuration": "66 saat 55 dakika yüzey kalışı",
      "coordinatesReadable": "26°7'56\" K, 3°38'2\" D"
    },
    "audioSnippet": "Scott: 'How about that, Mr. Galileo was correct in his findings!'",
    "realPhotos": [
      {
        "title_tr": "Düşen Astronot (Fallen Astronaut) Anıt Plaketi",
        "title_en": "Fallen Astronaut Memorial Plaque",
        "catalogId": "NASA AS15-88-11894",
        "instrument": "Hasselblad 70mm Yüzey Kamerası",
        "url": "assets/photos/apollo15_plaque.jpg",
        "desc_tr": "David Scott tarafından Hadley Rille toprağına dikilen 8.5 cm'lik alüminyum heykelcik ve uzay yarışında hayatını kaybeden 14 kozmonot ve astronotun isimlerinin yer aldığı anıt plaketi.",
        "desc_en": "The 8.5 cm aluminum figurine and commemorative plaque placed by David Scott to honor 14 fallen US and Soviet space explorers."
      }
    ],
    "secretRelic": {
      "badge_tr": "🕊️ AY'DAKİ TEK RESMİ SANAT ESERİ: 'FALLEN ASTRONAUT'",
      "badge_en": "🕊️ SOLE EXTRATERRESTRIAL ART: 'FALLEN ASTRONAUT'",
      "title_tr": "Soğuk Savaş Sırasında Bırakılan Barış Heykeli",
      "title_en": "A Cold-War Monument to Shared Human Sacrifice",
      "desc_tr": "Belçikalı heykeltıraş Paul Van Hoeydonck tarafından yapılan bu heykel, hiçbir milliyet veya ırk belirtmeyen nötr bir astronot figürüdür. Plakette hem Amerikalı (Grissom, Chaffee vb.) hem de Sovyet (Yuri Gagarin, Vladimir Komarov vb.) uzay kahramanlarının isimleri yan yana yazılıdır.",
      "desc_en": "Sculpted without gender or nationality markers by Paul Van Hoeydonck, this monument honors fallen astronauts and cosmonauts side-by-side, standing as the only artwork placed on another celestial body."
    },
    "locationName_en": "Hadley Rille (Apennine Mountains)",
    "discardedItems_en": [
      "Apollo 15 Lunar Module Descent Stage ('Falcon')",
      "Lunar Roving Vehicle #1 (LRV-001 - The First Moon Buggy, driven 27.8 km)",
      "'Fallen Astronaut' Aluminum Figurine and Commemorative Memorial Plaque",
      "Apollo 15 ALSEP Nuclear Science Package and Heat Flow Probes",
      "Lunar Surface Drill Stems and Core Sample Bit",
      "Galileo Gravity Demonstration Hammer and Falcon Feather Impact Site"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "2,809 kg descent stage + 210 kg LRV",
      "powerSource": "LRV Silver-Zinc Potassium Hydroxide Batteries (36V)",
      "activeDuration": "66 hours 55 minutes surface stay",
      "coordinatesReadable": "26°7'56\" N, 3°38'2\" E"
    }
  },
  {
    "id": "apollo-16-descartes",
    "body": "moon",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Saturn V (SA-511) / Apollo Ay Modülü (LM-11 Orion) + Ay Taşıtı (LRV-002)",
    "craftType_en": "Saturn V (SA-511) / Apollo Lunar Module (LM-11 Orion) + Lunar Roving Vehicle (LRV-002)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Apollo 16 'Orion' & Ay'daki Aile Fotoğrafı",
    "name_en": "Apollo 16 'Orion' & The Family Photo Left on the Moon",
    "mission": "Apollo 16",
    "date": "21 Nisan 1972",
    "date_en": "April 21, 1972",
    "decade": "1970",
    "category": "rover",
    "category_tr": "İniş Kademesi & LRV & Astronomi Teleskobu",
    "category_en": "Descent Stage & LRV & Telescope",
    "coords": {
      "lat": -8.973,
      "lng": 15.4985
    },
    "locationName": "Descartes Yaylaları",
    "modelType": "rover",
    "headline_tr": "Başka Bir Dünyadan Yapılan İlk Astronomik Gözlem ve Plastik Kaplı Bir Hatıra",
    "headline_en": "First Astronomical Observatory on the Moon and a Shrink-Wrapped Family Photo",
    "quote_tr": "Bu, Dünya gezegeninden gelen astronot Charles Duke'un ailesidir.",
    "quote_en": "This is the family of astronaut Charlie Duke from planet Earth who landed on the moon on April 20, 1972.",
    "quoteAuthor": "Charlie Duke (Fotoğraf arkasındaki el yazısı)",
    "story_tr": "John Young ve Charlie Duke, Descartes Yaylaları'nda dağlık krater arazisini LRV-002 ile keşfettiler. Bu görevde tarihin başka bir gök cismine kurulan İLK astronomik teleskobu olan 'Far Ultraviolet Camera/Spectrograph' kullanıldı. Dünya'nın jeokoronasını ve uzaydaki hidrojen bulutlarını ultraviyole dalgaboyunda fotoğraflayan bu teleskop hala Descartes düzlüğünde durmaktadır.\n\nCharlie Duke, gitmeden önce eşi Dotty ve iki oğlu Charles ile Thomas'ın yer aldığı şeffaf naylonla kaplı bir aile fotoğrafını Ay yüzeyine bıraktı. Fotoğrafın arkasında 'Bu, Dünya gezegeninden astronot Charles Duke'un ailesidir' yazıyordu.\n\nGüneş'in yakıcı ultraviyole radyasyonu muhtemelen fotoğrafın mürekkebini zamanla beyazlatmış olsa da selüloit tabaka ve hatırası orada yaşamaya devam etmektedir.",
    "story_en": "Young and Duke explored the Descartes Highlands with LRV-002. They operated the Far Ultraviolet Camera/Spectrograph—the first astronomical observatory sited on another celestial body. Duke famously left a shrink-wrapped color photograph of his wife Dotty and sons on the lunar surface before departing.",
    "whyAbandoned_tr": "Teleskop ve LRV-002 Ay yüzeyinde kalıcı gözlem ve deney noktası olarak bırakıldı; dönüş ağırlığı minimize edildi.",
    "whyAbandoned_en": "The UV observatory and rover were fixed surface assets; only film cartridges and rock samples were retrieved.",
    "currentCondition_tr": "Aile fotoğrafı Güneş'in 120°C gündüz ve -130°C gece sıcaklık dalgalanmasıyla solmuş olabilir; teleskop tripodu ve LRV metal aksamı olduğu gibi durmaktadır.",
    "currentCondition_en": "The photograph's emulsion is likely bleached by UV radiation, but the physical backing, UV camera tripod, and rover remain static.",
    "discardedItems": [
      "Apollo 16 'Orion' İniş Kademesi",
      "Lunar Roving Vehicle #2 (LRV-002)",
      "Uzak Ultraviyole Astronomi Kamerası ve Spektrografı",
      "Charlie Duke'un Plastik Kaplı Aile Fotoğrafı",
      "Hava Kuvvetleri 25. Yıl Özel Madalyonu"
    ],
    "technicalSpecs": {
      "massLeftKg": "2,840 kg iniş kademesi + 210 kg LRV + 22 kg Teleskop",
      "powerSource": "Nükleer RTG SNAP-27",
      "activeDuration": "71 saat 2 dakika yüzey kalışı",
      "coordinatesReadable": "8°58'22\" G, 15°29'55\" D"
    },
    "audioSnippet": "Duke: 'Here's the family photo... right there in the dust.'",
    "realPhotos": [
      {
        "title_tr": "John Young ve Ay Arabası (LRV-002)",
        "title_en": "John Young Saluting with LRV-002",
        "catalogId": "NASA AS16-113-18339",
        "instrument": "Hasselblad 70mm Yüzey Kamerası",
        "url": "assets/photos/apollo16_young.jpg",
        "desc_tr": "John Young'ın Ay yerçekiminde havaya sıçrayıp selam verdiği tarihi kare. Arkada Orion Ay Modülü ve elektrikli Ay Arabası görülüyor.",
        "desc_en": "Iconic photo of John Young jumping into the air while saluting the flag, with the Orion LM and Lunar Rover in view."
      }
    ],
    "secretRelic": {
      "badge_tr": "👨‍👩‍👦‍👦 AY'DA BIRAKILAN AİLE FOTOĞRAFI: CHARLIE DUKE",
      "badge_en": "👨‍👩‍👦‍👦 THE FAMILY PHOTO LEFT IN THE LUNAR REGOLITH",
      "title_tr": "Başka Bir Dünyaya Bırakılan En Kişisel Hatıra",
      "title_en": "Humanity's Most Intimate Relic on the Moon",
      "desc_tr": "Astronot Charlie Duke, eşi Dorothy ve oğulları Charles ile Thomas'ın fotoğrafını şeffaf plastik koruyucu içine koyup Ay yüzeyine bıraktı. Fotoğrafın arkasına 'Dünya gezegeninden Ay'a inen astronot Charlie Duke'un ailesi' notunu düşmüştü.",
      "desc_en": "Astronaut Charlie Duke left a shrink-wrapped color snapshot of his wife Dotty and sons on the Descartes surface. On the reverse he wrote: 'This is the family of astronaut Charlie Duke from planet Earth who landed on the moon on April 20, 1972.'"
    },
    "locationName_en": "Descartes Highlands",
    "discardedItems_en": [
      "Apollo 16 Lunar Module Descent Stage ('Orion')",
      "Lunar Roving Vehicle #2 (LRV-002 - Clocked record 18 km/h top speed)",
      "Charlie Duke's Color Photograph of His Family in Sealed Plastic Pouch",
      "Far Ultraviolet Camera / Spectrograph (First Astronomical Telescope on the Moon)",
      "Apollo 16 ALSEP Nuclear Experiment Station (Active Seismic Mortar Box)",
      "Cosmic Ray Detector Sheets and Portable Magnetometer"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "2,840 kg descent stage + 210 kg LRV + 22 kg Telescope",
      "powerSource": "Nuclear RTG SNAP-27",
      "activeDuration": "71 hours 2 minutes surface stay",
      "coordinatesReadable": "8°58'22\" S, 15°29'55\" E"
    }
  },
  {
    "id": "apollo-17-taurus",
    "body": "moon",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Saturn V (SA-512) / Apollo Ay Modülü (LM-12 Challenger) + Ay Taşıtı (LRV-003)",
    "craftType_en": "Saturn V (SA-512) / Apollo Lunar Module (LM-12 Challenger) + Lunar Roving Vehicle (LRV-003)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Apollo 17 'Challenger' & İnsanlığın Ay'daki Son Ayak İzleri",
    "name_en": "Apollo 17 'Challenger' & Humanity's Last Footsteps on the Moon",
    "mission": "Apollo 17",
    "date": "11 Aralık 1972",
    "date_en": "December 11, 1972",
    "decade": "1970",
    "category": "rover",
    "category_tr": "Son İnsanlı İniş Kademesi & LRV-003",
    "category_en": "Final Crewed Descent Stage & LRV-003",
    "coords": {
      "lat": 20.1908,
      "lng": 30.7717
    },
    "locationName": "Taurus-Littrow Vadisi",
    "modelType": "rover",
    "headline_tr": "Harita Bantlarıyla Tamir Edilen Çamurluk ve Ay Tozuna Kazınan Harfler: TDC",
    "headline_en": "A Rover Fender Repaired with Duct Tape and Three Initials in the Dust: TDC",
    "quote_tr": "Buradan ayrılırken barış ve umutla ayrılıyoruz; geri döndüğümüzde tüm insanlık için döneceğiz.",
    "quote_en": "As we leave the Moon at Taurus-Littrow, we leave as we came, God willing as we shall return, with peace and hope for all mankind.",
    "quoteAuthor": "Gene Cernan (Ay'da yürüyen son insan)",
    "story_tr": "Aralık 1972'de Gene Cernan ve tek profesyonel bilim insanı astronot olan jeolog Harrison Schmitt, Apollo programının son görevini gerçekleştirdi. Taurus-Littrow vadisinde 75 saat kaldılar ve LRV-003 ile 35.7 kilometre yol kat ettiler.\n\nKeşif sırasında Cernan kazara çekicin sapıyla roverın arka çamurluğunu kırdı. Çamurluk olmayınca dönen tekerlekler astronotların üzerine tonlarca aşındırıcı ay tozu fırlatıyordu. Mühendisler Dünya'dan telsizle talimat verdi: Schmitt ve Cernan, 4 adet sert karton ay haritasını koli bandıyla (duct tape) birbirine yapıştırarak derme çatma bir çamurluk yaptılar ve aracı kurtardılar!\n\nSon yürüyüşte Gene Cernan merdivene çıkmadan hemen önce kızı Tracy'nin baş harflerini 'TDC' olarak ay tozuna parmağıyla kazıdı. Atmosfer olmadığı için bu harfler yüzbinlerce yıl boyunca silinmeyecek.",
    "story_en": "Gene Cernan and geologist Harrison Schmitt spent 75 hours in the Taurus-Littrow valley. When a hammer accidentally broke the rover's fender, moon dust showered the astronauts; they ingeniously taped four lunar navigation maps together with duct tape to fix it. Before ascending the ladder, Cernan etched his daughter Tracy's initials ('TDC') into the regolith—where they will remain for eons.",
    "whyAbandoned_tr": "Apollo programının kongre kararıyla sonlandırılması sonucu bırakılan son teçhizat grubu; LRV-003 kalkış anını Dünya'ya yayınlamak için son kez kullanıldı.",
    "whyAbandoned_en": "Congress cancelled further Apollo flights; LRV-003 parked at the VIP site to aim its high-gain antenna and broadcast the final liftoff.",
    "currentCondition_tr": "Koli bantlı harita çamurluğu LRV-003 üzerinde hala sapasağlamdır. Cernan'ın bıraktığı ayak izleri ve kızının harfleri bozulmadan durmaktadır.",
    "currentCondition_en": "The duct-taped map fender repair is still clamped to LRV-003. Tracy Cernan's initials and Gene's final bootprints remain undisturbed.",
    "discardedItems": [
      "Apollo 17 'Challenger' İniş Kademesi",
      "Lunar Roving Vehicle #3 (Koli bantlı harita çamurluğuyla)",
      "Travers Gravimetresi",
      "Kozmik Işın Dedektörü",
      "Yüzey Elektriksel Özellikler Vericisi"
    ],
    "technicalSpecs": {
      "massLeftKg": "2,798 kg iniş kademesi + 210 kg LRV",
      "powerSource": "Nükleer RTG SNAP-27",
      "activeDuration": "75 saat 0 dakika yüzey kalışı (14 Aralık 1972 ayrılış)",
      "coordinatesReadable": "20°11'27\" K, 30°46'18\" D"
    },
    "audioSnippet": "Cernan: 'Bob, this is Gene, and I'm on the surface; and, as I take man's last step...'",
    "realPhotos": [
      {
        "title_tr": "Harrison Schmitt ve Ay'a Dikilen Amerikan Bayrağı",
        "title_en": "Harrison Schmitt by the American Flag",
        "catalogId": "NASA AS17-134-20384",
        "instrument": "Hasselblad 70mm Yüzey Kamerası",
        "url": "assets/photos/apollo17_flag.jpg",
        "desc_tr": "Apollo programının son yüzey yürüyüşünde jeolog astronot Harrison Schmitt ve arkada görkemli Taurus-Littrow dağ silsilesi.",
        "desc_en": "Geologist astronaut Harrison Schmitt stands on the Taurus-Littrow floor with the lunar rover and towering massifs in the background."
      }
    ],
    "secretRelic": {
      "badge_tr": "✍️ DUYGUSAL DETAY: GENE CERNAN'IN KIZI İÇİN 'TDC' HARFLERİ",
      "badge_en": "✍️ POIGNANT TRIBUTE: GENE CERNAN'S 'TDC' INITIALS",
      "title_tr": "Ay Tozunda Yüzbinlerce Yıl Yaşayacak Baba Sevgisi",
      "title_en": "A Father's Love Etched in the Vacuum for Eons",
      "desc_tr": "İnsanlığın Ay'daki son ayak izini bırakan Gene Cernan, Ay modülüne binmeden önce 9 yaşındaki kızı Tracy için eğilip parmağıyla 'TDC' harflerini kazıdı. Ay'da hava ve erozyon olmadığı için bu harfler milyonlarca yıl bozulmadan orada kalacaktır.",
      "desc_en": "Before climbing into Challenger as the last man on the Moon, Gene Cernan knelt down and inscribed 'TDC' (Tracy Dawn Cernan) into the regolith for his daughter, where it will endure for millions of years."
    },
    "locationName_en": "Taurus-Littrow Valley",
    "discardedItems_en": [
      "Apollo 17 Lunar Module Descent Stage ('Challenger')",
      "Lunar Roving Vehicle #3 (LRV-003 - Fitted with duct-tape and laminated map fender)",
      "Apollo 17 ALSEP Station (Lunar Ejecta and Meteorites Experiment)",
      "Traverse Gravimeter Experiment (TGE) Instrument",
      "Gene Cernan's Camera Pointing Toward Earth & Last Apollo Footstep Traces",
      "Lunar Atmospheric Composition Experiment (LACE)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "2,798 kg descent stage + 210 kg LRV",
      "powerSource": "Nuclear RTG SNAP-27",
      "activeDuration": "75 hours 0 minutes surface stay (Departed Dec 14, 1972)",
      "coordinatesReadable": "20°11'27\" N, 30°46'18\" E"
    }
  },
  {
    "id": "lunar-prospector",
    "body": "moon",
    "landingStatus": "crashed",
    "landingStatus_tr": "KİNETİK ÇARPIŞMA / KAZA SAHASI",
    "landingStatus_en": "KINETIC IMPACT / CRASH SITE",
    "craftType_tr": "Athena II (LLV-2) / Spin-Stabilize Ay Yörünge Aracı & Kasıtlı Kinetik Çarpıştırıcı",
    "craftType_en": "Athena II (LLV-2) / Spin-Stabilized Lunar Orbiter & Controlled Kinetic Impactor",
    "vrAllowed": false,
    "vrDisallowReason_tr": "Lunar Prospector sondası su buzu tespiti amacıyla 1.7 km/s (6.100 km/s) hızla Shoemaker kraterine kasıtlı olarak çarptırılmıştır. Yüzeye iniş yapamayan bir çarpışma görevi olduğundan VR yüzey yürüyüşü engellenmiştir.",
    "vrDisallowReason_en": "Lunar Prospector was deliberately crashed into Shoemaker Crater at 1.7 km/s (6,100 km/h) to search for water ice. As this was a high-speed orbital impact rather than a surface landing, VR walk mode is disabled.",
    "name_tr": "Lunar Prospector & Eugene Shoemaker'ın Ay'daki Mezarı",
    "name_en": "Lunar Prospector & Eugene Shoemaker's Lunar Grave",
    "mission": "Lunar Prospector",
    "date": "31 Temmuz 1999",
    "date_en": "July 31, 1999",
    "decade": "1990",
    "category": "impact",
    "category_tr": "Çarpma Sondası & İnsan Mezarı",
    "category_en": "Impact Probe & Human Memorial",
    "coords": {
      "lat": -87.7,
      "lng": 42
    },
    "locationName": "Shoemaker Krateri (Güney Kutbu)",
    "modelType": "probe",
    "headline_tr": "Dünya Dışında Gömülü Tek İnsan: Gezegen Jeolojisinin Babası Ay'da Yatıyor",
    "headline_en": "The Only Human Buried Beyond Earth: The Father of Planetary Geology Rests on the Moon",
    "quote_tr": "Ay'a gidip onu kendi çekicimle inceleyememek hayatımın en büyük hayal kırıklığıydı.",
    "quote_en": "Not going to the Moon and banging on it with my own hammer has been the biggest disappointment in life.",
    "quoteAuthor": "Dr. Eugene Shoemaker (Gökbilimci)",
    "story_tr": "Dr. Eugene Shoemaker, Dünya'daki kraterlerin meteor çarpmalarıyla oluştuğunu kanıtlayan ve Apollo astronotlarına jeoloji eğitimi veren efsanevi bilim insanıydı. En büyük hayali Ay'a bizzat ayak basmaktı, ancak Addison hastalığı nedeniyle astronot seçilemedi. 1997'de Avustralya'da bir göktaşı krateri araştırırken trafik kazasında hayatını kaybetti.\n\nNASA ve Celestis şirketi, onun mirasını onurlandırmak için küçük bir pirinç kapsül içerisine Shoemaker'ın yakılmış küllerinden 28 gram (1 ons) yerleştirdi. Kapsülün üzerine Hale-Bopp kuyruklu yıldızının resmi ve Shakespeare'in Romeo ve Juliet'inden dizeler kazındı.\n\nBu kapsül, Ay'ın kutuplarında su buzu arayan Lunar Prospector uzay aracına monte edildi. 31 Temmuz 1999'da araç, görevini tamamlayarak Güney Kutbu'ndaki karanlık bir kratere saatte 6.000 km hızla çarptırıldı. Bugün o krater 'Shoemaker Krateri' olarak anılmakta ve Dr. Shoemaker Ay'da yatan ilk ve tek insan olma unvanını taşımaktadır.\n\n[Resmi Kaynak Notu — NASA SP-2022-4235 \"A History of Near-Earth Objects Research\" & SP-2026-4239 \"Discovery Program\"]: NASA'nın 3. Discovery görevi olan Lunar Prospector, gezegen jeolojisinin kurucusu ve Apollo astronotlarının eğitmeni Dr. Eugene Shoemaker'ın küllerini taşıyan polikarbonat kapsülle birlikte 31 Temmuz 1999'da Shoemaker Krateri'ne çarptırılmıştır.",
    "story_en": "Dr. Eugene Shoemaker trained Apollo astronauts in field geology. Barred from spaceflight due to medical conditions, he dreamed of reaching the Moon. After his untimely death in 1997, 28 grams of his cremated ashes were placed aboard NASA's Lunar Prospector inside a brass capsule inscribed with verses from Romeo and Juliet. On July 31, 1999, the craft was deliberately crashed into a permanently shadowed south pole crater—now named Shoemaker Crater. He remains the only human buried on the Moon.\n\n[Official Monograph Citation — NASA SP-2022-4235 & SP-2026-4239]: Selected as NASA's third Discovery Program mission, Lunar Prospector carried a polycarbonate capsule containing the ashes of astrogeology founder Dr. Eugene Shoemaker into Shoemaker Crater on July 31, 1999.",
    "whyAbandoned_tr": "Kutup kraterlerindeki gölgeli buz tabakasından buhar bulutu çıkarmak ve spektrometrelerle su aramak için kontrollü çarpma gerçekleştirildi.",
    "whyAbandoned_en": "Controlled suicide impact into a permanently shadowed crater to liberate potential water-ice plumes for Earth-based spectroscopy.",
    "currentCondition_tr": "Araç ve pirinç kapsül çarpma anında parçalanmıştır; küller Shoemaker Krateri'nin ebedi gölgesinde lunar regolit ile karışmıştır.",
    "currentCondition_en": "The spacecraft and capsule pulverized upon impact; Shoemaker's ashes are permanently mingled with the polar regolith.",
    "discardedItems": [
      "Lunar Prospector Gövdesi ve Spektrometre Bomları",
      "Eugene Shoemaker'ın Küllerini Taşıyan Hatıra Kapsülü",
      "Shakespeare Romeo & Juliet Kazımalı Alüminyum Plaka"
    ],
    "technicalSpecs": {
      "massLeftKg": "158 kg (boş uzay aracı)",
      "powerSource": "Güneş Pili Silindiri (çarpmaya kadar)",
      "activeDuration": "1.5 yıl kutup yörüngesi haritalaması",
      "coordinatesReadable": "87°42' G, 42°0' D"
    },
    "audioSnippet": "[Lunar Prospector Orbit Insertion Telemetry Beacon]",
    "realPhotos": [],
    "locationName_en": "Shoemaker Crater (Lunar South Pole)",
    "discardedItems_en": [
      "Lunar Prospector Spacecraft Bus and Spectrometer Booms",
      "Memorial Capsule Carrying Ashes of Dr. Eugene Shoemaker",
      "Neutron Spectrometer and Gamma Ray Spectrometer Assemblies",
      "Alpha Particle Spectrometer and Magnetometer Mast",
      "Impact Debris within Permanently Shadowed Region (PSR)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "158 kg (dry spacecraft bus)",
      "powerSource": "Solar Cell Cylinder (until controlled impact)",
      "activeDuration": "1.5 years polar orbit mapping",
      "coordinatesReadable": "87°42' S, 42°0' E"
    }
  },
  {
    "id": "lcross-centaur",
    "body": "moon",
    "landingStatus": "crashed",
    "landingStatus_tr": "KİNETİK ÇARPIŞMA / KAZA SAHASI",
    "landingStatus_en": "KINETIC IMPACT / CRASH SITE",
    "craftType_tr": "Atlas V 401 / Centaur-D Üst Roket Kademesi & LCROSS Çarpma Sondası",
    "craftType_en": "Atlas V 401 / Centaur-D Upper Stage & LCROSS Shepherding Spacecraft Impactor",
    "vrAllowed": false,
    "vrDisallowReason_tr": "Centaur roket kademesi ve LCROSS sondası, su buzunu açığa çıkarmak amacıyla 2.5 km/s (9.000 km/s) hızla Cabeus kraterine çarparak buharlaşmıştır. Yumuşak iniş aracı olmadığından VR yüzey yürüyüşü engellenmiştir.",
    "vrDisallowReason_en": "The Centaur rocket upper stage and LCROSS spacecraft slammed into Cabeus crater at 2.5 km/s (9,000 km/h) to eject water ice. As a destructive impact with no landing, VR walk mode is disabled.",
    "name_tr": "LCROSS & Centaur Roket Kademesi: Ay Suyu Avcıları",
    "name_en": "LCROSS & Centaur Upper Stage: The Lunar Water Hunters",
    "mission": "LCROSS",
    "date": "9 Ekim 2009",
    "date_en": "October 9, 2009",
    "decade": "2000",
    "category": "impact",
    "category_tr": "Çift Kinetik Çarpma Roketi",
    "category_en": "Dual Kinetic Impactor Rocket",
    "coords": {
      "lat": -84.675,
      "lng": -48.725
    },
    "locationName": "Cabeus Krateri (Güney Kutbu)",
    "modelType": "stage",
    "headline_tr": "Ay'da Saf Su Buzunun Keşfedildiği Tarihi İkiz Çarpışma",
    "headline_en": "The Historic Twin Impact That Confirmed Pure Water-Ice on the Moon",
    "quote_tr": "Evet, Ay'da sadece biraz değil, önemli miktarda su bulduk!",
    "quote_en": "Indeed, yes, we found water, and we didn't just find a little bit, we found a significant amount.",
    "quoteAuthor": "Anthony Colaprete (LCROSS Baş Araştırmacısı)",
    "story_tr": "LCROSS (Lunar Crater Observation and Sensing Satellite), Ay'ın milyarlarca yıldır Güneş ışığı görmeyen dondurucu -240°C'lik kutup kraterlerinde su buzu olup olmadığını kesinleştirmek için tasarlanmış cüretkar bir 'kamikaze' göreviydi.\n\nSistem iki bileşenden oluşuyordu: Önde 2.2 tonluk boş Atlas V Centaur roket üst kademesi, onun 4 dakika arkasından takip eden LCROSS gözlem sondası. Centaur roketi Cabeus kraterinin tabanına saatte 9.000 km hızla çarptı.\n\nOluşan 350 tonluk enkaz ve buhar bulutu 10 km yukarı fışkırdı. Arkadan gelen LCROSS sondası bu toz ve buhar bulutunun içinden geçerken spektrometreleriyle ölçüm yaptı ve Dünya'ya canlı veri aktardıktan 4 dakika sonra kendisi de yüzeye çakıldı. Analizler fışkıran maddenin en az 150 kg saf su buzu ve hidroksil içerdiğini kanıtlayarak Artemis projesinin temelini attı!",
    "story_en": "LCROSS employed a one-two punch: the spent 2.2-ton Centaur rocket struck Cabeus crater at 9,000 km/h, creating a 10 km high plume of debris. The trailing LCROSS shepherd spacecraft flew directly through the vapor cloud, analyzing its chemical composition before crashing itself 4 minutes later. It confirmed pristine water ice sequestered in perpetual shadow.",
    "whyAbandoned_tr": "Bilimsel su buzu tespiti için planlı kinetik çarpışma görevi.",
    "whyAbandoned_en": "Planned kinetic excavation to analyze volatile composition of permanently shadowed regions.",
    "currentCondition_tr": "Cabeus kraterinin zifiri karanlığında iki ayrı çarpma çukuru ve metalik enkaz alanı olarak durmaktadır.",
    "currentCondition_en": "Resting as two pulverized impact scars inside the permanently shadowed, cryogenic floor of Cabeus crater.",
    "discardedItems": [
      "Centaur Üst Roket Kademesi Kalıntıları",
      "LCROSS Gözlem Uzay Aracı Gövdesi",
      "Görünür Işık ve Kızılötesi Spektrometre Enkazı"
    ],
    "technicalSpecs": {
      "massLeftKg": "Centaur: 2,270 kg + LCROSS: 891 kg (Toplam ~3,161 kg)",
      "powerSource": "Kinetik Enerji Çarpması",
      "activeDuration": "Çarpma: 9 Ekim 2009 11:31 & 11:36 UTC",
      "coordinatesReadable": "84°40'30\" G, 48°43'30\" B"
    },
    "audioSnippet": "[Cabeus Impact Telemetry Loss Event Tone]",
    "realPhotos": [],
    "locationName_en": "Cabeus Crater (Lunar South Pole)",
    "discardedItems_en": [
      "Atlas V Centaur Upper Rocket Stage Remains",
      "LCROSS Shepherding Spacecraft Structure",
      "9 Kinetic Instruments (NIR/VIS Spectrometers, Mid-IR Cameras)",
      "Impactor Crater Debris (~20m crater in permanent ice-bearing shadow)",
      "Excavated Water Vapor, Hydroxyl, and Hydrocarbon Signatures"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "Centaur: 2,270 kg + LCROSS: 891 kg (Total ~3,161 kg)",
      "powerSource": "Kinetic Energy Impact",
      "activeDuration": "Impact: October 9, 2009 11:31 & 11:36 UTC",
      "coordinatesReadable": "84°40'30\" S, 48°43'30\" W"
    }
  },
  {
    "id": "viking-1-lander",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Titan IIIE Centaur / Otomatik Mars Yüzey İstasyonu & Biyoloji Laboratuvarı",
    "craftType_en": "Titan IIIE Centaur / Automated Mars Surface Lander & Biology Station",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Viking 1 İniş Aracı: 'Thomas Mutch İstasyonu'",
    "name_en": "Viking 1 Lander: 'Thomas Mutch Memorial Station'",
    "mission": "Viking 1",
    "date": "20 Temmuz 1976",
    "date_en": "July 20, 1976",
    "decade": "1970",
    "category": "lander",
    "category_tr": "İniş Aracı & Biyoloji Laboratuvarı",
    "category_en": "Lander & Biology Lab",
    "coords": {
      "lat": 22.697,
      "lng": -48.222
    },
    "locationName": "Chryse Planitia (Altın Ovalar)",
    "modelType": "lander",
    "headline_tr": "Kızıl Gezegenden İlk Renkli Fotoğrafı Gönderen ve Yanlış Bir Komutla Sessizliğe Gömülen Öncü",
    "headline_en": "The Pioneer That Sent the First Color Photo from Mars, Silenced by an Accidental Command",
    "quote_tr": "Mars yüzeyinden ilk görüntü geliyor... kırmızı kayalar, turuncu bir gökyüzü... başka bir dünya!",
    "quote_en": "First image from the surface of Mars... red rocks, butterscotch sky... another world!",
    "quoteAuthor": "JPL Kontrol Merkezi Anonsu (1976)",
    "story_tr": "Apollo 11'in Ay'a inişinden tam 7 yıl sonra, 20 Temmuz 1976'da Viking 1 Mars'ın Chryse Planitia düzlüğüne yumuşak iniş yaparak Dünya tarihine geçti. İnsanlık ilk kez Mars yüzeyini net ve renkli fotoğraflarla gördü.\n\nViking 1 sadece bir fotoğrafçı değildi; üzerinde robotik bir kol, meteoroloji istasyonu ve Mars toprağında mikrobiyal yaşam arayan minyatür bir biyoloji laboratuvarı taşıyordu. Tasarlanan görev süresi 90 gündü, ancak nükleer jeneratörü sayesinde tam 6 yıl 116 gün (2.245 Mars günü / sol) boyunca çalışmaya devam etti.\n\nSonu trajik bir insan hatasıyla geldi: Kasım 1982'de Dünya'daki JPL mühendisleri batarya şarj yazılımını güncellemek için bir komut gönderirken, yanlışlıkla yüksek kazançlı antenin yönlendirme verilerinin üzerine yazdılar. Anten Dünya ile irtibatını kaybetti. NASA aylarca araca tekrar ulaşmaya çalıştı ancak Viking 1'den bir daha haber alınamadı.",
    "story_en": "Viking 1 touched down in Chryse Planitia on July 20, 1976—the 7th anniversary of Apollo 11. Powered by twin plutonium RTGs, it operated for an astounding 6 years and 116 days. Its mission ended in November 1982 when a ground software update inadvertently overwrote antenna positioning parameters, permanently severing contact with Earth. It was later dedicated as the Thomas A. Mutch Memorial Station.",
    "whyAbandoned_tr": "Sabit konuşlu bir istasyondu; fırlatma veya geri dönüş kabiliyeti yoktu. Anten yazılımı kaza sonucu kaybolunca terk edildi.",
    "whyAbandoned_en": "Fixed stationary lander with no return capability; abandoned when inadvertent software uplink broke communications.",
    "currentCondition_tr": "Üç iniş ayağı üzerinde Altın Ovalar'da durmaktadır. 48 yıllık global Mars toz fırtınaları nedeniyle üzeri ince kırmızı pas tozu tabakasıyla kaplanmıştır.",
    "currentCondition_en": "Stands upright on its tripod landing legs. 48+ years of global dust storms have coated its chassis in fine iron-oxide dust.",
    "discardedItems": [
      "Viking 1 İniş Gövdesi ve Biyoloji Laboratuvarı",
      "İkiz SNAP-19 Plütonyum RTG Nükleer Üniteleri",
      "Meteoroloji Bomu ve Yüzey Örnekleyici Kol",
      "Kazaen atılan Isı Kalkanı ve Paraşüt (birkaç km ötede)"
    ],
    "technicalSpecs": {
      "massLeftKg": "572 kg (iniş aracı kuru kütlesi)",
      "powerSource": "2 x SNAP-19 RTG (Plütonyum-238)",
      "activeDuration": "2,245 sol (6 yıl, 116 gün)",
      "coordinatesReadable": "22°41'49\" K, 48°13'19\" B"
    },
    "audioSnippet": "[Viking 1 First Telemetry Handshake Beep - July 1976]",
    "realPhotos": [
      {
        "title_tr": "Mars Yüzeyinden İlk Renkli Panoramik Görüntü (1976)",
        "title_en": "First Color Panorama of Mars Surface (1976)",
        "catalogId": "NASA PIA00383",
        "instrument": "Viking Lander Facsimile Camera",
        "url": "assets/photos/viking1_surface.jpg",
        "desc_tr": "İnsanlık tarihinde Mars'ın kızıl toprakları ve gökyüzünü ilk kez canlı renkleriyle Dünya'ya ileten tarihi panoramik kare.",
        "desc_en": "The landmark color panorama from Chryse Planitia that gave humanity its first true-color look at the martian surface."
      }
    ],
    "secretRelic": {
      "badge_tr": "🔴 DİĞER BİR DÜNYADAN İLK RENKLİ FOTOĞRAF",
      "badge_en": "🔴 FIRST COLOR TRANSMISSION FROM ANOTHER PLANET",
      "title_tr": "20 Temmuz 1976: Kızıl Gezegen'e İlk Başarılı Dokunuş",
      "title_en": "July 20, 1976: Humanity's First Soft Touchdown on Mars",
      "desc_tr": "Apollo 11'in inişinden tam 7 yıl sonra aynı gün Mars'a inen Viking 1, biyolojik yaşam arayışı için Mars toprağını kepçesiyle fırınına aldı. 6 yıl boyunca aralıksız hava durumu raporu göndererek Mars'ta bırakılan ilk kalıcı istasyon oldu.",
      "desc_en": "Landing exactly 7 years after Apollo 11, Viking 1 operated for 6 continuous years, transmitting thousands of weather logs and biological soil analyses."
    },
    "locationName_en": "Chryse Planitia (Plains of Gold)",
    "discardedItems_en": [
      "Viking 1 Lander Main Body & Three-Legged Landing Gear",
      "Biology Gas Exchange (GEX) and Labeled Release (LR) Test Chambers",
      "Surface Sampler Robotic Collector Arm and Trench Collector Head",
      "Twin High-Gain S-Band Dish and UHF Antennae",
      "2 x SNAP-19 Radioisotope Thermoelectric Generators (RTG)",
      "Meteorology Sensor Boom and Wind Velocity Sensors"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "572 kg (lander dry mass)",
      "powerSource": "2 x SNAP-19 RTG (Plutonium-238)",
      "activeDuration": "2,245 sols (6 years, 116 days)",
      "coordinatesReadable": "22°41'49\" N, 48°13'19\" W"
    }
  },
  {
    "id": "pathfinder-sojourner",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Delta II 7925 / Hava Yastıklı Mars İniş İstasyonu & Sojourner Gezgin Aracı",
    "craftType_en": "Delta II 7925 / Airbag-Cushioned Lander & Sojourner Micro-Rover",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Mars Pathfinder & Sojourner: 'Carl Sagan İstasyonu'",
    "name_en": "Mars Pathfinder & Sojourner: 'Carl Sagan Memorial Station'",
    "mission": "Mars Pathfinder",
    "date": "4 Temmuz 1997",
    "date_en": "July 4, 1997",
    "decade": "1990",
    "category": "rover",
    "category_tr": "İlk Mars Gezgini & Hava Yastıklı İniş İstasyonu",
    "category_en": "First Mars Rover & Airbag Lander",
    "coords": {
      "lat": 19.33,
      "lng": -33.55
    },
    "locationName": "Ares Vallis (Antik Sel Yatağı)",
    "modelType": "rover",
    "headline_tr": "Mikrodalga Fırın Boyutundaki Bir Gezginin Mars'ı Yeniden Fethedişi",
    "headline_en": "A Microwave-Sized Rover That Conquered Mars and Won the World's Heart",
    "quote_tr": "Mars'ta tekerlek izleri bırakan ilk insanlar değiliz belki, ama ilk makineler biziz.",
    "quote_en": "Sojourner is driving across the red dirt... the first mobile vehicle on another planet.",
    "quoteAuthor": "Donna Shirley (NASA Mars Keşif Program Müdürü)",
    "story_tr": "4 Temmuz 1997 Amerikan Bağımsızlık Günü'nde Mars Pathfinder, dev hava yastıklarıyla Ares Vallis'e zıplayarak indi. İniş platformunun açılan yaprakları içinden 10.6 kilogram ağırlığında, altı tekerlekli minicik bir robot çıktı: Sojourner (adını kölelik karşıtı kadın hakları savunucusu Sojourner Truth'tan almıştır).\n\nSojourner, başka bir gezegende hareket eden İLK tekerlekli araç oldu. Etrafındaki kayalara 'Yogi', 'Barnacle Bill' ve 'Scooby-Doo' gibi eğlenceli isimler vererek alfa proton röntgen spektrometresiyle kimyasal analizler yaptı.\n\nİstasyon, ünlü gökbilimci Carl Sagan'ın anısına 'Carl Sagan Hatıra İstasyonu' olarak adlandırıldı. 83 gün sonra ana istasyonun bataryası Mars kışının dondurucu soğuğunda tükendi. Ana istasyon sustuğunda Sojourner'ın otonom acil durum protokolünü devreye sokarak yardım beklemek üzere istasyonun etrafında dönüp durduğu tahmin edilmektedir.\n\n[Resmi Kaynak Notu — NASA SP-2026-4239 \"NASA's Discovery Program\"]: NASA Yöneticisi Daniel Goldin'in \"Daha Hızlı, Daha İyi, Daha Ucuz\" (Faster, Better, Cheaper) vizyonuyla başlatılan Discovery Programı'nın ilk fırlatılan görevi olan Mars Pathfinder, 24 loblu dev hava yastıklarıyla Ares Vallis taşkın yatağına inerek gezegen keşfinde yeni bir çağ açmıştır.",
    "story_en": "Mars Pathfinder bounced onto Ares Vallis cushioned by giant airbags on July 4, 1997. It released Sojourner, a 10.6 kg microwave-sized rover that became the first wheeled vehicle to drive on another planet. After 83 days of science that captured global headlines, the lander's battery expired during the freezing martian winter, leaving Sojourner circling its silent mothership.\n\n[Official Monograph Citation — NASA SP-2026-4239 \"NASA's Discovery Program\"]: As the pioneering flight of NASA's Discovery Program, Mars Pathfinder validated the 24-lobe airbag landing architecture in Ares Vallis and deployed the 10.6 kg Sojourner microrover.",
    "whyAbandoned_tr": "Düşük maliyetli teknoloji gösteri aracıydı; şarj edilebilir pilleri derin Mars kışında donarak iflas etti.",
    "whyAbandoned_en": "Technology demonstration mission; battery succumbed to repeated cryogenic thermal cycles during martian winter.",
    "currentCondition_tr": "Pathfinder'ın hava yastığı kalıntıları ve Sojourner roverı Ares Vallis taşkın ovasında 'Yogi' kayasının yakınlarında donmuş vaziyettedir.",
    "currentCondition_en": "The tetrahedral lander petals, deflated Kevlar airbags, and tiny Sojourner rover remain frozen near the rock 'Yogi' in Ares Vallis.",
    "discardedItems": [
      "Mars Pathfinder İniş İstasyonu (Carl Sagan İstasyonu)",
      "Sojourner Mikro-Roverı (10.6 kg)",
      "Kevlar Hava Yastığı Kümeleri",
      "Arka Kapak ve Paraşüt Enkazı (kuzeybatıda)"
    ],
    "technicalSpecs": {
      "massLeftKg": "264 kg istasyon + 10.6 kg Sojourner",
      "powerSource": "Galyum Arsenit Güneş Panelleri + Lityum-Tiyonil Pil",
      "activeDuration": "83 sol yüzey operasyonu (100 metre sürüş)",
      "coordinatesReadable": "19°20' K, 33°33' B"
    },
    "audioSnippet": "[Pathfinder Modem Telemetry Carrier Signal]",
    "realPhotos": [
      {
        "title_tr": "Sojourner Mars Yüzeyindeki Yogi Kayasında",
        "title_en": "Sojourner at Yogi Rock",
        "catalogId": "NASA PIA01120",
        "instrument": "Pathfinder IMP / APXS Spektrometresi",
        "url": "assets/photos/pathfinder_sojourner.jpg",
        "desc_tr": "Mars yüzeyinde tekerlek çeviren tarihin ilk gezgini Sojourner, Yogi adlı volkanik kayanın kimyasal bileşimini APXS spektrometresiyle analiz ederken.",
        "desc_en": "The first rover on Mars, Sojourner, pressed its APXS sensor against the volcanic rock named Yogi to analyze its elemental composition."
      }
    ],
    "secretRelic": {
      "badge_tr": "📻 CARL SAGAN ANIT İSTASYONU",
      "badge_en": "📻 CARL SAGAN MEMORIAL STATION",
      "title_tr": "Mars'a İnen İlk Başarılı Mikro Gezgin (10.6 kg)",
      "title_en": "The 10.6 kg Micro-Rover That Paved the Way",
      "desc_tr": "Pathfinder iniş üssü görevin ardından Carl Sagan Anıt İstasyonu olarak adlandırıldı. Minik Sojourner, Dünya ile iletişimi kesildikten sonra bile hafızasındaki döngüyle istasyonun çevresinde dönmeye devam etti.",
      "desc_en": "Named the Carl Sagan Memorial Station upon touchdown, the mission's 10.6 kg rover Sojourner circled the base station tirelessly until batteries froze in the martian night."
    },
    "locationName_en": "Ares Vallis (Ancient Outflow Channel)",
    "discardedItems_en": [
      "Mars Pathfinder 'Carl Sagan Memorial Station' Lander Body",
      "Sojourner Micro-Rover (10.6 kg, 6-wheel rocker-bogie chassis)",
      "Three Deployable Petal Solar Panels and Deflated Airbag Cushions",
      "Alpha Proton X-Ray Spectrometer (APXS) Deployed on 'Barnacle Bill' Rock",
      "Stereoscopic Imager for Mars Pathfinder (IMP) Camera Mast",
      "High-Gain Antenna and Atmospheric Structure Instrument"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "Pathfinder: 360 kg + Sojourner: 10.6 kg",
      "powerSource": "GaAs Solar Panels + Lithium SO2 Battery",
      "activeDuration": "83 sols (Pathfinder) / 85 sols (Sojourner)",
      "coordinatesReadable": "19°7'48\" N, 33°31'12\" W"
    }
  },
  {
    "id": "spirit-rover",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Delta II 7925 / Mars Keşif Gezgini (MER-A Spirit Rover, 6 Tekerlekli Robotik Jeolog)",
    "craftType_en": "Delta II 7925 / Mars Exploration Rover (MER-A Spirit, 6-Wheeled Robotic Geologist)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Spirit Gezgini (MER-A): 'Troy'da Donan Cesur Kaşif",
    "name_en": "Spirit Rover (MER-A): The Brave Explorer Frozen at 'Troy'",
    "mission": "Mars Exploration Rover - A",
    "date": "4 Ocak 2004",
    "date_en": "January 4, 2004",
    "decade": "2000",
    "category": "rover",
    "category_tr": "Mars Gezgini & Isı Kalkanı Enkazı",
    "category_en": "Mars Rover & Heat Shield Debris",
    "coords": {
      "lat": -14.5684,
      "lng": 175.47263
    },
    "locationName": "Gusev Krateri ('Troy' Kum Tuzağı)",
    "modelType": "rover",
    "headline_tr": "Kırık Ön Tekerleğini Sürükleyerek Saf Silika Keşfeden ve Kumda Kalan Savaşçı",
    "headline_en": "Dragging a Broken Wheel to Discover Ancient Hydrothermal Vents, Then Trapped in Sand",
    "quote_tr": "Spirit artık bir gezgin değil; sabit bir gözlem istasyonu olarak görevine devam edecek.",
    "quoteAuthor": "John Callas (JPL Proje Müdürü - 2010)",
    "quote_en": "Spirit is no longer a mobile rover; she has transformed into a stationary science outpost.",
    "story_tr": "Spirit, 90 Mars günü (sol) çalışmak üzere tasarlanmıştı. Ancak tam 2.210 sol (6 yıldan fazla!) boyunca zorlu Gusev Krateri'ni baştan başa geçti ve Columbia Tepeleri'ne tırmandı.\n\n2006 yılında sağ ön tekerleği kilitlendi ve dönmez oldu. Mühendisler pes etmedi; Spirit'i geri geri sürerek kırık tekerleği arkasından bir çapa gibi sürüklediler. Bu aksilik tarihin en büyük bilimsel keşiflerinden birine yol açtı: Kırık tekerleğin yardığı Mars toprağında %90 saf silika tabakası ortaya çıktı! Bu, Mars'ta bir zamanlar antik sıcak su gayzerlerinin ve yaşam için elverişli hidrotermal kaynakların var olduğunu kanıtladı.\n\nNisan 2009'da Spirit, 'Troy' adında gizli bir sülfat kumu tuzağına saplandı. Tekerlekleri boşta dönüyordu. Güneş panellerini kış güneşine doğru eğemediği için 22 Mart 2010'da dondurucu dördüncü Mars kışında enerjisi tükendi ve son sinyalini gönderdi.",
    "story_en": "Spirit was designed for 90 sols but lasted 2,210 sols. When its right front wheel seized, engineers drove the rover backwards, dragging the dead wheel. This accident scraped open the regolith, revealing 90% pure silica—smoking-gun proof of ancient hydrothermal hot springs. In 2009, Spirit bogged down in hidden sulfate sands dubbed 'Troy'. Unable to tilt its dust-coated solar arrays toward the winter sun, Spirit fell silent in March 2010.",
    "whyAbandoned_tr": "Yumuşak sülfat kumunda saplanıp kaldı; kış güneşinde donarak ısıtıcılarını çalıştıracak enerjiyi kaybetti.",
    "whyAbandoned_en": "Entrapped in soft loose sand at 'Troy'; unable to reposition solar panels to survive cryogenic -100°C winter.",
    "currentCondition_tr": "Columbia Tepeleri eteklerinde, bataryaları tükenmiş ve güneş panelleri tozla örtülmüş olarak 'Troy' bölgesinde beklemektedir.",
    "currentCondition_en": "Stationary at 'Troy' on the flank of Home Plate, wheels half-submerged in fine sulfurous sand.",
    "discardedItems": [
      "Spirit Rover Gövdesi (185 kg)",
      "Mössbauer ve Alfa Parçacık X-Işını Spektrometreleri",
      "Gusev İniş Hava Yastığı Platformu (birkaç km güneyde)",
      "Isı Kalkanı ve Darbe Krateri Kalıntıları"
    ],
    "technicalSpecs": {
      "massLeftKg": "185 kg (rover)",
      "powerSource": "Güneş Panelleri (140W max, kışın <15W'a düştü)",
      "activeDuration": "2,210 sol (7.73 km sürüş mesafesi)",
      "coordinatesReadable": "14°34'6\" G, 175°28'21\" D"
    },
    "audioSnippet": "[Spirit Final S-Band Telemetry Carrier Wave Fadeout]",
    "realPhotos": [],
    "locationName_en": "Gusev Crater ('Troy' Sand Trap)",
    "discardedItems_en": [
      "Spirit Mars Exploration Rover (MER-A) Chassis",
      "Pancake Solar Array Covered in Fine Martian Dust",
      "Pancam Mast Assembly & Navigation Stereo Cameras",
      "Mössbauer Spectrometer and Alpha Particle X-Ray Spectrometer (APXS)",
      "Microscopic Imager and Rock Abrasion Tool (RAT)",
      "Disabled Right Front Wheel Buried in Soft Sulfate Sand ('Troy')"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "185 kg (rover mass)",
      "powerSource": "Triple-Junction Solar Panels (Dust-covered)",
      "activeDuration": "2,210 sols (Over 6 years, planned for 90 sols)",
      "coordinatesReadable": "14°34'19\" S, 175°28'41\" E"
    }
  },
  {
    "id": "opportunity-rover",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Delta II 7925H / Mars Keşif Gezgini (MER-B Opportunity Rover, 6 Tekerlekli Robotik Jeolog)",
    "craftType_en": "Delta II 7925H / Mars Exploration Rover (MER-B Opportunity, 6-Wheeled Robotic Geologist)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Opportunity (Oppy): 'Bataryam Az ve Hava Kararıyor'",
    "name_en": "Opportunity (Oppy): 'My Battery is Low and It is Getting Dark'",
    "mission": "Mars Exploration Rover - B",
    "date": "25 Ocak 2004",
    "date_en": "January 25, 2004",
    "decade": "2000",
    "category": "rover",
    "category_tr": "Efsanevi Maratoncu Gezgin",
    "category_en": "Legendary Marathon Rover",
    "coords": {
      "lat": -1.9483,
      "lng": 354.47417
    },
    "locationName": "Meridiani Planum (Perseverance Vadisi)",
    "modelType": "rover",
    "headline_tr": "14.5 Yıl, 45 Kilometre ve Mars'ın En Büyük Küresel Toz Fırtınasıyla Gelen Veda",
    "headline_en": "14.5 Years, 45 Kilometers, and a Poetic Farewell in a Planet-Encircling Dust Storm",
    "quote_tr": "Bataryam azaldı ve hava kararıyor... (My battery is low and it's getting dark)",
    "quote_en": "My battery is low and it's getting dark.",
    "quoteAuthor": "Opportunity'nin son telemetri durumunun gazeteci Jacob Margolis tarafından özetlenen hali",
    "story_tr": "Opportunity ('Oppy'), Mars keşif tarihinin tartışmasız en büyük maratoncusuydu. 90 günlük görev ömrü biçilmişken tam 5.111 sol (14 yıl 138 gün!) çalıştı. Başka bir gök cisminde tam bir olimpik maraton mesafesini (42.195 km) aşarak toplam 45.16 kilometre yol kat etti!\n\nMeridiani Planum'da antik tuzlu göllerin ve 'yaban mersini' (hematit sferülleri) adı verilen su kalıntılarının izini sürdü. Victoria Krateri'nden Endeavour Krateri'ne kadar yıllarca Mars'ın zorlu yollarını arşınladı.\n\nHaziran 2018'de Mars tarihinin en şiddetli küresel toz fırtınalarından biri patlak verdi. Gökyüzü gündüz vakti gece gibi karardı (optik derinlik Tau > 10.8). Güneş panellerine ışık ulaşamayan Oppy, 10 Haziran 2018'de Perseverance Vadisi'nde son telemetrisini gönderdi. NASA, Billie Holiday'in 'I'll Be Seeing You' şarkısı dahil 1.000'den fazla uyandırma sinyali gönderdi ama Oppy bir daha uyanmadı.",
    "story_en": "Opportunity was the ultimate endurance champion: built for a 90-sol mission, it survived 5,111 sols (14.5 years) and drove 45.16 kilometers—longer than an Olympic marathon! It discovered hematite 'blueberries' and proof of ancient neutral pH water. In June 2018, a catastrophic planet-encircling dust storm blocked all sunlight over Endeavour Crater. Oppy's final transmission arrived on Sol 5111 before cold darkness silenced it forever.",
    "whyAbandoned_tr": "Tüm gezegeni saran dev toz fırtınası güneş panellerini ışıksız bıraktı; kritik sistem ısıtıcıları dondu.",
    "whyAbandoned_en": "Global planet-encircling dust storm blotted out the sun; battery drained past critical recovery threshold.",
    "currentCondition_tr": "Endeavour Krateri'nin batı kenarındaki Perseverance Vadisi'nde, güneş panelleri kalın kırmızı toz örtüsüyle kaplanmış halde uyumaktadır.",
    "currentCondition_en": "Resting on the western rim of Endeavour Crater in Perseverance Valley, enshrouded in reddish-brown martian dust.",
    "discardedItems": [
      "Opportunity Mars Rover Gövdesi (185 kg)",
      "Pancam Panoramik Kamera Direği",
      "Isı Kalkanı Parçaları ('Heat Shield Rock' meteoritinin yanında)",
      "Giriş/Alçalış Paraşütü ve Sırtlığı"
    ],
    "technicalSpecs": {
      "massLeftKg": "185 kg rover",
      "powerSource": "Güneş Panelleri (başlangıçta 900 Wh/gün)",
      "activeDuration": "5,111 sol (45.16 km sürüş mesafesi rekoru)",
      "coordinatesReadable": "1°56'54\" G, 354°28'27\" D"
    },
    "audioSnippet": "[Billie Holiday - 'I'll Be Seeing You' wake-up broadcast]",
    "realPhotos": [
      {
        "title_tr": "Opportunity Mars'ta Hendek Kazıyor",
        "title_en": "Opportunity Digging a Trench on Mars",
        "catalogId": "NASA PIA19112",
        "instrument": "MER Panoramic Camera (Pancam)",
        "url": "assets/photos/opportunity_trench.jpg",
        "desc_tr": "Opportunity tekerlekleriyle Mars toprağını kazarak eski su akıntılarının bıraktığı hematit kürelerini ortaya çıkarırken.",
        "desc_en": "Opportunity spinning its wheel to excavate the red soil, revealing hematite blueberries formed in ancient martian water."
      }
    ],
    "secretRelic": {
      "badge_tr": "⚡ EFSANEVİ VEDA: 'PİLLERİM AZALIYOR VE HAVA KARARIYOR'",
      "badge_en": "⚡ POIGNANT FAREWELL: 'MY BATTERY IS LOW AND IT'S GETTING DARK'",
      "title_tr": "90 Günlük Görevden 15 Yıllık Efsaneye (5.111 Sol)",
      "title_en": "From a 90-Day Lifespan to a 15-Year Odyssey (5,111 Sols)",
      "desc_tr": "Sadece 90 gün çalışması planlanan küçük rover, tam 15 yıl boyunca 45.16 km mesafe kat ederek Dünya dışı sürüş rekorunu kırdı. 2018 yılındaki gezegen ölçeğindeki devasa toz fırtınasında güneş ışığı kesilince pilleri tükendi ve Perseverance Vadisi'nde sessizliğe gömüldü.",
      "desc_en": "Planned for 90 days, Opportunity survived 15 years and covered 45.16 km. In 2018, an all-encompassing martian dust storm blotted out the sun, sending its final telemetry: 'My battery is low and it's getting dark.'"
    },
    "locationName_en": "Meridiani Planum (Perseverance Valley)",
    "discardedItems_en": [
      "Opportunity Mars Exploration Rover (MER-B) Chassis",
      "45.16 km Wheel Track Trajectory Across Meridiani Planum",
      "Pancam and Microscopic Imager Mast Assembly",
      "Miniature Thermal Emission Spectrometer (Mini-TES)",
      "Rock Abrasion Tool (RAT - diamond grind bit worn down)",
      "High-Gain Steerable Parabolic Antenna"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "185 kg",
      "powerSource": "Triple-Junction Solar Array (Silenced by 2018 global dust storm)",
      "activeDuration": "5,111 sols (14 years 138 days — 45.16 km traversed)",
      "coordinatesReadable": "2°14'42\" S, 5°20'42\" W"
    }
  },
  {
    "id": "phoenix-lander",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Delta II 7925 / Mars Kutup Bölgesi Sabit İniş Aracı & Robotik Kazıcı Kol",
    "craftType_en": "Delta II 7925 / Mars Arctic Stationary Lander & Robotic Excavation Arm",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Phoenix Mars İniş Aracı: Kutup Buzunun Altında Ezilen Kaşif",
    "name_en": "Phoenix Mars Lander: Crushed Beneath Polar Dry Ice",
    "mission": "Phoenix",
    "date": "25 Mayıs 2008",
    "date_en": "May 25, 2008",
    "decade": "2000",
    "category": "lander",
    "category_tr": "Kutup İniş İstasyonu & Kazıcı Kol",
    "category_en": "Polar Lander & Trench Digger",
    "coords": {
      "lat": 68.2188,
      "lng": -125.7492
    },
    "locationName": "Vastitas Borealis (Green Valley)",
    "modelType": "lander",
    "headline_tr": "Mars'ta İlk Kez Gerçek Su Buzunu Kazan ve Kuru Buz Kütlelerinin Altında Can Veren İstasyon",
    "headline_en": "First to Dig and Taste True Martian Water Ice, Then Entombed by Carbon Dioxide Glaciers",
    "quote_tr": "Buz bulduk! Kazdığımız çukurdaki beyaz materyal buharlaştı; bu kesinlikle saf su buzu!",
    "quote_en": "We have found ice! The white material in the trench sublimated; it is undeniable water ice!",
    "quoteAuthor": "Peter Smith (Phoenix Baş Araştırmacısı)",
    "story_tr": "Phoenix, Mars'ın zifiri soğuk kuzey kutup dairesine inen ilk uzay aracıydı. Görevi, yüzeyin hemen altındaki permafrost (donmuş toprak) tabakasına ulaşıp su buzu olup olmadığını kanıtlamaktı.\n\nRobotik kepçesiyle 'Snow White' (Pamuk Prenses) adını verdiği siperleri kazdı. Açılan çukurun dibinde parlak beyaz bir katman belirdi; birkaç gün içinde bu beyaz parçalar süblimleşerek (buharlaşarak) kayboldu. Bu, Mars'ta su buzunun varlığının ilk doğrudan kanıtıydı! Ayrıca Phoenix toprağı fırınlarında eriterek magnezyum, sodyum ve perklorat tuzları tespit etti.\n\nAncak kutup kışı yaklaşıyordu. Güneş gökyüzünde alçaldı ve aylar süren kutup gecesi başladı. Sıcaklık -125°C'ye düştü. Mars'ın atmosferindeki karbondioksit donarak devasa kuru buz tabakaları halinde Phoenix'in üzerine çöktü. 2010 yılında MRO uydusu yukarıdan baktığında, Phoenix'in güneş panellerinin yüzlerce kilo kuru buzun ağırlığı altında kırılıp büküldüğünü fotoğrafladı.",
    "story_en": "Phoenix touched down in the far northern plains of Vastitas Borealis. Its backhoe arm trenched into the soil, exposing gleaming white slabs of water ice that sublimated over subsequent days—conclusive proof of arctic permafrost. As polar winter enveloped the region, carbon dioxide froze out of the atmosphere. Crushed beneath hundreds of kilograms of solid dry ice, Phoenix's solar arrays buckled and snapped.",
    "whyAbandoned_tr": "Mars kuzey kutup kışının karanlığı ve üzerine yağan yüzlerce kiloluk katı karbondioksit (kuru buz) kütlesi aracın iskeletini ezdi.",
    "whyAbandoned_en": "Stationary polar craft; crushed structurally under hundreds of pounds of freezing carbon dioxide (dry ice) during polar night.",
    "currentCondition_tr": "Kuzey ovalarında güneş panelleri çökmüş ve mekanik iskeleti kırılmış vaziyette donuk kutup toprağında yatmaktadır.",
    "currentCondition_en": "Photographed by MRO HiRISE with one collapsed solar wing and severe structural ice load damage in Vastitas Borealis.",
    "discardedItems": [
      "Phoenix İniş Gövdesi ve TEGA Termal Analiz Fırını",
      "2.35 metrelik Robotik Kazıcı Kol",
      "Kırılmış Dairesel Bio-Solar Güneş Panelleri",
      "Yere Atılan Radar ve Isı Kalkanı"
    ],
    "technicalSpecs": {
      "massLeftKg": "350 kg kuru iniş gövdesi",
      "powerSource": "Katlanabilir Dairesel Güneş Panelleri",
      "activeDuration": "157 sol kutup görevi",
      "coordinatesReadable": "68°13'8\" K, 125°44'57\" B"
    },
    "audioSnippet": "[Phoenix Robotic Arm Digging Motor Sound Telemetry]",
    "realPhotos": [],
    "locationName_en": "Vastitas Borealis (Green Valley)",
    "discardedItems_en": [
      "Phoenix Polar Lander Hexagonal Body & Three Landing Struts",
      "2.35m Robotic Arm & Ice Trenching Rotary Drill",
      "Thermal and Evolved-Gas Analyzer (TEGA) Mass Spectrometer Ovens",
      "Microscopy, Electrochemistry, and Conductivity Analyzer (MECA)",
      "Crushed Circular Ultraflex Solar Panels (Damaged by Martian winter dry ice)",
      "Canadian Space Agency Meteorological Lidar Station Mast"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "350 kg (lander dry mass)",
      "powerSource": "Twin Circular Ultraflex Solar Arrays",
      "activeDuration": "157 sols (5 months polar summer)",
      "coordinatesReadable": "68°13'12\" N, 125°44'56\" W"
    }
  },
  {
    "id": "curiosity-skycrane",
    "body": "mars",
    "landingStatus": "crashed",
    "landingStatus_tr": "KİNETİK ÇARPIŞMA / KAZA SAHASI",
    "landingStatus_en": "KINETIC IMPACT / CRASH SITE",
    "craftType_tr": "Atlas V 541 / Curiosity Gökyüzü Vinci (Sky Crane) Hidrazin Roket Kademesi",
    "craftType_en": "Atlas V 541 / Curiosity Sky Crane Hydrazine Rocket Descent Stage",
    "vrAllowed": false,
    "vrDisallowReason_tr": "Curiosity Sky Crane kademesi, yüzeye gezgini indirdikten sonra motorlarını ateşleyerek uzaklaşmış ve 160 km/s hızla çarparak enkaz oluşturmuştur. Bir kaza ve çarpışma alanı olduğundan VR yüzey yürüyüşü engellenmiştir.",
    "vrDisallowReason_en": "The Sky Crane descent stage throttled its thrusters and flew away, crashing into Mars at ~160 km/h to create a crash debris field. Because this is an impact wreck, VR surface walk is disabled.",
    "name_tr": "Curiosity 'Gökyüzü Vinci' (Sky Crane) Çarpma Noktası",
    "name_en": "Curiosity 'Sky Crane' Rocket Descent Stage Impact Site",
    "mission": "Mars Science Laboratory",
    "date": "6 Ağustos 2012",
    "date_en": "August 6, 2012",
    "decade": "2010",
    "category": "shield",
    "category_tr": "Gökyüzü Vinci & Isı Kalkanı Enkazı",
    "category_en": "Sky Crane & Heat Shield Debris",
    "coords": {
      "lat": -4.5895,
      "lng": 137.4417
    },
    "locationName": "Gale Krateri (Aeolis Palus)",
    "modelType": "skycrane",
    "headline_tr": "1 Tonluk Bir Canavarı Kablolarla Mars Tozuna İndirip Kendini Feda Eden Roket Platformu",
    "headline_en": "The Rocket Platform That Lowered a 1-Ton Monster via Nylon Tethers and Sacrificed Itself",
    "quote_tr": "Tekerlekler yere değdi! Gökyüzü vinci kabloları kesti ve uzaklaşıp güvenli şekilde çakıldı!",
    "quote_en": "Touchdown confirmed! We're safe on Mars! Sky Crane has flown away to impact site.",
    "quoteAuthor": "Allen Chen (JPL Uçuş Dinamiği Mühendisi)",
    "story_tr": "Curiosity bir ton ağırlığında, bir araba büyüklüğündeydi. Mars'ın ince atmosferinde geleneksel paraşütler veya hava yastıkları bu devi durduramazdı. NASA mühendisleri 'Yedi Dakikalık Dehşet' olarak bilinen çılgınca bir sistem tasarladı: Roket motorlu Gökyüzü Vinci (Sky Crane).\n\nAtmosfere saniyede 5.9 kilometre hızla giren ısı kalkanı atıldı, dev süpersonik paraşüt açıldı. Yere 1.6 kilometre kala Sky Crane serbest kaldı ve 8 adet roket motorunu ateşleyerek Mars göğünde havada asılı kaldı.\n\nCuriosity'yi üç adet çelik/naylon kabloyla 20 metre aşağıya nazikçe sarkıttı. Gezginin altı tekerleği Mars kayalarına temas ettiği mikrosaniyede patlayıcı cıvatalar kabloları kesti. Sky Crane roketlerini tam güç ateşleyerek Curiosity'nin üzerine düşmemek için derhal 650 metre kuzeybatıya fırladı ve saatte 160 km hızla kayalara çarparak dev bir ateş topu halinde patladı.",
    "story_en": "Weighing nearly a metric ton, Curiosity was too massive for airbags. NASA devised the revolutionary rocket-powered Sky Crane. Hovering 20 meters above the red sand, it lowered the rover on nylon bridles. The instant wheels touched ground, pyro-cutters severed the tethers. The Sky Crane throttled to maximum thrust, darting 650 meters away to crash in a sacrificial explosion.",
    "whyAbandoned_tr": "Gezgini güvenle indirdikten sonra üzerine çökmemesi için planlı şekilde uzağa uçurulup kaza ettirildi.",
    "whyAbandoned_en": "Intentional fly-away maneuver to ensure the rocket plume and impact did not damage the primary rover.",
    "currentCondition_tr": "Gale Krateri'nin Aeolis Palus düzlüğünde, yanmış hidrazin yakıt izleri ve parçalanmış karbon kompozit gövde enkazı olarak yayılmıştır.",
    "currentCondition_en": "Blackened burn-scars from hypergolic propellant and twisted carbon-composite debris field visible on orbital HiRISE images.",
    "discardedItems": [
      "Sky Crane İniş Kademesi Roket Gövdesi",
      "8 Adet Mars Lander Kısılabilir Sıvı Roket Motoru (MLE)",
      "Curiosity'nin 4.5 metrelik Aeroshell Isı Kalkanı (1.5 km ötede)",
      "Dev Süpersonik Paraşüt ve Sırt Kabuğu (Backshell)"
    ],
    "technicalSpecs": {
      "massLeftKg": "Sky Crane: 1,070 kg + Isı Kalkanı: 385 kg + Paraşüt: 100 kg",
      "powerSource": "Kinetik Çarpışma (Hidrazin yakıt tüketimi sonrası)",
      "activeDuration": "Çarpma anı: 6 Ağustos 2012 05:17 UTC",
      "coordinatesReadable": "4°35'22\" G, 137°26'30\" D"
    },
    "audioSnippet": "[Curiosity Sky Crane Fly-away Confirmation Telemetry]",
    "realPhotos": [
      {
        "title_tr": "HiRISE Uydusundan Gökyüzü Vinci Çarpma Krateri",
        "title_en": "HiRISE View of Sky Crane Impact Crater",
        "catalogId": "NASA PIA19159 / HiRISE",
        "instrument": "Mars Reconnaissance Orbiter HiRISE",
        "url": "assets/photos/curiosity_skycrane_crash.jpg",
        "desc_tr": "MRO uydusundan çekilen bu karede, Sky Crane'in 650 metre öteye fırlayıp yere çakıldığı nokta, yakıt yanık izi ve enkaz saçılımı net şekilde görülmektedir.",
        "desc_en": "High-resolution orbital image from HiRISE showing the dark scorch mark and impact scar where the Sky Crane crashed 650m from Curiosity."
      }
    ],
    "secretRelic": {
      "badge_tr": "💥 650 METRE İLERİDEKİ ENKAZ ALANI",
      "badge_en": "💥 CRASH SCARS 650 METERS NORTHWEST",
      "title_tr": "Curiosity'yi Kurtarmak İçin Kendini Feda Eden Kahraman",
      "title_en": "The Sacrificial Rocket Platform That Saved Curiosity",
      "desc_tr": "Gezginin tekerlekleri yere değdiği mikrosaniyede patlayıcı cıvatalar kordonları kesti. Sky Crane roketlerini tam güç ateşleyerek uzağa fırladı ve saatte 160 km hızla yere çakıldı. Bu fedakarlık olmasaydı Curiosity roket motorlarının alevleri ve dumanı altında hasar görecekti.",
      "desc_en": "The instant wheels touched ground, pyro-cutters severed the tethers. The Sky Crane throttled to maximum thrust, darting 650 meters away to crash in a sacrificial explosion."
    },
    "locationName_en": "Gale Crater (Aeolis Palus)",
    "discardedItems_en": [
      "Curiosity Descent Stage Rocket Cradle (Sky Crane)",
      "8 x Mars Lander C-Engine Hydrazine Thrusters (400N each)",
      "Kevlar Rover Lowering Bridle and Data Cord Severed Remains",
      "Radar Altimeter Antenna and Inertial Measurement Unit",
      "Titanium Fuel Tanks and Impact Shrapnel Field"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "~829 kg (Sky Crane descent stage structure)",
      "powerSource": "Kinetic Impact after rocket fuel exhaustion",
      "activeDuration": "Impact timestamp: August 6, 2012 05:17 UTC",
      "coordinatesReadable": "4°34'59\" S, 137°24'0\" E"
    }
  },
  {
    "id": "insight-lander",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Atlas V 401 / InSight Jeofizik Mars İniş Aracı & SEIS Sismometre İstasyonu",
    "craftType_en": "Atlas V 401 / InSight Geophysical Mars Lander & SEIS Seismometer Station",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "InSight Sismoloji İstasyonu: 'Mars'ın Kalp Atışlarını Dinleyen Robot'",
    "name_en": "InSight Seismology Station: 'Listening to Mars's Heartbeat'",
    "mission": "InSight",
    "date": "26 Kasım 2018",
    "date_en": "November 26, 2018",
    "decade": "2010",
    "category": "lander",
    "category_tr": "Sismoloji İstasyonu & Köstebek Delgisi",
    "category_en": "Seismology Station & Heat Probe",
    "coords": {
      "lat": 4.502,
      "lng": 135.623
    },
    "locationName": "Elysium Planitia (Mars Ekvatoru)",
    "modelType": "lander",
    "headline_tr": "1.300 Mars Depremini Kaydeden ve Toz Tabakasının Altında Can Veren Dinleyici",
    "headline_en": "Recorded Over 1,300 Marsquakes Before Suffocating Under a Blanket of Dust",
    "quote_tr": "Gücüm gerçekten çok azaldı, bu gönderebildiğim son görüntü olabilir. Endişelenmeyin: burada geçirdiğim zaman hem üretken hem de huzurluydu.",
    "quote_en": "My power's really low, so this may be the last image I can send. Don't worry though: my time here has been both productive and serene.",
    "quoteAuthor": "InSight'ın Dünya'ya gönderdiği veda mesajı (Aralık 2022)",
    "story_tr": "InSight (Interior Exploration using Seismic Investigations, Geodesy and Heat Transport), Mars'ın derin iç yapısını incelemek için tasarlanmış özel bir jeofizik laboratuvarıydı. 2018'de Elysium Planitia'nın dümdüz ovalarına indi.\n\nYüzeye SEIS adında ultra-hassas bir Fransız sismometresi ve 'Köstebek' (Mole) adında ısı akısı sondası yerleştirdi. Dört yıl boyunca Mars'ın bağrından gelen 1.319 'Mars depremini' (marsquake) ve meteor çarpmalarını dinledi. Mars'ın çekirdeğinin sıvı olduğunu, mantosunun kalınlığını ve kabuğunun tabakalarını Dünya'ya bildirdi.\n\nAncak InSight tekerleksiz sabit bir araçtı ve güneş panellerini silkeleyecek bir mekanizması yoktu. Yıllar geçtikçe rüzgarlar panellerin üzerini santimlerce Mars tozuyla kapladı. Ürettiği elektrik 5.000 watt-saatten 285 watt-saate kadar düştü. 15 Aralık 2022'de son fotoğrafını çekip Dünya'ya veda etti.",
    "story_en": "InSight listened to the deep interior of Mars using its SEIS ultra-sensitive seismometer. Over 4 years, it detected 1,319 marsquakes, revealing Mars's liquid core and crustal layers. Lacking wipers or robotic arm brushes, martian dust slowly choked its massive solar wings. In December 2022, its energy plummeted to single digits, transmitting its poignant farewell image before succumbing to total blackout.",
    "whyAbandoned_tr": "Güneş panellerinin toza gömülmesi sonucu piller şarj olamadı; bilgisayarı derin uyku modundan çıkamadı.",
    "whyAbandoned_en": "Irreversible accumulation of atmospheric dust on solar arrays starved the lander of power; telemetry lost Dec 2022.",
    "currentCondition_tr": "Elysium Planitia'nın pürüzsüz zemininde, sismometre kubbesi ve toz kaplı ikiz disk güneş panelleriyle heykel gibi durmaktadır.",
    "currentCondition_en": "Perched motionless on Elysium Planitia; SEIS dome sits on the dirt alongside the lander's dust-shrouded disc panels.",
    "discardedItems": [
      "InSight İniş Platformu Gövdesi",
      "SEIS (Sismik İç Yapı Deneyi) Rüzgar ve Termal Kalkanı",
      "HP3 'Köstebek' Isı Sondası (yarı gömülü)",
      "Robotik Dağıtım Kolu ve Enstrüman Kameraları"
    ],
    "technicalSpecs": {
      "massLeftKg": "358 kg iniş istasyonu",
      "powerSource": "2 x 2.2m UltraFlex Güneş Paneli",
      "activeDuration": "1,445 sol (4 yıl, 1 ay)",
      "coordinatesReadable": "4°30'7\" K, 135°37'23\" D"
    },
    "audioSnippet": "[InSight Real Audio Recording of Martian Wind & Marsquake M4.2]",
    "realPhotos": [],
    "locationName_en": "Elysium Planitia (Mars Equator)",
    "discardedItems_en": [
      "InSight Geophysical Lander Hexagonal Body & Shock Struts",
      "SEIS (Seismic Experiment for Interior Structure) French Ultra-Sensitive Dome",
      "HP3 'The Mole' Heat Flow and Physical Properties Probe",
      "Twin 2.15-meter UltraFlex Solar Arrays (Thickly coated with red iron dust)",
      "Robotic Instrument Deployment Arm (IDA)",
      "TWINS Weather and Wind Sensor Booms"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "358 kg",
      "powerSource": "Twin 2.15m UltraFlex Solar Arrays (Dust depleted)",
      "activeDuration": "1,440 sols (Over 4 years, detected 1,319 marsquakes)",
      "coordinatesReadable": "4°30'9\" N, 135°37'24\" E"
    }
  },
  {
    "id": "perseverance-backshell-chute",
    "body": "mars",
    "landingStatus": "crashed",
    "landingStatus_tr": "KİNETİK ÇARPIŞMA / KAZA SAHASI",
    "landingStatus_en": "KINETIC IMPACT / CRASH SITE",
    "craftType_tr": "Atlas V 541 / Mars 2020 EDL Koruyucu Arka Gövde & Süpersonik Naylon Paraşüt Enkazı",
    "craftType_en": "Atlas V 541 / Mars 2020 EDL Jettisoned Backshell & Supersonic Parachute Debris",
    "vrAllowed": false,
    "vrDisallowReason_tr": "Perseverance arka gövdesi ve 21.5 metrelik paraşütü iniş esnasında atılmış ve Mars yüzeyine 126 km/s hızla çarparak enkaz oluşturmuştur. Kaza/çarpışma enkazı sahası olduğu için VR yüzey yürüyüşü engellenmiştir.",
    "vrDisallowReason_en": "The Perseverance EDL backshell and supersonic parachute were jettisoned and slammed into Mars at ~126 km/h. As a crash debris wreckage site, VR surface walk is disabled.",
    "name_tr": "Perseverance Sırtlığı ve Süpersonik Paraşütü",
    "name_en": "Perseverance Backshell and Supersonic Parachute",
    "mission": "Mars 2020 (Perseverance)",
    "date": "18 Şubat 2021",
    "date_en": "February 18, 2021",
    "decade": "2020",
    "category": "shield",
    "category_tr": "Sırt Gövdesi & Süpersonik Paraşüt",
    "category_en": "Backshell & Supersonic Parachute",
    "coords": {
      "lat": 18.4447,
      "lng": 77.4508
    },
    "locationName": "Jezero Krateri",
    "modelType": "shield",
    "headline_tr": "Uçan Daire Gibi Kum Tepelerine Çakılan Arka Koruma Kabuğu",
    "headline_en": "A Sci-Fi Flying Saucer Crash in the Martian Dunes Surveyed from the Air",
    "quote_tr": "Bize bilim kurgu filmlerinden fırlamış bir uzay gemisi enkazı gibi göründü.",
    "quote_en": "It has sci-fi elements to it. It exudes superhero, if you will, or looks like a crashed alien craft.",
    "quoteAuthor": "Ian Clark (JPL İniş Paraşütü Sistem Mühendisi)",
    "story_tr": "18 Şubat 2021'de Perseverance gezgini Jezero Krateri'ne inerken, Dünya tarihinin en büyük gezegenler arası paraşütünü kullandı (21.5 metre çapında, 'Dare Mighty Things' gizli mors kodlu desene sahip paraşüt).\n\nYere 2.1 kilometre kala paraşüt ve koni şeklindeki koruyucu sırtlık (backshell) Sky Crane'den ayrıldı. Saatte 126 km hızla krater tabanındaki kum tepelerine çarparak paramparça oldu.\n\nNisan 2022'de, küçük Ingenuity helikopteri 26. uçuşunda bu enkazın üzerinden uçtu ve havadan inanılmaz fotoğraflar çekti. Fotoğraflarda konik sırtlığın parçalanmış kompozit gövdesi, kopan yüksek dayanımlı süspansiyon halatları ve 21 metrelik turuncu-beyaz paraşütün çöl kumlarındaki kıvrımları Hollywood filmlerindeki düşmüş bir uzay gemisi gibi tüm ihtişamıyla görüntülendi.",
    "story_en": "Perseverance used the largest supersonic parachute ever deployed outside Earth (21.5 meters wide, containing binary code for 'Dare Mighty Things'). Jettisoned at 2.1 km altitude, the backshell hit the dunes at 126 km/h. In April 2022, the Ingenuity helicopter flew over the crash site on Flight 26, capturing striking aerial photos of the shattered cone, suspension cables, and the intact canopy draped across the ripples like a fallen sci-fi vessel.",
    "whyAbandoned_tr": "İniş profilinin standart ayrılma donanımı; aerodinamik frenleme sonrası kazaen yere bırakıldı.",
    "whyAbandoned_en": "Standard entry-descent-landing jettison hardware; impacted safely away from the rover.",
    "currentCondition_tr": "Konik sırtlık ezilmiş ve dikey olarak kuma batmış durumdadır; naylon paraşüt kumaşı Jezero rüzgarlarında hafifçe dalgalanmaktadır.",
    "currentCondition_en": "Backshell fractured upon high-speed dune impact; pristine orange-and-white nylon chute lies outstretched across Jezero ripples.",
    "discardedItems": [
      "Perseverance Koruyucu Sırt Gövdesi (Backshell)",
      "21.5 metrelik Süpersonik Naylon/Kevlar Paraşüt",
      "Kevlar Taşıyıcı Askı Halatları",
      "Ayrılma İticileri ve Piromekanik Kilitler"
    ],
    "technicalSpecs": {
      "massLeftKg": "Backshell: ~320 kg + Paraşüt: ~88 kg",
      "powerSource": "Kinetik Çarpışma",
      "activeDuration": "Çarpma anı: 18 Şubat 2021 20:53 UTC",
      "coordinatesReadable": "18°26'41\" K, 77°27'3\" D"
    },
    "audioSnippet": "[Perseverance EDL Supersonic Chute Deployment Sonic Boom]",
    "realPhotos": [
      {
        "title_tr": "Ingenuity Uçuşundan Sırtlık ve Süpersonik Paraşüt Enkazı",
        "title_en": "Ingenuity Aerial View of Backshell & Parachute Debris",
        "catalogId": "NASA PIA25287 / Ingenuity RTE",
        "instrument": "Ingenuity Renkli Havadan Keşif Kamerası (RTE)",
        "url": "assets/photos/perseverance_backshell.jpg",
        "desc_tr": "Ingenuity 26. uçuşunda, Perseverance'ın Mars atmosferine giriş sırasında saatte binlerce km hızla ayrılan sırt kapağının ve süpersonik paraşütünün parçalanmış enkazını gökyüzünden fotoğrafladı.",
        "desc_en": "Ingenuity captured detailed aerial reconnaissance of Perseverance's shattered backshell and supersonic parachute wreckage during Flight 26."
      }
    ],
    "locationName_en": "Jezero Crater",
    "discardedItems_en": [
      "Perseverance Protective Backshell Cone",
      "21.5-Meter Supersonic Nylon/Kevlar Parachute Canopy ('Dare Mighty Things' coded)",
      "Parachute Mortar Pack and Suspension Line Rigging",
      "Thermal Blanket Insulation and Structural Honeycomb Fragments",
      "Photographed by Ingenuity Helicopter During Flight 26"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "Backshell: ~320 kg + Parachute: ~88 kg",
      "powerSource": "Kinetic Impact",
      "activeDuration": "Impact timestamp: February 18, 2021 20:53 UTC",
      "coordinatesReadable": "18°26'41\" N, 77°27'3\" E"
    }
  },
  {
    "id": "ingenuity-helicopter",
    "body": "mars",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ (72 BAŞARILI UÇUŞ)",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING (72 HISTORIC FLIGHTS)",
    "craftType_tr": "Atlas V 541 (Taşıyıcı) / Otonom Güneş Enerjili Çift Pervaneli Mars Helikopteri",
    "craftType_en": "Atlas V 541 (Carrier) / Autonomous Solar-Powered Coaxial Mars Rotorcraft",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Ingenuity Mars Helikopteri ('Ginny'): Valinor Tepeleri Anıtı",
    "name_en": "Ingenuity Mars Helicopter ('Ginny'): The Monument at Valinor Hills",
    "mission": "Mars 2020 (Ingenuity)",
    "date": "18 Ocak 2024 (Son Uçuş)",
    "date_en": "January 18, 2024 (Final Flight)",
    "decade": "2020",
    "category": "helicopter",
    "category_tr": "Gezegenler Arası İlk Helikopter",
    "category_en": "First Interplanetary Rotorcraft",
    "coords": {
      "lat": 18.4238,
      "lng": 77.4388
    },
    "locationName": "Jezero Krateri (Valinor Tepeleri)",
    "modelType": "helicopter",
    "headline_tr": "Başka Bir Dünyanın Göğünde Uçan İlk İnsan Yapımı Hava Aracı: 72 Uçuşun Ardından Ebedi İstirahat",
    "headline_en": "First Powered Flight on Another World: Forever Resting at Valinor Hills After 72 Triumphant Flights",
    "quote_tr": "Wright Kardeşler anı tamamlandı. Ingenuity görevini tamamladı ama onun açtığı gökyüzü kapısı sonsuza dek açık kalacak.",
    "quote_en": "The Wright Brothers moment is complete. Ingenuity has flown its last flight on Mars, but the path it blazed will endure forever.",
    "quoteAuthor": "Bill Nelson (NASA Yöneticisi - Ocak 2024)",
    "story_tr": "Mars'ın atmosferi Dünya atmosferinin sadece %1'i yoğunluğundadır (Dünya'da 30.000 metre irtifaya eşdeğer). Birçok mühendis Mars'ta bir pervaneli hava aracının asla uçamayacağını iddia ediyordu.\n\n19 Nisan 2021'de sadece 1.8 kilogramlık minik Ingenuity, dakikada 2.400 devir dönen karbon fiber pallerini çalıştırdı ve Mars göğüne 3 metre yükselerek insanlık tarihinin başka bir gezegendeki İLK motorlu kontrollü uçuşunu gerçekleştirdi. Kanadının altına 1903 Wright Kardeşler uçağının kanadından bir parça kumaş iliştirilmişti!\n\nYalnızca 5 gösteri uçuşu yapması planlanırken, akıl almaz bir başarı göstererek tam 72 uçuş yaptı, 17 kilometre mesafe kat etti ve Perseverance'a hava keşif gözcülüğü yaptı.\n\n18 Ocak 2024'teki 72. uçuşunda, kum tepelerinin tekdüze ve referanssız yüzeyinde navigasyon kamerası şaşırınca sert bir iniş yaptı ve karbon fiber pallerinden biri kırıldı. Motorları artık onu uçuramasa da sistemleri hala çalışıyor. Ingenuity bugün 'Valinor Tepeleri'nde dimdik durarak her gün Mars hava durumunu kaydeden ve geleceğin astronotlarını bekleyen ebedi bir anıttır.",
    "story_en": "With Mars's atmosphere at just 1% Earth's density, flying seemed impossible. Yet on April 19, 2021, the 1.8 kg Ingenuity rotorcraft spun its carbon-fiber blades at 2,400 RPM to achieve the first powered, controlled flight on another world—carrying a tiny swatch of muslin from the Wright Brothers' 1903 Flyer. Planned for 5 test flights, it accomplished 72 flights spanning 17 km! On Flight 72, a bland sandy landscape caused a navigation anomaly during landing, snapping a rotor blade tip. Ginny stands upright at Valinor Hills, serving as a permanent weather station awaiting future astronauts.",
    "whyAbandoned_tr": "72. uçuşta navigasyon kaybı sonucu sert iniş yaparak rotor pallerinden birini kırması; aerodinamik uçuş yeteneğini kaybetti.",
    "whyAbandoned_en": "Rotor blade tip fractured during landing on Flight 72 over featureless sand dunes, precluding further aerodynamic flight.",
    "currentCondition_tr": "Dört ince karbon ayağı üzerinde dimdik ayaktadır. Güneş paneli her gün bataryasını şarj etmekte, yerleşik aviyonikleri günlük hava sıcaklığı telemetrisini kaydetmektedir.",
    "currentCondition_en": "Stands upright on its four carbon-composite legs at Valinor Hills. Solar cell continues to recharge its avionics, logging daily surface temperatures.",
    "discardedItems": [
      "Ingenuity Helikopter Gövdesi ve Aviyonik Kutusu",
      "Kırılmış Karbon Fiber Rotor Pervanesi",
      "Wright Kardeşler 1903 'Flyer' Kumaş Parçacığı",
      "Güneş Paneli ve Lityum-İyon Batarya Paketi"
    ],
    "technicalSpecs": {
      "massLeftKg": "1.8 kg",
      "powerSource": "Entegre Güneş Paneli + 6 x Sony Li-ion hücre (350W peak)",
      "activeDuration": "72 uçuş (128.8 dakika havada kalış, 17.0 km toplam uçuş)",
      "coordinatesReadable": "18°25'26\" K, 77°26'20\" D"
    },
    "audioSnippet": "[Ingenuity Rotorcraft High-Pitch Whine Telemetry Flight 72]",
    "realPhotos": [
      {
        "title_tr": "Ingenuity Mars Çölünde Tek Başına",
        "title_en": "Ingenuity Perched Alone on Mars",
        "catalogId": "NASA PIA24466",
        "instrument": "Perseverance Mastcam-Z",
        "url": "assets/photos/ingenuity_jezero.jpg",
        "desc_tr": "Perseverance gezgininin gözünden Jezero Krateri zemininde gururla duran minik hava kaşifi.",
        "desc_en": "Ingenuity rotorcraft photographed by Perseverance's Mastcam-Z standing solo on the floor of Jezero Crater."
      }
    ],
    "secretRelic": {
      "badge_tr": "✈️ 1903 WRIGHT KARDEŞLER UÇAĞININ KANAT KUMAŞI",
      "badge_en": "✈️ 1903 WRIGHT BROTHERS FLYER FABRIC SWATCH",
      "title_tr": "Dünya'nın İlk Uçağından Mars'ın İlk Uçağına Miras",
      "title_en": "From Kitty Hawk to the Skies of Mars",
      "desc_tr": "Ingenuity'nin güneş panelinin altındaki kablolara, Orville ve Wilbur Wright'ın 1903 yılında uçurduğu tarihin ilk motorlu uçağı 'Flyer'ın kanadından bir kumaş parçacığı bantlanmıştı. Bu kumaş bugün Mars'ın Valinor Tepeleri'nde ebediyen durmaktadır.",
      "desc_en": "Taped beneath Ingenuity's solar panel is a postage-stamp-sized swatch of muslin fabric from the wing of the 1903 Wright Brothers Flyer, uniting the first powered flight on Earth with the first powered flight on Mars."
    },
    "locationName_en": "Jezero Crater (Valinor Hills)",
    "discardedItems_en": [
      "Ingenuity Helicopter Fuselage and Avionics Enclosure",
      "Damaged Carbon Fiber Rotor Blade Tip (Crashed on Flight 72)",
      "Integrated Solar Panel and Micro Antenna",
      "4 Carbon Composite Landing Legs",
      "Return-to-Earth Data Log Battery Transmitter (Still logging avionics)",
      "Piece of 1903 Wright Brothers Flyer 1 Wing Fabric (Under solar panel)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "1.8 kg",
      "powerSource": "Integrated Solar Array + 6 x Sony Li-ion Cells (350W peak)",
      "activeDuration": "72 flights (128.8 minutes aloft, 17.0 km flown)",
      "coordinatesReadable": "18°25'26\" N, 77°26'20\" E"
    }
  },
  {
    "id": "venera-7",
    "body": "venus",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Molniya-M / Sovyet Titanyum Yüksek Basınç İniş Kapsülü (495 kg)",
    "craftType_en": "Molniya-M / Soviet Heavy Titanium High-Pressure Descent Capsule (495 kg)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Venera 7 İniş Sondası: Başka Bir Gezegene Tarihin İlk Yumuşak İnişi",
    "name_en": "Venera 7 Descent Capsule: Humanity's First Soft Landing on Another Planet",
    "mission": "Venera 7 (SSCB / IKI)",
    "date": "15 Aralık 1970",
    "date_en": "December 15, 1970",
    "decade": "1970",
    "category": "lander",
    "category_tr": "Yüksek Basınç Sondası",
    "category_en": "High-Pressure Capsule",
    "coords": {
      "lat": -5,
      "lng": 351
    },
    "locationName": "Guinevere Planitia (Venüs Ekvator Düzlüğü)",
    "modelType": "venera",
    "headline_tr": "90 Atmosfer Basınç ve 475°C Cehennemden Dünya'ya Gönderilen İlk Yüzey Sinyali",
    "headline_en": "The First Radio Signal Transmitted from Another Planet's Surface Under 90 Atmospheres",
    "quote_tr": "Venüs yüzeyi kurşunu eritecek kadar sıcak ve bir denizaltıyı 900 metre derinde ezecek kadar ağır bir atmosfere sahip.",
    "quote_en": "The surface of Venus is hot enough to melt lead, with a crushing pressure equivalent to 900 meters beneath Earth's oceans.",
    "quoteAuthor": "NASA SP-2021-4705 (50 Years of Solar System Exploration)",
    "story_tr": "Önceki Venera 4, 5 ve 6 sondaları Venüs'ün korkunç atmosfer basıncı nedeniyle henüz yere değmeden ezilmişti. Bunun üzerine mühendisler Venera 7'yi 180 atmosfer basınca ve 540°C sıcaklığa dayanabilecek küresel titanyum zırhla ürettiler.\n\n15 Aralık 1970'te Venera 7, sülfürik asit bulutlarını yarıp geçti. İnişin son anlarında paraşütü kısmen yırtıldı ve yüzeye 16.5 m/s hızla sertçe çarparak yan yattı. İlk başta sustuğu sanıldı; ancak manyetik bantların detaylı analizinde sondanın yüzeyden 23 dakika boyunca zayıf bir sıcaklık telemetrisi gönderdiği keşfedildi (475°C ± 20°C). Bu, insanlığın başka bir gezegenin yüzeyinden aldığı İLK veriydi.",
    "story_en": "After earlier probes were crushed mid-air, Venera 7 was forged from a solid titanium pressure hull rated to 180 bar. On December 15, 1970, its reefed parachute partially tore during final descent, causing a 16.5 m/s impact in Guinevere Planitia. Rolling onto its side, its antenna transmitted a faint signal for 23 minutes—recording a surface temperature of 475°C and marking humanity's first soft landing on another planet.",
    "whyAbandoned_tr": "Tek yönlü atmosferik dalış sondası olarak tasarlandı; aşırı yüksek sıcaklık (475°C) nedeniyle iç elektronik devreleri ve gümüş-çinko pilleri 23 dakika sonra eriyerek sustu.",
    "whyAbandoned_en": "One-way atmospheric entry capsule; extreme 475°C ambient heat overwhelmed its internal thermal insulation after 23 minutes on the surface.",
    "currentCondition_tr": "Küresel titanyum basınç gövdesi erime noktası (1,668°C) Venüs sıcaklığının çok üzerinde olduğu için hala Guinevere Planitia bazaltlarında yan yatmış halde durmaktadır; dış yalıtım ve paraşüt kalıntıları süperkritik karbondioksit atmosferinde kömürleşmiştir.",
    "currentCondition_en": "Its spherical titanium pressure vessel (melting point 1,668°C) remains intact on its side in Guinevere Planitia, though external cabling and parachute fabric carbonized immediately.",
    "discardedItems": [
      "Venera 7 Küresel Titanyum Basınç Kapsülü (490 kg)",
      "Darbe Emişli Alt Halka ve Kırılmış Helisel Anten",
      "Kömürleşmiş Fiberglas-Nitron Fren Paraşütü Kalıntıları",
      "Platin Dirençli Termometre ve Aneroid Barometre Sensörleri"
    ],
    "technicalSpecs": {
      "massLeftKg": "490 kg (iniş kapsülü)",
      "powerSource": "Kurşun-Çinko Akümülatör (önceden şarjlı)",
      "activeDuration": "35 dk atmosfer + 23 dk yüzey yayını",
      "coordinatesReadable": "5°00' G, 351°00' D"
    },
    "audioSnippet": "[Venera 7 Faint Carrier Telemetry — 475 Degrees Celsius Confirmed]",
    "realPhotos": [
      {
        "title_tr": "NASA Magellan Radar Haritasında Venüs Yüzeyi",
        "title_en": "NASA Magellan Radar Map of Venusian Plains",
        "catalogId": "NASA PIA00271",
        "instrument": "Magellan Synthetic Aperture Radar (SAR)",
        "url": "assets/photos/venera_magellan.jpg",
        "desc_tr": "NASA Magellan uydusunun yoğun bulutları radarla delerek görüntülediği Venüs volkanik düzlükleri ve Venera iniş havzası.",
        "desc_en": "Magellan radar imagery revealing the volcanic plains and tectonic ridges of Venus beneath its opaque sulfuric clouds."
      }
    ],
    "secretRelic": {
      "badge_tr": "🎖️ TİTANYUM ZIRH İMZA PLAKETİ",
      "badge_en": "🎖️ TITANIUM PRESSURE HULL INSIGNIA PENNANT",
      "title_tr": "Kurşunun Eridiği Yüzeyde Bükülmeyen Metal Anıt",
      "title_en": "An Indestructible Titanium Time Capsule in a Lead-Melting World",
      "desc_tr": "Venera 7'nin küresel zırhının içine yerleştirilen beşgen metal plaket, dışarıdaki 90 atmosferlik ezici basınca ve 475°C cehennem sıcağına rağmen titanyum küre içinde mühürlü olarak korunmaktadır.",
      "desc_en": "Sealed inside the high-strength titanium sphere rests a pentagonal commemorative pennant that survived the 90-bar crushing atmosphere."
    },
    "locationName_en": "Guinevere Planitia (Venus Equatorial Plains)",
    "discardedItems_en": [
      "Venera 7 Spherical Titanium Pressure Vessel (490 kg)",
      "Shock-Absorbing Base Ring and Buckled Helical Antenna",
      "Refrigerated Pre-Cooling System Core",
      "Internal Platinum Resistance Thermometers and Barometers",
      "Melted Parachute Suspension Rigging (Vaporized by 465°C atmosphere)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "490 kg (descent capsule)",
      "powerSource": "Lead-Zinc Battery (pre-charged)",
      "activeDuration": "35 min descent + 23 min surface transmission",
      "coordinatesReadable": "5°00' S, 351°00' E"
    }
  },
  {
    "id": "pioneer-venus-day",
    "body": "venus",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ (DARBEYE RAĞMEN SAĞ KALDI)",
    "landingStatus_en": "SUCCESSFUL SOFT TOUCHDOWN (SURVIVED IMPACT)",
    "craftType_tr": "Atlas SLV-3D Centaur / NASA Pioneer Venus Atmosferik Giriş Sondası",
    "craftType_en": "Atlas SLV-3D Centaur / NASA Pioneer Venus Atmospheric Entry Probe",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "NASA Pioneer Venus \"Day Probe\": İniş Takımı Olmadan Yüzeyde Hayatta Kalan Sonda",
    "name_en": "NASA Pioneer Venus \"Day Probe\": The Atmospheric Probe That Refused to Die on Impact",
    "mission": "Pioneer Venus Multiprobe (NASA ARC)",
    "date": "9 Aralık 1978",
    "date_en": "December 9, 1978",
    "decade": "1970",
    "category": "probe",
    "category_tr": "Atmosferik Küre Sondası",
    "category_en": "Atmospheric Spherical Probe",
    "coords": {
      "lat": -31.3,
      "lng": 317
    },
    "locationName": "Theia Mons Güney Düzlükleri (Venüs)",
    "modelType": "probe",
    "headline_tr": "Yere Çarptığında Parçalanması Beklenirken 67 Dakika Boyunca Yüzeyden Yayın Yapan NASA Mucizesi",
    "headline_en": "Designed Only for Atmospheric Descent, Yet Transmitted from the Venusian Surface for 67 Minutes",
    "quote_tr": "Hiçbir iniş ayağı veya paraşütü olmamasına rağmen sondamız Venüs yüzeyine çarptıktan sonra 67 dakika boyunca veri göndermeye devam etti.",
    "quote_en": "With no parachute or landing legs, our Day Probe hit the surface of Venus and astonishingly continued transmitting for 67 minutes.",
    "quoteAuthor": "Colin & Hall, NASA Ames Research Center (NASA SP-2021-4705)",
    "story_tr": "NASA'nın 1978 Pioneer Venus Multiprobe görevi, ana taşıyıcı (Bus) ve 4 atmosfer sondasından (1 Büyük Sonda + 3 Küçük Sonda: North, Night ve Day) oluşuyordu. Küçük sondaların hiçbirinde paraşüt veya darbe emici iniş ayağı yoktu; sadece atmosferden düşerken veri toplayıp yere çarptıklarında yok olmaları planlanmıştı.\n\nAncak 9 Aralık 1978'de yoğun karbondioksit atmosferi o kadar kalın ve ağdalıydı ki (deniz suyunun %6.5'i yoğunlukta!), sondaların düşüş hızı paraşütsüz bile saatte 35 kilometreye (9.8 m/s) kadar yavaşladı. \"Day Probe\" (Gündüz Sondası) ve \"Night Probe\" yüzeye çarptıktan sonra parçalanmadı! Özellikle Day Probe, 460°C sıcaklıkta pilinin son damlası tükenene kadar tam 67 dakika 37 saniye boyunca Venüs yüzeyinden doğrudan Dünya'ya sinyal gönderdi.",
    "story_en": "NASA's Pioneer Venus Multiprobe released four titanium-hulled atmospheric probes into Venus on December 9, 1978. The three Small Probes had no parachutes and were never intended to survive impact. Yet Venus's supercritical CO2 atmosphere was so dense that terminal velocity slowed to just 35 km/h. The 'Day Probe' survived touchdown intact and transmitted telemetry from the baking surface for 67 minutes and 37 seconds!",
    "whyAbandoned_tr": "Tek yönlü atmosferik dalış görevi; yüksek basınçlı iç bataryası yüzeydeki aşırı ısıda 67.5 dakika sonra tükendi.",
    "whyAbandoned_en": "One-way atmospheric entry probe; internal battery depleted after 67.5 minutes under 460°C surface heat.",
    "currentCondition_tr": "76 cm çapındaki konik aerodinamik ısı kalkanı ve içindeki titanyum basınç küresi ile elmas optik pencereleri Theia Mons güneyinde bozulmadan yatmaktadır.",
    "currentCondition_en": "Its 76-cm conical aeroshell, titanium pressure vessel, and pure diamond optical sensor windows remain intact in the southern plains.",
    "discardedItems": [
      "Pioneer Venus Day Probe Titanyum Basınç Küresi (90 kg)",
      "13.5 Karatlık Saf Elmas Kızılötesi Radyometre Penceresi",
      "Karbon-Fenolik Konik Isı Kalkanı Gövdesi",
      "Nephelometre (Bulut Parçacık Ölçer) ve Sıcaklık Sensörleri"
    ],
    "technicalSpecs": {
      "massLeftKg": "90 kg (Day Probe) + 290 kg (Large Probe)",
      "powerSource": "Gümüş-Çinko Batarya",
      "activeDuration": "56 dk iniş + 67 dk 37 sn yüzey yayını",
      "coordinatesReadable": "31°18' G, 317°00' D"
    },
    "audioSnippet": "[NASA Ames DSN Telemetry: Pioneer Venus Day Probe Surface Signal Locked]",
    "realPhotos": [
      {
        "title_tr": "Venüs Küresel Radar Topografyası (Pioneer & Magellan)",
        "title_en": "Venus Global Radar Topography",
        "catalogId": "NASA PIA00271",
        "instrument": "NASA Magellan / Pioneer Radar Mapper",
        "url": "assets/photos/venera_magellan.jpg",
        "desc_tr": "Pioneer Venus ve Magellan görevlerinin haritaladığı Venüs yüzey yükseltileri ve volkanik kuşaklar.",
        "desc_en": "Radar altimetry map of Venus compiled from NASA Pioneer Venus and Magellan orbital surveys."
      }
    ],
    "secretRelic": {
      "badge_tr": "💎 VENÜS YÜZEYİNDEKİ 13.5 KARATLIK ELMAS PENCERE",
      "badge_en": "💎 13.5-CARAT SOLID DIAMOND OPTICAL WINDOW ON VENUS",
      "title_tr": "Sülfürik Asit ve 470°C Isıya Dayanabilen Tek Şeffaf Madde: Saf Elmas",
      "title_en": "Cut from a 205-Carat Industrial Diamond to Survive Sulfuric Acid Clouds",
      "desc_tr": "Normal cam veya kuvars mercekler Venüs'ün kızgın sülfürik asit ve hidroflorik asit bulutlarında aşındığı için, NASA mühendisleri sondanın kızılötesi radyometre sensörü için 13.5 karatlık disk şeklinde saf bir elmas pencere üretti. O elmas bugün hala Venüs yüzeyinde parlamaktadır.",
      "desc_en": "Because ordinary glass corrodes in hot hydrofluoric and sulfuric acid, NASA fitted the probe with a custom 13.5-carat pure diamond optical window that still rests on the Venusian plains."
    },
    "locationName_en": "Theia Mons Southern Plains (Venus)",
    "discardedItems_en": [
      "Pioneer Venus Day Probe Titanium Pressure Sphere (90 kg)",
      "13.5-Carat Flawless Natural Diamond Infrared Radiometer Window",
      "Neutral Mass Spectrometer and Cloud Particle Spectrometer Inlets",
      "Internal Beryllium Heat-Sink Shell",
      "Upper Atmosphere Parachute and Release Ring (Separated high above)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "90 kg (Day Probe) + 290 kg (Large Probe)",
      "powerSource": "Silver-Zinc Battery",
      "activeDuration": "56 min descent + 67 min 37 sec surface transmission",
      "coordinatesReadable": "31°18' S, 317°00' E"
    }
  },
  {
    "id": "venera-13",
    "body": "venus",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Proton-K Blok D / Sovyet Ağır Yüzey İniş Aracı & Aerodinamik Fren Halkası (760 kg)",
    "craftType_en": "Proton-K Blok D / Soviet Heavy Surface Lander & Aerodynamic Brake Ring (760 kg)",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "Venera 13 İniş Sondası: Cehennemden İlk Renkli Panorama ve Rüzgar Sesi",
    "name_en": "Venera 13 Lander: First Color Panorama & Acoustic Recording from Venus",
    "mission": "Venera 13",
    "date": "1 Mart 1982",
    "date_en": "March 1, 1982",
    "decade": "1980",
    "category": "lander",
    "category_tr": "Ağır Gezegen İniş Aracı",
    "category_en": "Heavy Planetary Lander",
    "coords": {
      "lat": -7.5,
      "lng": 303
    },
    "locationName": "Phoebe Regio Doğusu (Venüs)",
    "modelType": "venera",
    "headline_tr": "457°C Sıcaklıkta 127 Dakika Direnerek Kehribar Gökyüzünü ve Bazalt Kayaları Fotoğraflayan Efsane",
    "headline_en": "Enduring 457°C and 89 Bar for 127 Minutes to Capture Amber Skies, Basalt Slabs, and Venusian Thunder",
    "quote_tr": "Kamera kapağı fırlatıldı; kehribar rengi yoğun gökyüzü altında koyu gri yassı bazalt kayalar ve ince Venüs toprağı göründü.",
    "quote_en": "The lens cap popped off, revealing flat dark-grey basaltic rock slabs beneath a dense, glowing amber sky.",
    "quoteAuthor": "Dr. Valery Barsukov, Venera Bilim Ekibi",
    "story_tr": "1 Mart 1982'de Phoebe Regio yaylasının doğusuna inen 760 kilogramlık Venera 13, gezegen keşif tarihinin en dayanıklı makinelerinden biriydi. 50 km irtifada paraşütünü bırakıp sadece yoğun karbondioksit havasını kesen aerodinamik fren diskiyle (aerobraking ring) süzülerek yüzeye indi.\n\nYüzey sıcaklığı 457°C, basınç ise Dünya'nın tam 89 katıydı (8.9 MPa). Yalnızca 32 dakika dayanması beklenirken, lityum-nitrat ısı emici jelleri sayesinde tam 127 dakika (2 saatten fazla!) hayatta kaldı. Kuvars pencereli çift telefoto kamerasıyla Venüs'ün ilk 360 derecelik renkli panoramik fotoğraflarını çekti, mekanik matkabıyla toprak örneği alıp X-ışını floresans spektrometresiyle (potasyumlu gabro bazaltı) analiz etti ve yerleşik mikrofonuyla başka bir gezegendeki İLK gerçek rüzgar ve sondaj seslerini kaydetti!",
    "story_en": "Touching down east of Phoebe Regio on March 1, 1982, the 760-kg Venera 13 lander shed its parachute at 50 km altitude and descended solely on its aerodynamic disk brake through the dense CO2 atmosphere. Designed to survive 32 minutes in 457°C heat and 89 bar pressure, it operated for a stunning 127 minutes—transmitting the first color panoramas of Venus, drilling and analyzing potassium-rich basaltic rock, and recording the first acoustic sounds on another world.",
    "whyAbandoned_tr": "Tek yönlü yüzey laboratuvarı; 127 dakikanın sonunda 457°C dış ısı titanyum kürenin iç sıcaklığını elektronik sınırın üzerine çıkardı.",
    "whyAbandoned_en": "One-way surface laboratory; after 127 minutes, ambient 457°C heat penetrated the phase-change thermal buffers.",
    "currentCondition_tr": "Titanyum basınç gövdesi, tırtıklı darbe emici iniş halkası, açılmış matkap kolu ve kameranın tam önüne düşen yarım silindir lens kapağı Phoebe Regio bazaltlarının üzerinde durmaktadır.",
    "currentCondition_en": "The titanium hull, serrated shock-absorbing torus ring, deployed soil drill arm, and ejected semi-cylindrical camera lens cap remain on the basalt slabs of Phoebe Regio.",
    "discardedItems": [
      "Venera 13 Titanyum Basınç Gövdesi ve Aerodinamik Fren Halkası (760 kg)",
      "Görüntüye Giren Efsanevi Yarım Silindir Kamera Lens Kapağı",
      "Yüzey Sondaj Matkabı (GZU) ve Toprak Mekanik Ölçüm Kolu",
      "Akustik Mikrofon ve Groza-2 Elektrik Boşalma Dedektörü"
    ],
    "technicalSpecs": {
      "massLeftKg": "760 kg (yüzey iniş aracı)",
      "powerSource": "Yüksek Kapasiteli Akümülatör Bataryası",
      "activeDuration": "127 dakika (beklenenin 4 katı)",
      "coordinatesReadable": "7°30' G, 303°00' D"
    },
    "audioSnippet": "[Venera 13 Acoustic Microphone: Low Roar of Dense Venusian Wind & Rock Drill]",
    "realPhotos": [
      {
        "title_tr": "Magellan Radarından Phoebe Regio & Venüs Volkanik Yüzeyi",
        "title_en": "Magellan Radar View of Venusian Volcanic Terrain",
        "catalogId": "NASA PIA00271",
        "instrument": "Magellan SAR Radar",
        "url": "assets/photos/venera_magellan.jpg",
        "desc_tr": "Venera 13'ün indiği bazaltik lav düzlüklerinin radar yansıma görüntüsü.",
        "desc_en": "Radar topography of the fractured basaltic plains of Venus."
      }
    ],
    "secretRelic": {
      "badge_tr": "📸 KAMERANIN ÖNÜNE DÜŞEN LENS KAPAĞI PARADOKSU",
      "badge_en": "📸 THE LENS CAP PARADOX OF VENERA 13 & 14",
      "title_tr": "4 Gün Arayla İnen İki Sondanın Başına Gelen İnanılmaz Tesadüf",
      "title_en": "Why Venera 14 Tested the Compressibility of Its Own Lens Cap",
      "desc_tr": "Venera 13'ün panoramik fotoğrafında yerde yarım silindir şeklinde beyaz bir parça görülür: Bu, piroteknik cıvatayla fırlatılan titanyum kamera kapağıdır. 4 gün sonra inen ikizi Venera 14'te ise bu kapak şanssızlık eseri tam toprak ölçüm kolunun altına düştü ve sonda Venüs toprağı yerine kendi lens kapağının sertliğini ölçtü!",
      "desc_en": "In Venera 13's famous panorama, the ejected white titanium lens cap sits right on the basalt floor. Four days later on Venera 14, the identical cap landed directly beneath the spring-loaded soil penetrometer—which faithfully measured the compressibility of its own lens cap instead of the rock!"
    },
    "locationName_en": "Phoebe Regio East (Venus)",
    "discardedItems_en": [
      "Venera 13 Titanium Pressure Body & Aerodynamic Braking Ring (760 kg)",
      "Legendary Camera Lens Cap (Ejected under mechanical arm, blocking rock test)",
      "Dynamic Penetrometer Soil Compressibility Testing Arm",
      "X-Ray Fluorescence Mineral Spectrometer Sample Drill Chamber",
      "Grooved Landing Shock Absorber Torus",
      "Acoustic Microphone (Recorded 127 minutes of Martian/Venusian wind sound)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "760 kg (surface lander)",
      "powerSource": "High-Capacity Rechargeable Battery",
      "activeDuration": "127 minutes (4x longer than design spec)",
      "coordinatesReadable": "7°30' S, 303°00' E"
    }
  },
  {
    "id": "cassini-huygens",
    "body": "outer",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Titan IVB Centaur / ESA Huygens Atmosferik Giriş Sondası & Yüzey Laboratuvarı",
    "craftType_en": "Titan IVB Centaur / ESA Huygens Atmospheric Entry Probe & Surface Lander",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "ESA/NASA Huygens Sondası: Titan'ın Sıvı Metan Yataklarındaki İniş Aracı",
    "name_en": "ESA/NASA Huygens Probe: Humanity's Farthest Touchdown on Saturn's Moon Titan",
    "mission": "Cassini-Huygens (NASA / ESA / ASI)",
    "date": "14 Ocak 2005",
    "date_en": "January 14, 2005",
    "decade": "2000",
    "category": "lander",
    "category_tr": "Dış Güneş Sistemi Sondası",
    "category_en": "Outer Solar System Lander",
    "coords": {
      "lat": -10.25,
      "lng": -192.32
    },
    "locationName": "Adiri / Shangri-La (Titan - Satürn'ün Uydusu)",
    "modelType": "huygens",
    "headline_tr": "Dünya'dan 1.2 Milyar Kilometre Uzakta, -179.5°C'de Metan Nehirlerinin ve Buz Çakıllarının Arasına İniş",
    "headline_en": "1.2 Billion Kilometers from Earth: Touching Down Among Rounded Water-Ice Cobbles at -179.5°C",
    "quote_tr": "Cassini-Huygens, NASA ve Avrupa Uzay Ajansı (ESA) arasındaki en büyük amiral gemisi ortaklığı olarak Dış Güneş Sistemi'nde ilk yüzey inişini başardı.",
    "quote_en": "Cassini-Huygens represented a flagship partnership between NASA and ESA, achieving the first touchdown in the outer solar system.",
    "quoteAuthor": "Linda Billings, Ed. (NASA SP-2021-4705: 50 Years of Solar System Exploration, s. 80)",
    "story_tr": "[Resmi Kaynak — NASA SP-2021-4705 \"50 Years of Solar System Exploration\", s. 79-80]: NASA'nın Cassini yörünge aracı ile Avrupa Uzay Ajansı'nın (ESA) Huygens sondası, 15 Ekim 1997'de fırlatıldı ve 7 yıllık yolculuğun ardından Satürn sistemine ulaştı. 25 Aralık 2004'te Cassini'den ayrılan 318 kilogramlık Huygens, 14 Ocak 2005'te Satürn'ün dev uydusu Titan'ın turuncu organik sisli atmosferine daldı.\n\n2 saat 27 dakika süren paraşütlü inişi boyunca metan yağmurlarının oyduğu nehir kanallarını, kıyı şeritlerini ve karanlık kumul ovalarını fotoğrafladı. Saat 12:43 UTC'de \"Shangri-La\" bölgesindeki Adiri kıyısına 4.6 m/s hızla, ıslak kil/kum kıvamında metanla doymuş bir zemine indi.\n\nİniş anında sarsıntıyla kamerasının önüne düşen 10-15 santimetrelik yuvarlak taşlar aslında kaya değil, sıvı metan akarsularında yuvarlanarak aşınmış ve -179.5°C'de granit kadar sertleşmiş SU BUZU çakıllarıydı! Huygens yüzeyden 72 dakika boyunca Cassini'ye veri aktardı ve pilleri bitene kadar çalışmaya devam etti.",
    "story_en": "[Official Citation — NASA SP-2021-4705 \"50 Years of Solar System Exploration\", pp. 79-80]: Deployed from NASA's Cassini orbiter, ESA's 318-kg Huygens probe entered Titan's golden nitrogen-methane haze on January 14, 2005. Descending by parachute for 2 hours 27 minutes, it imaged dendritic river networks carved by liquid methane rain before touching down in the damp hydrocarbon floodplains of Adiri (Shangri-La) at -179.5°C. Its surface camera revealed rounded 15-cm cobbles made of solid water ice, transmitting for 72 minutes before Cassini dropped below the horizon.",
    "whyAbandoned_tr": "Tek yönlü Dış Güneş Sistemi yüzey keşif sondası; 5 adet LiSO2 bataryası dondurucu -179.5°C soğukta yaklaşık 3.5 saat sonra tükendi.",
    "whyAbandoned_en": "One-way outer solar system lander; its five LiSO2 batteries depleted after ~3.5 hours in the cryogenic -179.5°C environment.",
    "currentCondition_tr": "Alüminyum petekli kubbe gövdesi, GCMS atmosfer analizörü, yüzey penetrometresi ve yakınına düşen naylon-kevlar paraşütü, Titan'ın oksijensiz ve dondurucu azot atmosferinde kimyasal paslanma olmadan ilk günkü gibi korunmaktadır.",
    "currentCondition_en": "Resting in oxygen-free cryogenic nitrogen at -179.5°C, the aluminum honeycomb descent module, penetrometer, and nearby parachute remain pristine without oxidation.",
    "discardedItems": [
      "Huygens Yüzey İniş Modülü (Descent Module - 199 kg)",
      "2.7 Metre Çaplı Bırakılmış Ön Isı Kalkanı (Front Shield) & Arka Kapak",
      "Üç Kademeli Dengeleyici ve Ana İniş Paraşütleri",
      "SSP (Surface Science Package) Akustik Sonar ve Penetrometre Çubuğu",
      "DISR Kameraları ve Yüzey Aydınlatma Lambası"
    ],
    "technicalSpecs": {
      "massLeftKg": "318 kg (toplam giriş kütlesi; ~199 kg iniş modülü)",
      "powerSource": "5 × LiSO2 (Lityum Sülfür Dioksit) Batarya (1.8 kWh)",
      "activeDuration": "2 sa 27 dk iniş + 72 dk yüzey rölesi",
      "coordinatesReadable": "10°15' G, 192°19' B (Shangri-La / Titan)"
    },
    "audioSnippet": "[Huygens Acoustic Sensor & Radar Echo: Liquid Methane Winds on Titan]",
    "realPhotos": [
      {
        "title_tr": "Huygens'in Gözünden Titan Yüzeyi ve Su Buzu Çakılları",
        "title_en": "Titan's Surface & Water-Ice Cobbles by Huygens",
        "catalogId": "NASA PIA07232 / ESA DISR",
        "instrument": "Descent Imager / Spectral Radiometer (DISR)",
        "url": "assets/photos/huygens_titan.jpg",
        "desc_tr": "Dünya'dan 1.2 milyar km uzakta, başka bir gezegenin uydusundan çekilen tarihin ilk ve tek yüzey fotoğrafı. Öndeki taşlar -179.5°C'de donmuş su buzu çakıllarıdır.",
        "desc_en": "History's farthest surface photograph, showing rounded water-ice cobbles resting on a dark methane-rich floodplain on Titan."
      }
    ],
    "secretRelic": {
      "badge_tr": "🎵 TİTAN'A İNDİRİLEN 4 BESTELİK MÜZİK KAYDI (LALD)",
      "badge_en": "🎵 FOUR MUSICAL COMPOSITIONS DELIVERED TO TITAN",
      "title_tr": "Fransız Besteciler Julien Civange ve Louis Haéri'nin Uzay Şarkıları",
      "title_en": "Music Composed to Travel 1.2 Billion Kilometers to Saturn's Largest Moon",
      "desc_tr": "Huygens'in hafıza belleğine gençliği ve gelecek nesilleri uzay keşfine teşvik etmek amacıyla \"LalD\" projesi kapsamında 4 adet müzik eseri (\"Hot Time\", \"Bald James Deans\", \"No Love\" ve \"Planetalyan\") kaydedilmişti. Bu şarkılar şu an Satürn'ün uydusu Titan'da yatmaktadır.",
      "desc_en": "Stored inside Huygens's solid-state memory are four musical tracks by French composers Julien Civange and Louis Haéri, forever resting on the hydrocarbon plains of Titan."
    },
    "locationName_en": "Adiri / Shangri-La (Titan - Moon of Saturn)",
    "discardedItems_en": [
      "Huygens Surface Descent Module (199 kg)",
      "2.7-Meter Beryllium/Titanium Front Thermal Shield & Back Cover (Jettisoned)",
      "Surface Science Package (SSP) Penetrometer Foot",
      "Descent Imager / Spectral Radiometer (DISR) Optical Mast",
      "Titan Methane Ocean/Pebble Acoustic Sounder",
      "Main Parachute, Drogue Chute, and Stabilizing Rigging"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "318 kg (entry mass; ~199 kg descent module)",
      "powerSource": "5 × LiSO2 (Lithium Sulfur Dioxide) Batteries (1.8 kWh)",
      "activeDuration": "2 hr 27 min descent + 72 min surface relay",
      "coordinatesReadable": "10°15' S, 192°19' W (Shangri-La / Titan)"
    }
  },
  {
    "id": "rosetta-philae",
    "body": "outer",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Ariane 5G+ / Rosetta Ana Yörünge Aracı & Philae Kuyrukluyıldız İniş Aracı",
    "craftType_en": "Ariane 5G+ / Rosetta Mother Orbiter & Philae Robotic Comet Lander",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "ESA/NASA Rosetta & Philae: 67P Kuyruklu Yıldızındaki İki Sessiz Kaşif",
    "name_en": "ESA/NASA Rosetta & Philae: Twin Explorers Resting on Comet 67P",
    "mission": "Rosetta / Philae (ESA & NASA)",
    "date": "12 Kasım 2014 (Philae) / 30 Eylül 2016 (Rosetta)",
    "date_en": "Nov 12, 2014 (Philae) / Sep 30, 2016 (Rosetta)",
    "decade": "2010",
    "category": "lander",
    "category_tr": "Kuyruklu Yıldız İniş Aracı",
    "category_en": "Comet Nucleus Lander & Orbiter",
    "coords": {
      "lat": -2.36,
      "lng": -8.68
    },
    "locationName": "Abydos Uçurumu & Sais Bölgesi (67P/Churyumov-Gerasimenko)",
    "modelType": "philae",
    "headline_tr": "Yerçekiminin Dünya'nın 100.000'de Biri Olduğu Bir Kuyruklu Yıldızda İki Kez Sekip Uçurum Çatlağına Sıkışan Sonda",
    "headline_en": "Bouncing Twice Across a Low-Gravity Comet Nucleus Before Wedging Into the Shadowed Cliffs of Abydos",
    "quote_tr": "Philae iniş aracı 12 Kasım 2014'te ana uzay aracından ayrıldı; ancak yüzeye tutunmasını sağlayacak iki zıpkın ve itici sistem çalışmayınca yüzeyde iki kez sekti.",
    "quote_en": "The Philae lander was released on 12 November 2014, but due to the failure of two devices meant to secure the lander to the surface, it bounced twice before coming to rest.",
    "quoteAuthor": "Conway, Yeomans & Rosenburg (NASA SP-2022-4235: NEO Research, s. 214)",
    "story_tr": "[Resmi Kaynak — NASA SP-2022-4235 \"A History of Near-Earth Objects Research\", s. 214-215]: 10 yıl süren 6.4 milyar kilometrelik uzay kovalamacasının ardından Rosetta, 67P/Churyumov-Gerasimenko Kuyruklu Yıldızı'na ulaştı. 12 Kasım 2014'te çamaşır makinesi büyüklüğündeki (100 kg) Philae iniş aracını bıraktı.\n\nKuyruklu yıldızdaki yerçekimi o kadar zayıftı ki (100 kg'lık Philae orada sadece 1 gram ağırlığındaydı!), aracın sekmesini önlemek için tepesinde bir soğuk gaz iticisi ve ayaklarının altında iki zıpkın (harpoon) vardı. Ancak ne itici ne de zıpkınlar ateşlendi! Philae, Agilkia iniş noktasından 1 kilometre yüksekliğe geri sıçradı, 1 saat 50 dakika uçup ikinci kez çarptı ve sonunda \"Abydos\" bölgesindeki karanlık bir kaya çatlağına yan yatmış halde sıkıştı.\n\nGüneş ışığı alamamasına rağmen dahili pilleriyle 63 saat boyunca organik molekülleri analiz etti. Yaklaşık 2 yıl boyunca nerede olduğu bulunamadı; ta ki 2 Eylül 2016'da Rosetta'nın OSIRIS kamerası onu bir kaya yarığında bacakları havada görüntüleyene kadar! 28 gün sonra, 30 Eylül 2016'da ana uzay aracı Rosetta da Sais bölgesine kontrollü olarak indirilerek Philae'nin yanındaki ebedi uykusuna katıldı.",
    "story_en": "[Official Citation — NASA SP-2022-4235 \"A History of Near-Earth Objects Research\", pp. 214-215]: On November 12, 2014, the 100-kg Philae lander touched down on Comet 67P/Churyumov-Gerasimenko. Because its cold-gas thruster and anchoring harpoons failed to fire in the microgravity environment (where Philae weighed just 1 gram), it rebounded 1 km into space, bounced twice over 2 hours, and wedged on its side inside a dark crevice at Abydos. Operating for 63 hours on battery power, its exact resting place remained a mystery until Rosetta photographed its upturned legs on September 2, 2016—just weeks before Rosetta itself made a final controlled descent onto the comet.",
    "whyAbandoned_tr": "Zıpkınların ateşlenmemesi sonucu gölgeli Abydos uçurumuna sıkışarak güneş enerjisi alamaması; ana araç Rosetta ise Güneş'ten uzaklaşırken enerjisi biteceği için 30 Eylül 2016'da yüzeye indirildi.",
    "whyAbandoned_en": "Philae wedged into a shadowed cliff at Abydos after anchoring harpoons failed; Rosetta was intentionally landed at Sais on Sep 30, 2016 as the comet receded toward Jupiter's orbit.",
    "currentCondition_tr": "Hem üç ayaklı karbon fiber Philae iniş aracı (Abydos çatlağında yan yatmış halde), hem de 28 metrelik güneş kanatlarıyla ana Rosetta uzay aracı (Sais çukurunda) 67P Kuyruklu Yıldızı'nın üzerinde her 6.45 yılda bir Güneş'in etrafında dönmektedir.",
    "currentCondition_en": "Both the three-legged carbon-fiber Philae lander (wedged at Abydos) and the Rosetta orbiter with its 28-meter solar wings (at Sais) ride aboard Comet 67P on its 6.45-year solar orbit.",
    "discardedItems": [
      "Philae Karbon Fiber İniş Aracı ve 3 Ayaklı İniş Takımı (100 kg)",
      "Rosetta Ana Yörünge Uzay Aracı ve 28m Güneş Panelleri (~1,670 kg kuru)",
      "NASA Görev Katkıları: ALICE UV Spektrometresi, MIRO ve IES Sensörleri",
      "SD2 Sondaj Matkabı, SESAME Akustik Sensörleri ve MUPUS Çekiç Sondası",
      "1.000 Dilde İnsanlık Arşivi Taşıyan Nikel Rosetta Diski"
    ],
    "technicalSpecs": {
      "massLeftKg": "100 kg (Philae) + ~1,670 kg (Rosetta)",
      "powerSource": "Güneş Panelleri + LiSO2 & Li-ion Batarya",
      "activeDuration": "Philae: 63 saat yüzey; Rosetta: 12 yıl 6 ay",
      "coordinatesReadable": "Abydos & Sais (67P Küçük Lobu)"
    },
    "audioSnippet": "[Philae SESAME-CASSE Acoustic Footpad Sensor: Thud on Comet 67P Ice Crust]",
    "realPhotos": [
      {
        "title_tr": "67P/Churyumov-Gerasimenko Kuyruklu Yıldızı ve İniş Bölgesi",
        "title_en": "Comet 67P/Churyumov-Gerasimenko & Landing Terrain",
        "catalogId": "NASA PIA18899 / ESA OSIRIS",
        "instrument": "Rosetta OSIRIS / NavCam",
        "url": "assets/photos/rosetta_philae.jpg",
        "desc_tr": "Philae ve Rosetta'nın üzerinde ebediyen yolculuk ettiği 4.3 km genişliğindeki çift loblu kuyruklu yıldız çekirdeği.",
        "desc_en": "The rugged, bi-lobed nucleus of Comet 67P where both Philae and Rosetta now rest."
      }
    ],
    "secretRelic": {
      "badge_tr": "📜 1.000 İNSAN DİLİNİ TAŞIYAN MİKRO-KAZIMALI ROSETTA DİSKİ",
      "badge_en": "📜 THE LONG NOW MICRO-ETCHED NICKEL ROSETTA DISK",
      "title_tr": "Milyonlarca Yıl Güneş Sistemi'nde Dolaşacak Dil Ansiklopedisi",
      "title_en": "An Archive of 1,000 Human Languages Riding a Comet Through Deep Time",
      "desc_tr": "Rosetta uzay aracının gövdesine Long Now Vakfı tarafından üretilen saf nikel alaşımlı bir disk monte edilmiştir. Üzerinde Dünya'daki 1.000 farklı dilin 13.000 sayfalık sözlük ve metin arşivi mikroskobik olarak kazınmıştır; bir büyüteçle doğrudan okunabilmektedir.",
      "desc_en": "Mounted on Rosetta is a solid nickel-alloy disk micro-etched with 13,000 pages documenting 1,000 human languages—preserving Earth's linguistic heritage aboard an ancient comet."
    },
    "locationName_en": "Abydos Cliff & Sais Region (Comet 67P/Churyumov–Gerasimenko)",
    "discardedItems_en": [
      "Philae Carbon Fiber Lander Body & Three-Legged Gear (100 kg)",
      "Rosetta Main Orbiter Spacecraft & 28-meter Solar Wings (~1,670 kg dry)",
      "MUPUS Thermal Hammer and Surface Penetrator",
      "Twin Unfired Ice Harpoons and Cold Gas Thruster Assembly",
      "COSAC Cometary Gas Chromatograph and Mass Spectrometer Ovens",
      "CONSERT Radar Transponder System (Resting in dark Abydos crevice)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "100 kg (Philae) + ~1,670 kg (Rosetta)",
      "powerSource": "Solar Panels + LiSO2 & Li-ion Batteries",
      "activeDuration": "Philae: 63 hrs surface; Rosetta: 12 yrs 6 mos",
      "coordinatesReadable": "Abydos & Sais (Comet 67P Head & Body)"
    }
  },
  {
    "id": "near-shoemaker-eros",
    "body": "outer",
    "landingStatus": "landed",
    "landingStatus_tr": "BAŞARILI YUMUŞAK İNİŞ",
    "landingStatus_en": "SUCCESSFUL SOFT LANDING",
    "craftType_tr": "Delta II 7925-8 / NASA Discovery Asteroid Yörünge & Yüzey Temas Sondası",
    "craftType_en": "Delta II 7925-8 / NASA Discovery Asteroid Orbiter & Touchdown Science Probe",
    "vrAllowed": true,
    "vrDisallowReason_tr": "",
    "vrDisallowReason_en": "",
    "name_tr": "NASA NEAR Shoemaker: 433 Eros Asteroidine Tarihin İlk İnişi",
    "name_en": "NASA NEAR Shoemaker: History's First Touchdown on an Asteroid (433 Eros)",
    "mission": "NEAR Shoemaker (NASA Discovery #2)",
    "date": "12 Şubat 2001",
    "date_en": "February 12, 2001",
    "decade": "2000",
    "category": "probe",
    "category_tr": "Asteroit Yörünge & İniş Aracı",
    "category_en": "Asteroid Orbiter & Lander",
    "coords": {
      "lat": -35,
      "lng": -27
    },
    "locationName": "Himeros Eyer Sırtı (433 Eros Yakın Dünya Asteroidi)",
    "modelType": "probe",
    "headline_tr": "İniş Ayağı Olmayan Bir Yörünge Aracını 5 İtici Ateşlemesiyle Bir Asteroidin Üzerine Yumuşakça Kondurmak",
    "headline_en": "Improvising a Feather-Light 1.5 m/s Touchdown on Asteroid 433 Eros Using an Orbiter With No Landing Legs",
    "quote_tr": "Ajans, 1993 yılında ilk iki Discovery görevi olan NEAR ve Pathfinder'ı başlattı... NEAR, bir asteroit yörüngesine giren ve yüzeyine inen ilk uzay aracı oldu.",
    "quote_en": "The agency directed the first two Discovery missions, NEAR and Pathfinder, in 1993... NEAR became the first spacecraft to orbit and touch down on an asteroid.",
    "quoteAuthor": "David W. Brown (NASA SP-2026-4239: NASA's Discovery Program, s. 74)",
    "story_tr": "[Resmi Kaynak — NASA SP-2026-4239 \"NASA's Discovery Program\" & NASA SP-2022-4235 \"NEO Research\"]: Johns Hopkins Uygulamalı Fizik Laboratuvarı (APL) tarafından geliştirilen NEAR Shoemaker, bir asteroidin (34 km uzunluğundaki fıstık biçimli 433 Eros) yörüngesine giren ilk uzay aracıydı. Bir yıl boyunca Eros'un etrafında dönerek 160.000'den fazla fotoğraf çekti.\n\nGörev sonunda yakıtı bitmek üzereyken görev direktörü Robert Farquhar çılgınca bir fikir önerdi: Aracın hiçbir iniş ayağı olmamasına rağmen onu Eros'un yüzeyine indirmek! 12 Şubat 2001'de 5 kez hassas frenleme ateşlemesi yapan NEAR Shoemaker, Himeros krateri kenarına saniyede sadece 1.5 metre (yürüyüş hızı!) hızla yumuşakça dokundu.\n\nDört güneş paneli kanadından ikisinin uçları ve gövdesi asteroit tozuna yaslandı. Parçalanmak bir yana, yüzeyden 16 gün boyunca gama-ışını spektrometresiyle Eros'un iç kimyasal yapısını ölçüp Dünya'ya gönderdi!",
    "story_en": "[Official Citation — NASA SP-2026-4239 & SP-2022-4235]: Built by Johns Hopkins APL for NASA's Discovery Program, NEAR Shoemaker orbited the 34-km S-type asteroid 433 Eros for a year. With propellant nearly exhausted on February 12, 2001, engineers executed five braking burns to guide the legless orbiter onto the edge of Himeros saddle at a gentle 1.5 m/s—the slowest planetary touchdown in history. Resting on two of its four solar panels, NEAR continued transmitting gamma-ray composition data from the surface for 16 days!",
    "whyAbandoned_tr": "Yörünge görevi sonunda son damla hidrazin yakıtıyla asteroit yüzeyine indirildi; 28 Şubat 2001'de Eros'un soğuk kış gecesinde (-150°C) iletişim kesildi.",
    "whyAbandoned_en": "Intentionally landed at end of orbital mission; communications concluded on February 28, 2001 after 16 days of bonus surface science.",
    "currentCondition_tr": "Sekizgen alüminyum gövdesi, 1.5 metrelik çanak anteni ve dört galyum-arsenit güneş paneliyle 433 Eros asteroidinin Himeros bölgesindeki bloklu regolit üzerinde hiç bozulmadan durmaktadır.",
    "currentCondition_en": "Rests intact on the blocky regolith of 433 Eros, balanced on the tips of two solar panels and its aft chassis.",
    "discardedItems": [
      "NEAR Shoemaker Sekizgen Uzay Aracı Gövdesi (487 kg kuru kütle)",
      "4 × Galyum-Arsenit Güneş Paneli Kanadı",
      "X-Işını / Gama-Işını Spektrometresi (XGRS) ve Lazer Altimetre (NLR)",
      "1.5m Yüksek Kazançlı Çanak Anten ve Manyetometre"
    ],
    "technicalSpecs": {
      "massLeftKg": "487 kg (kuru kütle)",
      "powerSource": "4 × Güneş Paneli (1,800 W) + NiCd Batarya",
      "activeDuration": "1 yıl yörünge + 16 gün yüzey çalışması",
      "coordinatesReadable": "35°00' G, 27°00' B (433 Eros - Himeros)"
    },
    "audioSnippet": "[APL Mission Control: NEAR Shoemaker Touchdown Confirmed at 1.5 m/s on Eros]",
    "realPhotos": [
      {
        "title_tr": "NEAR Shoemaker'ın İnerken 120 Metre İrtifadan Çektiği Son Kare",
        "title_en": "Asteroid 433 Eros Regolith from 120 Meters Before Touchdown",
        "catalogId": "NASA PIA03112",
        "instrument": "NEAR Multi-Spectral Imager (MSI)",
        "url": "assets/photos/near_eros.jpg",
        "desc_tr": "NEAR Shoemaker'ın Eros yüzeyine değmeden hemen önce çektiği, 6 metre genişliğindeki alanı ve santimetre boyutundaki taşları gösteren son fotoğrafı.",
        "desc_en": "The final close-up image transmitted by NEAR Shoemaker moments before its solar panel tips touched the dusty surface of asteroid 433 Eros."
      }
    ],
    "secretRelic": {
      "badge_tr": "☄️ DR. EUGENE SHOEMAKER'IN ADINI TAŞIYAN İKİNCİ ANIT",
      "badge_en": "☄️ NAMED IN HONOR OF PLANETARY GEOLOGY PIONEER EUGENE SHOEMAKER",
      "title_tr": "Külleri Ay'da, İsmi Dünya Yakını Bir Asteroitin Üzerinde",
      "title_en": "Ashes on the Moon, Legacy Resting Forever on Asteroid 433 Eros",
      "desc_tr": "NASA SP-2022-4235 monografisinde anlatıldığı üzere, gezegen çarpışma jeolojisinin kurucusu Eugene Shoemaker'ın 1997'deki vefatının ardından külleri Lunar Prospector ile Ay'a gönderilmiş, NEAR uzay aracına ise onun onuruna \"NEAR Shoemaker\" adı verilmiştir.",
      "desc_en": "As chronicled in NASA SP-2022-4235, following Eugene Shoemaker's passing in 1997, NASA honored the legendary astrogeologist by placing his ashes on the Moon and renaming the NEAR asteroid mission 'NEAR Shoemaker.'"
    },
    "locationName_en": "Himeros Saddle (433 Eros Near-Earth Asteroid)",
    "discardedItems_en": [
      "NEAR Shoemaker Octagonal Spacecraft Bus (487 kg dry mass)",
      "4 × Gallium-Arsenide Solar Array Wings",
      "X-Ray / Gamma-Ray Spectrometer (XGRS) Sensors",
      "Near-Infrared Spectrometer (NIS) and Multispectral Imager (MSI)",
      "Laser Rangefinder (NLR) Optical Bench",
      "1.5-meter High-Gain Parabolic Telemetry Antenna"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "487 kg (dry mass)",
      "powerSource": "4 × Solar Panels (1,800 W) + NiCd Batteries",
      "activeDuration": "1 year orbit + 16 days surface operation",
      "coordinatesReadable": "35°00' S, 27°00' W (433 Eros - Himeros)"
    }
  },
  {
    "id": "galileo-probe",
    "body": "outer",
    "landingStatus": "crashed",
    "landingStatus_tr": "ATMOSFERİK GİRİŞ & İMHA (KATI YÜZEY YOK)",
    "landingStatus_en": "ATMOSPHERIC ENTRY & VAPORIZATION (NO SOLID SURFACE)",
    "craftType_tr": "Uzay Mekiği Atlantis (STS-34) IUS / Galileo Atmosferik Dalış Sondası & Yörünge Aracı",
    "craftType_en": "Space Shuttle Atlantis (STS-34) IUS / Galileo Atmospheric Entry Probe & Orbiter",
    "vrAllowed": false,
    "vrDisallowReason_tr": "Galileo sondası Jüpiter atmosferine 170.000 km/s hızla dalış yapmış ve 23 atmosfer basınçta buharlaşmıştır. Jüpiter gaz devi olup katı bir yüzey bulunmadığı ve araç yok olduğu için VR yüzey yürüyüşü engellenmiştir.",
    "vrDisallowReason_en": "Galileo plunged into Jupiter's atmosphere at 170,000 km/h and was vaporized under 23 atmospheres. As Jupiter is a gas giant with no solid surface and total destruction, VR surface walk is disabled.",
    "name_tr": "NASA Galileo Atmosfer Sondası & Ana Aracı: Europa'yı Korumak İçin Feda Ediliş",
    "name_en": "NASA Galileo Atmospheric Probe & Orbiter: Sacrificed into Jupiter to Protect Europa",
    "mission": "Galileo (NASA / JPL)",
    "date": "7 Aralık 1995 (Sonda) / 21 Eylül 2003 (Ana Araç)",
    "date_en": "Dec 7, 1995 (Probe) / Sep 21, 2003 (Orbiter)",
    "decade": "1990",
    "category": "shield",
    "category_tr": "Gaz Devi Dalış Sondası",
    "category_en": "Gas Giant Entry Probe & Orbiter",
    "coords": {
      "lat": 6.5,
      "lng": -4.4
    },
    "locationName": "Jüpiter Kuzey Ekvator Kuşağı (NEB)",
    "modelType": "shield",
    "headline_tr": "Güneş Yüzeyinden Daha Sıcak Bir Şok Dalgasıyla Jüpiter'e Saatte 170.000 km Hızla Dalan İnsan Yapımı Cihaz",
    "headline_en": "Plunging into Jupiter at 170,000 km/h Through a 15,500°C Plasma Shockwave and 230g Deceleration",
    "quote_tr": "Europa'nın buz altı okyanusunu Dünya bakterileriyle kirletmemek için Galileo, Jüpiter atmosferinde buharlaşmaya gönderildi.",
    "quote_en": "To protect Europa's subsurface ocean from terrestrial contamination, Galileo was commanded to plunge into Jupiter.",
    "quoteAuthor": "NASA Gezegen Koruma Ofisi (NASA SP-2021-4705)",
    "story_tr": "[Resmi Kaynak — NASA SP-2021-4705 \"50 Years of Solar System Exploration\"]: 7 Aralık 1995'te Galileo'nun 339 kilogramlık atmosfer sondası, Jüpiter'in bulutlarına saatte 170.600 km (47.8 km/s) hızla daldı. Bu, insan yapımı bir nesnenin şimdiye kadar yaşadığı en şiddetli atmosfer girişiydi: Önündeki şok dalgası 15.500°C'ye (Güneş yüzeyinin neredeyse 3 katı!) ulaştı, sonda Dünya yerçekiminin 230 katı (230g) yavaşlama kuvvetine maruz kaldı ve 152 kg'lık karbon-fenolik ısı kalkanının yarısından fazlası saniyeler içinde buharlaştı!\n\nBuna rağmen paraşütünü açarak 57.6 dakika boyunca Jüpiter'in bulutlarının 156 km derinliğine (22 bar basınç ve 153°C sıcaklığa) kadar veri gönderdi.\n\nAna Galileo yörünge aracı ise 8 yıl boyunca Jüpiter'in uydusu Europa'nın altında sıvı tuzlu su okyanusu olduğunu kanıtladı. Görev bittiğinde, sterilize edilmemiş aracın kazara Europa'ya çarpıp olası uzaylı yaşamını Dünya mikroplarıyla kirletmemesi için 21 Eylül 2003'te Jüpiter'e çarptırılarak atomlarına ayrıldı.",
    "story_en": "[Official Citation — NASA SP-2021-4705]: On December 7, 1995, the 339-kg Galileo Entry Probe slammed into Jupiter's atmosphere at 47.8 km/s (170,600 km/h), enduring a 15,500°C plasma fireball and 230g deceleration that vaporized 80 kg of its carbon-phenolic heat shield. It transmitted atmospheric data for 57.6 minutes down to 22 bars before melting. Eight years later, on September 21, 2003, NASA intentionally plunged the main Galileo orbiter into Jupiter so it could never crash into and contaminate Europa's subsurface ocean.",
    "whyAbandoned_tr": "Gezegen Koruma Protokolü (Planetary Protection): Europa, Ganymede ve Callisto'nun buz altı okyanuslarını Dünya mikroorganizmalarıyla kirletmemek için Jüpiter atmosferinde kasıtlı olarak imha edildi.",
    "whyAbandoned_en": "Planetary Protection Protocol: Intentionally vaporized in Jupiter's atmosphere to prevent biological contamination of Europa's ocean.",
    "currentCondition_tr": "Hem atmosfer sondası hem de 2.2 tonluk Galileo yörünge aracı, Jüpiter'in binlerce atmosferlik derinliklerinde eriyip atomlarına ayrılarak gezegenin gaz katmanlarının kalıcı bir parçası haline gelmiştir.",
    "currentCondition_en": "Completely vaporized and dissociated into elemental atoms deep within Jupiter's high-pressure metallic hydrogen envelope.",
    "discardedItems": [
      "Galileo Atmosferik Dalış Sondası ve 152 kg Karbon-Fenolik Isı Kalkanı",
      "Galileo Ana Yörünge Uzay Aracı (2,223 kg)",
      "2 × GPHS-RTG Nükleer Güç Jeneratörü",
      "Nötr Kütle Spektrometresi (NMS) ve Helyum İnterferometresi"
    ],
    "technicalSpecs": {
      "massLeftKg": "339 kg (Sonda) + 2,223 kg (Ana Araç)",
      "powerSource": "LiSO2 Batarya (Sonda) / 2 × RTG (Ana Araç)",
      "activeDuration": "57.6 dk (Sonda) / 14 yıl (Ana Araç)",
      "coordinatesReadable": "6°30' K, 4°24' B (Jüpiter NEB)"
    },
    "audioSnippet": "[Galileo Probe Doppler Wind Experiment: 650 km/h Jovian Jet Stream Telemetry]",
    "realPhotos": [
      {
        "title_tr": "Galileo'nun Gözünden Jüpiter ve Buzlu Uydusu Europa",
        "title_en": "Jupiter & Icy Ocean Moon Europa Imaged by Galileo",
        "catalogId": "NASA PIA00343",
        "instrument": "Galileo Solid-State Imaging (SSI)",
        "url": "assets/photos/galileo_jupiter.jpg",
        "desc_tr": "Galileo uzay aracının uğruna kendini Jüpiter atmosferinde feda ettiği buzlu okyanus uydusu ve Jüpiter sistemi.",
        "desc_en": "Archival imagery captured by the Galileo spacecraft before its protective plunge into Jupiter."
      }
    ],
    "secretRelic": {
      "badge_tr": "🛡️ İNSANLIK TARİHİNİN EN DAYANIKLI ISI KALKANI (230G & 15.500°C)",
      "badge_en": "🛡️ THE GREATEST THERMAL SHIELD IN AEROSPACE HISTORY (230G & 15,500°C)",
      "title_tr": "Saniyeler İçinde 80 Kilogram Karbonun Buharlaşarak Sondasını Kurtardığı An",
      "title_en": "Losing 80 Kilograms of Carbon-Phenolic Shielding in Seconds Inside a Jovian Fireball",
      "desc_tr": "Galileo sondasının toplam ağırlığının neredeyse yarısı (%45'i, yani 152 kg) sadece ısı kalkanıydı. Jüpiter'e girerken oluşan 15.500°C'lik plazma topunda bu kalkanın 80 kilogramı saniyeler içinde eriyip buharlaştı ancak içindeki bilimsel cihazları tek bir çizik bile almadan Jüpiter bulutlarına ulaştırdı.",
      "desc_en": "Nearly half of the Galileo Probe's total mass (152 kg out of 339 kg) consisted solely of its carbon-phenolic heat shield—80 kg of which vaporized during the 230g Jovian entry."
    },
    "locationName_en": "Jupiter North Equatorial Belt (NEB)",
    "discardedItems_en": [
      "Galileo Atmospheric Entry Probe & 152 kg Carbon-Phenolic Heat Shield",
      "Galileo Main Orbiter Spacecraft (2,223 kg)",
      "Neutral Mass Spectrometer and Helium Abundance Detector",
      "Nephelometer and Atmospheric Structure Sensors",
      "Melted Titanium Bus Structure (Vaporized deep inside Jovian mantle)",
      "2 x SNAP-19 Radioisotope Thermoelectric Generators (RTG)"
    ],
    "technicalSpecs_en": {
      "massLeftKg": "339 kg (Probe) + 2,223 kg (Orbiter)",
      "powerSource": "LiSO2 Battery (Probe) / 2 × RTG (Orbiter)",
      "activeDuration": "57.6 min (Probe) / 14 years (Orbiter)",
      "coordinatesReadable": "6°30' N, 4°24' W (Jupiter NEB)"
    }
  }
];

const CELESTIAL_DATA = {
  "moon": {
    "name_tr": "Ay",
    "name_en": "Moon",
    "tagline_tr": "İnsanlığın Başka Bir Dünyadaki İlk Ayak İzleri ve Sessiz Anıtları",
    "tagline_en": "Humanity's First Footsteps and Silent Monuments on Another World",
    "radiusKm": 1737.4,
    "gravity": "1.62 m/s² (Dünya'nın ~%16.6'sı)",
    "gravity_en": "1.62 m/s² (~16.6% of Earth)",
    "atmosphere_tr": "Neredeyse yok (Sert vakum)",
    "atmosphere_en": "Virtually none (Hard vacuum)",
    "temp_tr": "-130°C ile +120°C arası",
    "temp_en": "-130°C to +120°C",
    "totalMassLeft_tr": "Yaklaşık 190.000 kg insan yapımı malzeme",
    "totalMassLeft_en": "Approx. 190,000 kg of human-made material",
    "ambientColor": 1119781,
    "glowColor": 8956620
  },
  "mars": {
    "name_tr": "Mars",
    "name_en": "Mars",
    "tagline_tr": "Kızıl Gezegenin Toz Fırtınalarına Gömülen Robotik Kaşifler",
    "tagline_en": "Robotic Explorers Entombed in the Red Planet's Dust Storms",
    "radiusKm": 3389.5,
    "gravity": "3.72 m/s² (Dünya'nın ~%38'i)",
    "gravity_en": "3.72 m/s² (~38% of Earth)",
    "atmosphere_tr": "%95 Karbondioksit (Dünya'nın %1'i basınç)",
    "atmosphere_en": "95% Carbon Dioxide (1% of Earth's pressure)",
    "temp_tr": "-125°C ile +20°C arası",
    "temp_en": "-125°C to +20°C",
    "totalMassLeft_tr": "Yaklaşık 10.000 kg insan yapımı robotik donanım",
    "totalMassLeft_en": "Approx. 10,000 kg of human-made robotic hardware",
    "ambientColor": 2363656,
    "glowColor": 14509619
  },
  "venus": {
    "name_tr": "Venüs",
    "name_en": "Venus",
    "tagline_tr": "465°C Sülfürik Asit Bulutları ve 90 Bar Basınç Altındaki Titanyum Zaman Kapsülleri",
    "tagline_en": "Titanium Time Capsules Beneath 465°C Sulfuric Acid Clouds and 90-Bar Crushing Pressure",
    "radiusKm": 6051.8,
    "gravity": "8.87 m/s² (Dünya'nın ~%90.4'ü)",
    "gravity_en": "8.87 m/s² (~90.4% of Earth)",
    "atmosphere_tr": "%96.5 CO2 + Sülfürik Asit (92 Bar Basınç)",
    "atmosphere_en": "96.5% CO2 + Sulfuric Acid (92 Bar Pressure)",
    "temp_tr": "+457°C ile +475°C sabit sera cehennemi",
    "temp_en": "+457°C to +475°C runaway greenhouse",
    "totalMassLeft_tr": "Yaklaşık 22.000 kg insan yapımı sonda (Venera, Vega & Pioneer)",
    "totalMassLeft_en": "Approx. 22,000 kg of human-made probes (Venera, Vega & Pioneer)",
    "ambientColor": 2824453,
    "glowColor": 16096779
  },
  "outer": {
    "name_tr": "Titan & Dış Sistem",
    "name_en": "Titan & Outer System",
    "tagline_tr": "Satürn'ün Uydusu Titan, 67P Kuyruklu Yıldızı, 433 Eros Asteroidi ve Jüpiter'deki Uzak Kaşifler",
    "tagline_en": "Distant Relics on Saturn's Moon Titan, Comet 67P, Asteroid 433 Eros & Jupiter",
    "radiusKm": 2574.7,
    "gravity": "1.35 m/s² (Titan) / 0.001 m/s² (67P)",
    "gravity_en": "1.35 m/s² (Titan) / 0.001 m/s² (67P)",
    "atmosphere_tr": "%97 Azot + Sıvı Metan Bulutları (1.45 Bar)",
    "atmosphere_en": "97% Nitrogen + Methane Haze (1.45 Bar)",
    "temp_tr": "-179.5°C Kriyojenik İklim",
    "temp_en": "-179.5°C Cryogenic Climate",
    "totalMassLeft_tr": "~4.800 kg (Huygens, Rosetta/Philae, NEAR Shoemaker, Galileo, Cassini)",
    "totalMassLeft_en": "~4,800 kg (Huygens, Rosetta/Philae, NEAR Shoemaker, Galileo, Cassini)",
    "ambientColor": 2497034,
    "glowColor": 15381256
  }
};

const LIVE_ROVER_TELEMETRY = {
  "perseverance": {
    "id": "perseverance-live",
    "name": "Perseverance (Mars 2020)",
    "instrument": "MEDA (Mars Environmental Dynamics Analyzer)",
    "location_tr": "Jezero Krateri Batı Kaldera Yamacı (Witch Hazel Hill)",
    "location_en": "Jezero Crater Western Rim (Witch Hazel Hill)",
    "landingEpoch": "2021-02-18T20:55:00Z",
    "coords": {
      "lat": 18.4447,
      "lng": 77.4508
    },
    "linkedArtifactId": "perseverance-backshell-chute",
    "tempMaxC": -17.4,
    "tempMinC": -78.2,
    "pressurePa": 742.6,
    "windSpeedMs": 6.8,
    "windDir_tr": "GD (Güneydoğu)",
    "windDir_en": "SE (Southeast)",
    "dustTau": 0.46,
    "skyStatus_tr": "Açık / Hafif Tozlu (UV İndeksi: Yüksek)",
    "skyStatus_en": "Clear / Light Haze (UV Index: High)",
    "odometerKm": 31.42,
    "powerStatus": "MMRTG (Plütonyum-238): 104W Sabit Çıkış",
    "dsnStation": "DSS-14 Goldstone (70m Anten) — 2.0 Mbps Downlink"
  },
  "curiosity": {
    "id": "curiosity-live",
    "name": "Curiosity (MSL)",
    "instrument": "REMS (Rover Environmental Monitoring Station)",
    "location_tr": "Gale Krateri / Sharp Dağı (Gediz Vallis Kanalı)",
    "location_en": "Gale Crater / Mount Sharp (Gediz Vallis Ridge)",
    "landingEpoch": "2012-08-06T05:17:57Z",
    "coords": {
      "lat": -4.5895,
      "lng": 137.4417
    },
    "linkedArtifactId": "curiosity-skycrane",
    "tempMaxC": -12.8,
    "tempMinC": -74.5,
    "pressurePa": 818.3,
    "windSpeedMs": 5.2,
    "windDir_tr": "KD (Kuzeydoğu)",
    "windDir_en": "NE (Northeast)",
    "dustTau": 0.54,
    "skyStatus_tr": "Mevsimsel Kanyon Esintisi",
    "skyStatus_en": "Seasonal Canyon Breeze",
    "odometerKm": 33.18,
    "powerStatus": "MMRTG (Plütonyum-238): 88W Sabit Çıkış",
    "dsnStation": "DSS-63 Madrid (70m Anten) — 1.2 Mbps Downlink"
  }
};

function getArtifactsByBody(body) {
  return ARTIFACTS.filter(a => a.body === body);
}

function getArtifactById(id) {
  return ARTIFACTS.find(a => a.id === id);
}

const OFFICIAL_SOURCES = [
  {
    "name_tr": "NASA Space Apps Challenge 2026: NASA's Discarded Equipment Storytelling — Resmi Kaynak Paketi",
    "name_en": "NASA Space Apps Challenge 2026: NASA's Discarded Equipment Storytelling — Official Resources",
    "desc_tr": "Yarışmanın resmi veri ve hikâye anlatımı kaynak listesi: Ay, Mars, Venüs ve Dış Güneş Sistemi'nde geride bırakılan insan yapımı donanım katalogları, NASA 3D Resources, LROC görüntüleri ve NASA Tarih Serisi belgeleri.",
    "desc_en": "Official challenge resource hub providing NASA catalogs of manmade material on the Moon, Mars, Venus, and outer solar system bodies, NASA 3D Resources, and archival telemetry.",
    "url": "https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources",
    "curator": "NASA Space Apps Challenge / Earth & Planetary Science Division"
  },
  {
    "name_tr": "NASA SP-2024-4559: Governing the Moon — A History (Stephen S. Buono)",
    "name_en": "NASA SP-2024-4559: Governing the Moon — A History (Stephen S. Buono)",
    "desc_tr": "NASA Teknoloji, Politika ve Strateji Ofisi (OTPS) monografisi (No. 59). Ay mirasının korunması, 1979 Ay Anlaşması, \"One Small Step Act\" (2020) ve Artemis Anlaşmaları Bölüm 9 kapsamında Apollo iniş alanlarının hukuki statüsü.",
    "desc_en": "Monographs in Aerospace History No. 59. Chronicles lunar governance, the Moon Agreement, the One Small Step Act, and Artemis Accords heritage protection.",
    "url": "https://www.nasa.gov/history/",
    "curator": "NASA Office of Technology, Policy, and Strategy / NASA History Office"
  },
  {
    "name_tr": "NASA SP-2026-4239: NASA's Discovery Program — Competitive Planetary Exploration (David W. Brown)",
    "name_en": "NASA SP-2026-4239: NASA's Discovery Program — Competitive Planetary Exploration (David W. Brown)",
    "desc_tr": "Mars Pathfinder & Sojourner, NEAR Shoemaker (433 Eros inişi), Lunar Prospector ve InSight görevlerinin mühendislik, telemetri ve bilimsel tarihini belgeleyen resmi NASA Tarih Serisi eseri (ISBN 978-1-62683-090-5).",
    "desc_en": "Official NASA History Series volume documenting Mars Pathfinder, NEAR Shoemaker on 433 Eros, Lunar Prospector, Genesis, and InSight.",
    "url": "https://www.nasa.gov/ebooks/",
    "curator": "NASA History Office (Washington, DC)"
  },
  {
    "name_tr": "NASA SP-2022-4235: A History of Near-Earth Objects Research (Conway, Yeomans & Rosenburg)",
    "name_en": "NASA SP-2022-4235: A History of Near-Earth Objects Research (Conway, Yeomans & Rosenburg)",
    "desc_tr": "Dr. Eugene Shoemaker'ın çarpışma jeolojisi çalışmaları, Rosetta ve Philae'nin 67P Kuyruklu Yıldızı'na inişi (s. 214-215), NEAR Shoemaker ve gezegen savunması tarihi.",
    "desc_en": "Comprehensive NASA History Division study on impact cratering, Eugene Shoemaker, ESA/NASA Rosetta & Philae on Comet 67P, and asteroid exploration.",
    "url": "https://www.nasa.gov/ebooks/",
    "curator": "NASA History Division & Jet Propulsion Laboratory"
  },
  {
    "name_tr": "NASA SP-2021-4705: 50 Years of Solar System Exploration (Ed. Linda Billings)",
    "name_en": "NASA SP-2021-4705: 50 Years of Solar System Exploration (Ed. Linda Billings)",
    "desc_tr": "Güneş Sistemi keşfinin 50 yılı: Venera ve Pioneer Venus sondaları, Viking 1-2, Galileo Jüpiter sondası, Cassini-Huygens Titan inişi (s. 79-80) ve Mars gezginlerinin birincil tarihsel perspektifleri.",
    "desc_en": "Historical perspectives on 50 years of solar system exploration including Venera, Pioneer Venus, Viking, Galileo, Cassini-Huygens on Titan, and Mars rovers.",
    "url": "https://www.nasa.gov/ebooks/",
    "curator": "NASA History Division (Linda Billings, Editor)"
  },
  {
    "name_tr": "NASA Image and Video Library & Open Data Portal (images.nasa.gov / data.nasa.gov)",
    "name_en": "NASA Image and Video Library & Open Data Portal (images.nasa.gov / data.nasa.gov)",
    "desc_tr": "3D uzay aracı modelleme referansları, yüksek çözünürlüklü görev fotoğrafları, REMS/MEDA Mars meteoroloji veri setleri ve açık telemetri katalogları.",
    "desc_en": "Official repository for 3D spacecraft reference photography, mission archives, and open planetary telemetry datasets.",
    "url": "https://data.nasa.gov/",
    "curator": "NASA Office of the Chief Information Officer"
  },
  {
    "name_tr": "NASA Apollo Lunar Surface Journal (ALSJ)",
    "name_en": "NASA Apollo Lunar Surface Journal (ALSJ)",
    "desc_tr": "Apollo 11'den Apollo 17'ye kadar tüm Ay inişlerinin tam telsiz konuşma kayıtları, yüzey zaman çizelgeleri ve geride bırakılan donanım envanterleri.",
    "desc_en": "The definitive historical record of Apollo surface missions, air-to-ground audio transcripts, and lunar hardware manifests.",
    "url": "https://www.hq.nasa.gov/alsj/",
    "curator": "NASA History Division & Eric M. Jones"
  },
  {
    "name_tr": "NASA Planetary Data System (PDS)",
    "name_en": "NASA Planetary Data System (PDS)",
    "desc_tr": "NASA'nın tüm gezegen görevlerinden toplanan doğrulanmış bilimsel verilerini, santimetre hassasiyetindeki iniş koordinatlarını ve kütle ölçümlerini barındıran resmi federal arşivi.",
    "desc_en": "NASA's primary federal archive for planetary science telemetry, calibrated coordinates, and returned sample cataloging.",
    "url": "https://pds.nasa.gov/",
    "curator": "NASA Science Mission Directorate / Geosciences Node"
  },
  {
    "name_tr": "LROC - Lunar Reconnaissance Orbiter Camera (ASU)",
    "name_en": "LROC - Lunar Reconnaissance Orbiter Camera (ASU)",
    "desc_tr": "Ay yörüngesindeki LRO uydusunun Apollo iniş kademelerini, rover tekerlek izlerini ve kasıtlı roket çarpışma kraterlerini 0.5 metre çözünürlükle fotoğrafladığı resmi katalog.",
    "desc_en": "Sub-meter orbital imagery confirming Apollo descent stages, lunar roving vehicle tracks, and rocket impact scars.",
    "url": "https://www.lroc.asu.edu/",
    "curator": "Arizona State University & NASA Goddard Space Flight Center"
  },
  {
    "name_tr": "NASA Jet Propulsion Laboratory (JPL) Mars Exploration",
    "name_en": "NASA Jet Propulsion Laboratory (JPL) Mars Exploration",
    "desc_tr": "Viking 1-2, Pathfinder, Spirit, Opportunity, Curiosity, InSight, Perseverance ve Ingenuity helikopterinin son telemetri durumları, uçuş günlükleri ve yüzey koordinatları.",
    "desc_en": "Official operations logs, telemetry reports, and surface coordinates for Viking, Spirit, Opportunity, Curiosity, InSight, and Ingenuity.",
    "url": "https://mars.nasa.gov/",
    "curator": "NASA / Caltech Jet Propulsion Laboratory"
  },
  {
    "name_tr": "NASA NSSDC Master Catalog (Spacecraft Query)",
    "name_en": "NASA NSSDC Master Catalog (Spacecraft Query)",
    "desc_tr": "Tarihteki tüm uzay araçlarının uluslararası COSPAR ve NSSDC tescil numaraları, fırlatma ve kuru iniş kütleleri.",
    "desc_en": "Master registry of international spacecraft designators, launch masses, trajectories, and hardware dispositions.",
    "url": "https://nssdc.gsfc.nasa.gov/nmc/",
    "curator": "NASA Goddard Space Flight Center"
  }
];

// ============================================================================
// NASA SPACE APPS CHALLENGE 2026 — GLOBAL AWARDS SUBMISSION & COMPLIANCE DOSSIER
// (Human-Created Concept • NASA Open Data Driven • Visible Procedural Watermark • No NASA Logo Used)
// ============================================================================
const SPACE_APPS_SUBMISSION_DOSSIER = [
  {
    id: "nasa-partner-data",
    icon: "🛰️",
    badge_tr: "GLOBAL ÖDÜL ZORUNLU ALAN 1",
    badge_en: "GLOBAL AWARDS MANDATORY FIELD 1",
    title_tr: "1. NASA & Space Agency Partner Data (Hangi NASA Verisini Nasıl Kullandınız?)",
    title_en: "1. NASA & Space Agency Partner Data (Which NASA Data We Used & How)",
    body_tr: `Projemiz, NASA Space Apps Challenge 2026 "NASA's Discarded Equipment: Storytelling" resmi kaynak paketindeki (spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) birincil NASA veri setlerini doğrudan 3B simülasyon motoruna, yörünge küresine ve canlı telemetri arayüzüne entegre etmektedir:

1) NASA History Series & Resmi Envanter Katalogları:
   • NASA Catalogue of Manmade Material on the Moon & NASA SP-2024-4559 (Governing the Moon): Apollo 11, 12, 14, 15, 16, 17 iniş kademeleri, LRV Ay araçları, ALSEP sismik istasyonları ve LRRR lazer yansıtıcılarının kuru kütleleri (kg), selenografik koordinatları ve "One Small Step Act (2020)" / Artemis Anlaşmaları Bölüm 9 koruma statüleri veri tabanımıza (js/data.js) işlenmiştir.
   • NASA SP-2026-4239 (NASA's Discovery Program), SP-2022-4235 (Near-Earth Objects) ve SP-2021-4705 (50 Years of Solar System Exploration): Mars Pathfinder, InSight, Venera 7/13, Pioneer Venus, Cassini-Huygens (Titan) ve Galileo (Jüpiter) görevlerinin atmosferik giriş hızları, basınç/sıcaklık verileri ve bırakılan donanım listeleri 3B fizik motorunu beslemek için kullanılmıştır.

2) NASA LROC (Lunar Reconnaissance Orbiter Camera) & Planetary Data System (PDS):
   • Ay, Mars, Venüs ve Titan üzerindeki 25 kalıntının enlem/boylam koordinatları küresel kartezyen dönüşümle [x = R·cos(lat)·cos(lon)] 1:1 doğrulukla 3B gezegen kürelerine yerleştirilmiştir.
   • Saturn V S-IVB, LCROSS, GRAIL ve LADEE kinetik çarpışmalarının krater çapları ve Apollo ALSEP sismometrelerinde yarattığı sismik çınlama dalgaları (seismic ringing) gerçek hızlarıyla (2.58 km/s) canlandırılmıştır.

3) NASA Image and Video Library REST API (images-api.nasa.gov) & Mars REMS/MEDA Telemetrisi:
   • Her kalıntı seçildiğinde NASA'nın resmi arşiv fotoğrafları (AS11-40-5875, PIA24428, PIA16052 vb.) ve Mars'taki aktif Perseverance (MEDA - Jezero Krateri) ile Curiosity (REMS - Gale Krateri) istasyonlarının canlı Sol günü, rüzgâr hızı, basınç (Pa) ve yüzey sıcaklığı (°C) verileri uygulama içinde gerçek zamanlı sunulmaktadır.

4) Apollo Lunar Surface Journal (ALSJ) & AGC Block II DSKY Teknik Belgeleri:
   • 1:1 WebXR/VR Yürüyüş modunda içine girilebilen uzay aracı kabinlerindeki DSKY bilgisayar kodları (PROG 63/64/66/68/12, VERB 16 NOUN 65), FDAI "8-Ball" jiroskopları, 120+ devre kesici (Panel 11/16) ve telsiz kayıtları ALSJ teknik dokümanlarına birebir sadık kalınarak modellenmiştir.`,
    body_en: `Our project directly integrates primary NASA datasets from the official NASA Space Apps Challenge 2026 "NASA's Discarded Equipment: Storytelling" resource hub (spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) into our 3D WebGL/WebXR engine, orbital globe, and live telemetry UI:

1) NASA History Series & Official Hardware Manifests:
   • NASA Catalogue of Manmade Material on the Moon & NASA SP-2024-4559 (Governing the Moon): Used to map exact dry masses (kg), selenographic coordinates, item-by-item discarded inventories, and Artemis Accords Section 9 / One Small Step Act preservation statuses for Apollo 11–17, Surveyor 3, and Luna 2.
   • NASA SP-2026-4239 (Discovery Program), SP-2022-4235 (Near-Earth Objects), and SP-2021-4705 (50 Years of Solar System Exploration): Used to model terminal descent physics, 92-bar Venusian supercritical crushing pressure (Venera 7/13, Pioneer Venus), and Titan cryovolcanic landings (Cassini-Huygens).

2) NASA LROC (Lunar Reconnaissance Orbiter Camera) & Planetary Data System (PDS):
   • Calibrated planetary coordinates (lat/lon) for 25 artifacts across the Moon, Mars, Venus, and Outer System are projected onto 3D globes using spherical-to-Cartesian transformations and sub-meter LROC reference geometry.
   • Kinetic impact parameters (2.58 km/s velocity, crater dimensions, and ALSEP passive seismic ringing curves) for Saturn V S-IVB, LCROSS, GRAIL, and LADEE are simulated in real time.

3) NASA Image and Video Library REST API (images-api.nasa.gov) & Mars MEDA/REMS Telemetry:
   • Dynamically queries verified NASA archival photography and streams live Mars Sol clock, atmospheric pressure (Pa), wind speed (m/s), and surface temperature (°C) telemetry from Perseverance (MEDA at Jezero Crater) and Curiosity (REMS at Gale Crater).

4) Apollo Lunar Surface Journal (ALSJ) & AGC Block II DSKY Technical Schematics:
   • Used to engineer the 1:1 climbable EVA ladder and interactive walk-in spacecraft interiors, including working 3D DSKY guidance computer programs (P63, P64, P66, P68, P12), gimbaled FDAI 8-balls, Panel 11 circuit breakers, and air-to-ground voice transcripts.`
  },
  {
    id: "references-list",
    icon: "📚",
    badge_tr: "GLOBAL ÖDÜL ZORUNLU ALAN 2",
    badge_en: "GLOBAL AWARDS MANDATORY FIELD 2",
    title_tr: "2. References (Kullandığınız Tüm Veri, Kod, Görsel ve Araçların Listesi)",
    title_en: "2. References (Complete List of All Data, Code, Images, and Tools Used)",
    body_tr: `A) RESMİ NASA VERİ SETLERİ, KATALOGLAR & API KAYNAKLARI:
• NASA Space Apps Challenge 2026 Resource Hub — "NASA's Discarded Equipment: Storytelling": https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources
• NASA History Office (2024) — "Governing the Moon: A History", Stephen S. Buono (NASA SP-2024-4559).
• NASA History Office (2026) — "NASA's Discovery Program: Competitive Planetary Exploration", David W. Brown (NASA SP-2026-4239).
• NASA History Division (2022) — "A History of Near-Earth Objects Research", Conway, Yeomans & Rosenburg (NASA SP-2022-4235).
• NASA History Division (2021) — "50 Years of Solar System Exploration: Historical Perspectives", Ed. Linda Billings (NASA SP-2021-4705).
• NASA Catalogue of Manmade Material on the Moon (NASA HQ / LRO Anthropogenic Object Inventory): https://www.nasa.gov/
• NASA Planetary Data System (PDS Geosciences Node): https://pds.nasa.gov/
• Lunar Reconnaissance Orbiter Camera (LROC / ASU) Featured Sites Archive: https://www.lroc.asu.edu/
• NASA Open Data Portal & Mars Weather Telemetry (MEDA / REMS): https://data.nasa.gov/
• NASA Image and Video Library REST API (Kamuya Açık Görev Fotoğrafları - NASA Media Usage Guidelines Uyumlu): https://images.nasa.gov/
• NASA Apollo Lunar Surface Journal (ALSJ - Eric M. Jones & Ken Glover): https://www.hq.nasa.gov/alsj/
• NASA NSSDC Master Catalog (COSPAR / NSSDCA Spacecraft IDs): https://nssdc.gsfc.nasa.gov/nmc/

B) AÇIK KAYNAK KOD KÜTÜPHANELERİ, WEB STANDARTLARI & ARAÇLAR:
• Three.js (r128 - MIT Lisansı): Saf matematiksel/prosedürel 3B geometri, PBR materyaller, ışıklandırma ve sahne grafiği motoru (https://threejs.org/).
• Three.js OrbitControls (MIT Lisansı): 3B yörünge ve serbest kamera kontrolcüsü.
• W3C WebXR Device API: Meta Quest ve Apple Vision Pro başlıkları için 1:1 ölçekli VR/AR yüzey ve iç kabin yürüyüşü standardı.
• W3C Web Audio API & SpeechSynthesis API: Prosedürel NASA Quindar bip tonları (2525 Hz / 2475 Hz), sismik çınlama sentezi ve telsiz seslendirmesi.
• HTML5 2D Canvas API: Dış bağımlılık olmadan çalışma zamanında üretilen prosedürel PBR yüzey dokuları (Kapton altın folyo, CNC Isogrid alüminyum, Apollo bot izi, DSKY bilgisayar ekranı, Ay/Mars/Venüs/Titan yüzey kabartmaları).
• Google Fonts (OFL Lisansı): Space Grotesk, Inter ve JetBrains Mono tipografi aileleri.`,
    body_en: `A) OFFICIAL NASA DATASETS, CATALOGS & API RESOURCES:
• NASA Space Apps Challenge 2026 Resource Hub — "NASA's Discarded Equipment: Storytelling": https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources
• NASA History Office (2024) — "Governing the Moon: A History", Stephen S. Buono (NASA SP-2024-4559).
• NASA History Office (2026) — "NASA's Discovery Program: Competitive Planetary Exploration", David W. Brown (NASA SP-2026-4239).
• NASA History Division (2022) — "A History of Near-Earth Objects Research", Conway, Yeomans & Rosenburg (NASA SP-2022-4235).
• NASA History Division (2021) — "50 Years of Solar System Exploration: Historical Perspectives", Ed. Linda Billings (NASA SP-2021-4705).
• NASA Catalogue of Manmade Material on the Moon (NASA HQ / LRO Anthropogenic Object Inventory): https://www.nasa.gov/
• NASA Planetary Data System (PDS Geosciences Node): https://pds.nasa.gov/
• Lunar Reconnaissance Orbiter Camera (LROC / ASU) Featured Sites Archive: https://www.lroc.asu.edu/
• NASA Open Data Portal & Mars Weather Telemetry (MEDA / REMS): https://data.nasa.gov/
• NASA Image and Video Library REST API (Public Domain Archival Mission Imagery): https://images.nasa.gov/
• NASA Apollo Lunar Surface Journal (ALSJ - Eric M. Jones & Ken Glover): https://www.hq.nasa.gov/alsj/
• NASA NSSDC Master Catalog (COSPAR / NSSDCA Spacecraft IDs): https://nssdc.gsfc.nasa.gov/nmc/

B) OPEN-SOURCE CODE LIBRARIES, WEB STANDARDS & TOOLS:
• Three.js (r128 - MIT License): Pure mathematical/procedural 3D geometry, PBR materials, shadow mapping, and scene graph engine (https://threejs.org/).
• Three.js OrbitControls (MIT License): 3D orbital camera navigation.
• W3C WebXR Device API: 1:1 scale immersive VR/AR surface walk and interior cabin exploration standard.
• W3C Web Audio API & SpeechSynthesis API: Procedural NASA Quindar tones (2525 Hz / 2475 Hz), seismic ringing synthesis, and radio telemetry voice playback.
• HTML5 2D Canvas API: Runtime procedural PBR textures (Kapton thermal foil, CNC-milled aluminum isogrid, Apollo ribbed bootprints, DSKY computer displays, and planetary bump maps).
• Google Fonts (OFL License): Space Grotesk, Inter, and JetBrains Mono typefaces.`
  },
  {
    id: "use-of-super-intelligence",
    icon: "🤖",
    badge_tr: "GLOBAL ÖDÜL ZORUNLU ALAN 3 (AI BEYANI)",
    badge_en: "GLOBAL AWARDS MANDATORY FIELD 3 (AI DISCLOSURE)",
    title_tr: "3. Use of Super Intelligence (Yapay Zekâ Beyanı, Görünür Filigran & NASA Logo Uyumluluğu)",
    title_en: "3. Use of Super Intelligence (AI Disclosure, Visible Watermark & NASA Logo Compliance)",
    body_tr: `• İNSAN TARAFINDAN GELİŞTİRİLEN ÖZGÜN FİKİR (Human-Conceived Idea):
"Abandoned, But Not Forgotten" projesinin ana fikri, 5 perdelik duygusal ve bilimsel hikâye kurgusu ("Gereklilikten Doğan Terk Ediş -> Bilime Dönüşen Çarpışmalar -> Yorulmak Bilmeyen Gezginler -> Cehennem Basıncı ve Buzul Denizler -> Geleceğin Arkeolojisi"), 1:1 ölçekli WebXR astronot yürüyüşü ve merdivenle uzay aracı iç kabinlerine girme tasarımı tamamen proje ekibimiz tarafından kurgulanmıştır. Fikir yapay zekâya buldurulmamıştır.

• YAPAY ZEKÂ ARAÇLARININ KULLANIM AMACI VE KOD/VERİ AÇIKLAMALARI:
Yapay zekâ destekli kodlama asistanı (Antigravity / LLM), ekibimizin tasarladığı mimari doğrultusunda saf Three.js (WebGL) prosedürel 3B uzay aracı/astronot geometrilerinin matematiksel koordinatlarının yazılması, HTML5 Canvas prosedürel doku algoritmalarının hızlandırılması, NASA SP-Serisi monografilerden çıkarılan verilerin JSON yapısına (js/data.js) dönüştürülmesi ve Türkçe/İngilizce çift dilli metin kontrolü için yardımcı araç (pair-programmer) olarak kullanılmıştır. Tüm kaynak kod dosyalarında (js/data.js, js/scene.js, js/simulation.js, js/textures.js, js/app.js) hangi modülün nasıl çalıştığını ve hangi NASA verisini işlediğini belirten açık teknik açıklamalar yer almaktadır.

• GÖRÜNÜR FİLİGRAN (Visible Watermark) & NASA LOGOSU KULLANILMAMA KURALI:
1) Projede yapay zekâ görüntü üreteciyle (DALL-E, Midjourney vb.) üretilmiş hiçbir sahte fotoğraf veya yanıltıcı NASA görseli YOKTUR. Arşiv fotoğrafları doğrudan resmi "images-api.nasa.gov" adresinden çekilmektedir.
2) Kod ve algoritmalarla üretilen 3B WebGL simülasyon sahnelerinin ve prosedürel kanvas ekranlarının tamamında, yarışma kuralları gereği kalıcı ve görünür bir filigran rozeti ("✦ AI-ASSISTED PROCEDURAL 3D VISUALIZATION • NASA OPEN DATA • NO NASA LOGO USED") yer almaktadır.
3) Yarışma kurallarına ("NASA logosu ve görsellerini üretilen içerikte kullanmayın") %100 uyum kapsamında, üretilen hiçbir 3B modelde, dokuda veya arayüz elemanında resmi NASA logosu (Meatball veya Worm) kesinlikle kullanılmamıştır.`,
    body_en: `• HUMAN-ORIGINATED CORE CONCEPT & STORYTELLING:
The core concept of "Abandoned, But Not Forgotten", its 5-act sequential narrative arc ("Necessity of Abandonment -> Impacts Turned into Science -> Tireless Rovers -> Crushing Pressure & Methane Seas -> Archaeology of the Future"), and the 1:1 WebXR astronaut walk with climbable ladder and interactive spacecraft interiors were entirely conceived, designed, and directed by our human team. The idea was not generated by AI.

• HOW AI TOOLS WERE USED & INLINE CODE/DATA DOCUMENTATION:
An AI coding assistant (Antigravity / LLM) was used as a pair-programming and productivity tool under human direction to assist with writing mathematical Three.js procedural 3D mesh coordinates, optimizing HTML5 Canvas procedural PBR texture generators, structuring verified metadata from NASA History Series monographs into JSON (js/data.js), and formatting bilingual (TR/EN) localization. All source code and data files include explicit header and inline documentation explaining the algorithms and NASA data mappings.

• VISIBLE WATERMARK & STRICT NO-NASA-LOGO COMPLIANCE:
1) No generative AI raster images (e.g., Midjourney/DALL-E) are used to fake mission photography; all archival photographs are fetched unmodified from NASA's public domain API (images-api.nasa.gov).
2) All procedurally/AI-assisted 3D WebGL viewports and synthesized cockpit canvas displays carry a permanent, visible watermark badge ("✦ AI-ASSISTED PROCEDURAL 3D VISUALIZATION • NASA OPEN DATA • NO NASA LOGO USED") in full compliance with Space Apps rules.
3) In strict adherence to NASA Space Apps rules ("Do not use the NASA logo in generated content"), zero official NASA logos (neither the "Meatball" nor the "Worm" insignia) are used on any generated 3D model, spacesuit patch, texture, or UI element.`
  }
];
