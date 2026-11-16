# Halısaha Menajeri

Football Manager 27 tarzı oyuncu profili ve 7'ye 7 halısaha kadro/taktik ekranı. Telefonu yan tutarak kullanılır. Her alan düzenlenebilir.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Yayınlanan sayfa. Elle düzenleme; `build.sh` üretir. |
| `kaynak.html` | Sayfanın kaynağı (tasarım + uygulama kodu). Değişiklik burada yapılır. |
| `cloud.js` | Google ile giriş ve kadronun hesaba kaydı (Firebase). |
| `firebase-config.js` | Firebase proje bilgileri. **Kendi değerlerinle doldurman gerekir.** |
| `firestore.rules` | Veritabanı güvenlik kuralları (herkes sadece kendi kadrosunu görür). |
| `build.sh` | `kaynak.html` dosyasından `index.html` üretir. |

Sunucu yok: GitHub Pages sadece statik dosya yayınlar, "backend" işini Firebase görür (giriş + veritabanı). Ücretsiz plan bu proje için yeterlidir.

## 1. Firebase kurulumu (Google girişi + kayıt)

1. https://console.firebase.google.com adresinde **Proje ekle** ile bir proje oluştur (Analytics gerekmez).
2. **Build > Authentication > Get started > Sign-in method > Google** sağlayıcısını etkinleştir, destek e-postasını seç, kaydet.
3. **Authentication > Settings > Authorized domains > Add domain** ile `kadirakarca.github.io` alan adını ekle.
4. **Build > Firestore Database > Create database** (Production mode, bölge: `europe-west3` olabilir).
5. Firestore **Rules** sekmesine `firestore.rules` dosyasının içeriğini yapıştır ve **Publish** de.
6. **Proje ayarları (dişli) > Genel > Uygulamalarınız > Web (`</>`)** ile bir web uygulaması kaydet. Çıkan `firebaseConfig` değerlerini `firebase-config.js` içindeki `BURAYA_...` alanlarına yapıştır.

`firebase-config.js` doldurulmadan site yine çalışır; sadece giriş düğmesi yerine "Google girişi henüz kurulmadı" yazar ve veriler cihazda kalır.

## 2. Bilgisayarda deneme

`cloud.js` modül olduğu için dosyaya çift tıklayarak (file://) giriş çalışmaz. Küçük bir yerel sunucu aç:

```sh
cd ~/Desktop/fm-halisaha
python3 -m http.server 8000
```

Sonra http://localhost:8000 adresini aç. (`localhost` Firebase'de varsayılan olarak yetkilidir.)

## 3. GitHub'a gönderme

```sh
cd ~/Desktop/fm-halisaha
./build.sh
git init
git add .
git commit -m "Halısaha Menajeri"
git branch -M main
git remote add origin https://github.com/kadirakarca/fm_player.git
git push -u origin main
```

## 4. GitHub Pages ile yayınlama

1. GitHub'da repo sayfasında **Settings > Pages** bölümüne gir.
2. **Source: Deploy from a branch**, **Branch: `main`**, klasör **`/ (root)`** seç ve **Save** de.
3. Bir iki dakika sonra site şu adreste açılır: https://kadirakarca.github.io/fm_player/
4. Telefonda bu adresi aç, Google ile giriş yap. Tarayıcı menüsünden "Ana ekrana ekle" dersen uygulama gibi açılır.

Not: ücretsiz GitHub hesabında Pages için reponun **public** olması gerekir.

## Güncelleme

`kaynak.html` dosyasını değiştir, sonra:

```sh
./build.sh
git add . && git commit -m "güncelleme" && git push
```

## Bilinmesi gerekenler

- Giriş yapmayan kullanıcının verisi sadece kendi tarayıcısında saklanır. Giriş yapınca kadro hesaba yazılır ve her cihazdan açılır.
- Hesapta kadro varken başka bir cihazda farklı bir kadroyla giriş yapılırsa hangisinin kalacağı sorulur.
- Fotoğraflar kadro verisinin içinde saklanır. Bir hesabın toplam verisi yaklaşık 1 MB ile sınırlıdır (onlarca fotoğraflı oyuncu sığar).
- `firebase-config.js` içindeki değerler gizli anahtar değildir, repoda durabilir. Güvenliği Firestore kuralları ve yetkili alan adları sağlar.
