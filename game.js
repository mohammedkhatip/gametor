import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";


// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyClh9692_Vnt7J6svTCtJ7fkk9lSLObZYo",
  authDomain: "bain-sport.firebaseapp.com",
  projectId: "bain-sport",
  storageBucket: "bain-sport.firebasestorage.app",
  messagingSenderId: "516098811724",
  appId: "1:516098811724:web:cd7cae7f7e3ed8a84451e9",
  measurementId: "G-L87XJMS95W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تحميل تفاصيل الكتاب بناءً على ID من URL
async function loadgameDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');

  if (!gameId) {
    alert('اللعبة غير موجود.');
    return;
  }

  try {
    const docRef = doc(db, "games", gameId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const game = docSnap.data();
      displaygameDetails(game);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error loading game:", error);
  }
}

// عرض تفاصيل اللعبة في الصفحة
function displaygameDetails(game) {
  const container = document.getElementById('game-details');

  // تعديل العنوان والوصف للزحف
  document.title = `تحميل لعبة ${game.title || 'بدون عنوان'} مجانا`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", game.description || `حمل الآن لعبة ${game.title || 'غير معروفة'} مجانا بروابط مباشرة وسرعة عالية.`);
  } else {
    const newMeta = document.createElement('meta');
    newMeta.name = "description";
    newMeta.content = game.description || `حمل الآن لعبة ${game.title || 'غير معروفة'} مجانا بروابط مباشرة وسرعة عالية.`;
    document.head.appendChild(newMeta);
  }

  let thumbnailsHtml = '';
  let mainImage = game.images && game.images.length > 0 ? game.images[0] : '';

  if (game.images && game.images.length > 0) {
    thumbnailsHtml = game.images.map((url) => `
      <img src="${url}" onclick="document.getElementById('mainPreview').src='${url}'" class="gallery-thumb">
    `).join('');
  }

  container.innerHTML = `
    <div class="game-details">

      <div class="gallery-container">
        <h1 class="game-title">تحميل لعبة ${game.title || 'بدون عنوان'} مجانا</h1>
        <p> التحميلات : ${game.downloadCount || "*" }</p>
        <img id="mainPreview" src="${mainImage}" alt="صورة اللعبة" class="main-image">
        <div class="thumbnail-container">
          ${thumbnailsHtml}
        </div>
      </div>
      <div class="downloadbox">
        <button class="download-button" onclick="window.open('${game.downloadUrl || '#'}', '_blank')">  <i class="fas fa-download"></i> تحميل اللعبة</button>
        <p><strong>الحجم:</strong> ${game.size || '-'}</p>
        <p><strong>التنزيل:</strong> ${game.downloadSize || '-'}</p>
        <br>
        <p><i class="fa-solid fa-check"></i> مجانية</p>
        <p><i class="fa-solid fa-check"></i> كاملة</p>
        <p><i class="fa-solid fa-check"></i> خالية من الفيروسات</p>
      </div>

    </div>
    <div class="description-box" >
    <h3>حكاية اللعبة : </h3>
    <p>${game.description || '-'}</p>
    </div>
  `;
}


  

// تحميل اللعبة عند فتح الصفحة
window.addEventListener('DOMContentLoaded', loadgameDetails);

document.querySelector(".logo").addEventListener("click",()=>{
    window.location.href = "index.html";
});
