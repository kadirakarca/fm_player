// Google ile giriş + kadronun hesaba kaydı (Firebase Auth + Firestore).
// Uygulama bu dosya olmadan da çalışır; giriş yapılmazsa veriler sadece cihazda kalır.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const box = document.getElementById('cloud');
const HM = window.HM;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const configured = firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith('BURAYA');

if (!box || !HM) {
  // uygulama yüklenmedi
} else if (!configured) {
  box.innerHTML = '<span>Google girişi henüz kurulmadı. Veriler bu cihazda saklanıyor.</span>';
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  let user = null, status = '', pushT = null, conflict = null;

  const ref = () => doc(db, 'users', user.uid);
  const hasPlayers = s => !!(s && s.teams && s.teams.some(t => t.players && t.players.length));

  function render() {
    if (!user) {
      box.innerHTML = `<button class="gbtn" id="gIn">Google ile giriş yap</button><span>Giriş yaparsan kadron hesabına kaydedilir ve her cihazdan açılır.</span>${status ? `<span>${esc(status)}</span>` : ''}`;
      document.getElementById('gIn').onclick = login;
      return;
    }
    if (conflict) {
      box.innerHTML = `<span>Hesabında kayıtlı bir kadro var, bu cihazda da farklı bir kadro var. Hangisi kalsın?</span>
        <button class="mini on" id="useCloud">Hesaptaki kadroyu aç</button><button class="mini" id="useLocal">Bu cihazdakini hesaba yaz</button>`;
      document.getElementById('useCloud').onclick = () => { const c = conflict; conflict = null; c.uid = user.uid; HM.set(c); status = 'Hesaptaki kadro açıldı'; render(); };
      document.getElementById('useLocal').onclick = () => { conflict = null; HM.get().uid = user.uid; push(); render(); };
      return;
    }
    box.innerHTML = `${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<b>${esc(user.displayName || user.email || 'Hesap')}</b><span>${esc(status)}</span><button class="mini" id="gOut">Çıkış yap</button>`;
    document.getElementById('gOut').onclick = () => signOut(auth);
  }

  async function login() {
    try { status = ''; await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) {
      status = e && e.code === 'auth/unauthorized-domain' ? 'Bu alan adı Firebase\'de yetkili değil (Authentication > Settings > Authorized domains).'
        : e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') ? '' : 'Giriş yapılamadı. Tekrar dene.';
      render();
    }
  }

  async function push() {
    if (!user || conflict) return;
    const s = HM.get(); s.uid = user.uid;
    const json = JSON.stringify(s);
    if (json.length > 950000) { status = 'Kadro çok büyük (fotoğrafları azalt), hesaba kaydedilemedi'; render(); return; }
    status = 'Kaydediliyor…'; render();
    try { await setDoc(ref(), { state: json, ts: s.ts || Date.now() }); status = 'Hesaba kaydedildi'; }
    catch (e) { status = 'Hesaba kaydedilemedi, bağlantını kontrol et'; }
    render();
  }

  async function pull() {
    status = 'Kadro yükleniyor…'; render();
    try {
      const snap = await getDoc(ref());
      const local = HM.get();
      if (!snap.exists()) { status = ''; if (hasPlayers(local)) await push(); else { local.uid = user.uid; status = 'Giriş yapıldı'; render(); } return; }
      const data = snap.data(), cloud = JSON.parse(data.state);
      if (local.uid === user.uid) {
        if ((data.ts || 0) > (local.ts || 0)) { cloud.uid = user.uid; HM.set(cloud); status = 'Hesaptaki kadro açıldı'; }
        else if ((local.ts || 0) > (data.ts || 0)) { await push(); return; }
        else status = 'Hesaba kaydedildi';
      } else if (hasPlayers(local)) { conflict = cloud; }
      else { cloud.uid = user.uid; HM.set(cloud); status = 'Hesaptaki kadro açıldı'; }
    } catch (e) { status = 'Hesaptaki kadro okunamadı, bağlantını kontrol et'; }
    render();
  }

  HM.onSave = () => { if (!user || conflict) return; clearTimeout(pushT); pushT = setTimeout(push, 1500); };
  onAuthStateChanged(auth, u => { user = u; conflict = null; status = ''; render(); if (u) pull(); });
  render();
}
