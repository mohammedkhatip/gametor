// استيراد مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, startAfter, limit, doc, setDoc, where  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// إعداد Firebase
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

let currentSlide = 0;
let autoScrollInterval;

window.addEventListener('DOMContentLoaded', async () => {
  await loadData();

  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  if (nextBtn) nextBtn.addEventListener('click', () => nextSlide());
  if (prevBtn) prevBtn.addEventListener('click', () => prevSlide());
});

async function loadData() {
  const container = document.getElementById('slider-container');
  container.innerHTML = '<p style="color:white;text-align:center;">جاري تحميل الألعاب...</p>';

  try {
    const snapshot = await getDocs(
      query(collection(db, "games"), orderBy("currentDate", "desc"), limit(5))
    );
    
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displaygames(games);
  } catch (error) {
    console.error("فشل تحميل الألعاب:", error);
    container.innerHTML = '<p style="color:red;text-align:center;">فشل تحميل البيانات.</p>';
  }
}

function displaygames(games) {
  const container = document.getElementById('slider-container');
  container.innerHTML = '';

  if (games.length === 0) {
    container.innerHTML = '<p style="color:white;text-align:center;">لا توجد ألعاب لعرضها.</p>';
    return;
  }

  games.forEach((game, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (index === 0 ? ' active' : '');
    slide.innerHTML = `
      <a href="games.html?id=${game.id}" style="text-decoration: none; color: inherit;">
        <img src="${game.images?.[0] || ''}" alt="${game.title || 'بدون عنوان'}">
      </a>
    `;
    container.appendChild(slide);
  });

  startAutoScroll();
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;

  slides.forEach(slide => slide.classList.remove('active'));

  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function startAutoScroll() {
  stopAutoScroll();
  autoScrollInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function stopAutoScroll() {
  if (autoScrollInterval) clearInterval(autoScrollInterval);
}

// إضافة كتاب جديد (بشكل يدوي فقط بدون انتظار تحديث حي)
async function addgames() {
  const { value: formValues } = await Swal.fire({
    title: 'إضافة لعبة جديدة',
    html: `
      <input id="title" class="swal2-input" placeholder="اسم اللعبة">
      <input id="cover" class="swal2-input" placeholder="رابط الغلاف الرئيسي">
      <input id="image1" class="swal2-input" placeholder="رابط صورة 1 (اختياري)">
      <input id="image2" class="swal2-input" placeholder="رابط صورة 2 (اختياري)">
      <input id="image3" class="swal2-input" placeholder="رابط صورة 3 (اختياري)">
      <input id="image4" class="swal2-input" placeholder="رابط صورة 4 (اختياري)">
      <input id="downloadUrl" class="swal2-input" placeholder="رابط التحميل">
      <textarea id="description" class="swal2-textarea" placeholder="وصف اللعبة (اختياري)"></textarea>
      <input id="size" class="swal2-input" placeholder="الحجم (مثال: 5MB)">
      <input id="downloadSize" class="swal2-input" placeholder="حجم التنزيل (مثال: 2MB)">
      <input id="downloadCount" type="number" min="0" class="swal2-input" placeholder="عدد التحميلات (افتراضي 0)">
    `,
    focusConfirm: false,
    confirmButtonText: 'حفظ',
    cancelButtonText: 'إلغاء',
    showCancelButton: true,
    preConfirm: () => {
      const currentDate = new Date().toISOString();
      const downloadCountValue = parseInt(document.getElementById('downloadCount').value.trim());
      return {
        title: document.getElementById('title').value.trim(),
        cover: document.getElementById('cover').value.trim(),
        images: [
          document.getElementById('image1').value.trim(),
          document.getElementById('image2').value.trim(),
          document.getElementById('image3').value.trim(),
          document.getElementById('image4').value.trim(),
        ].filter(url => url),
        downloadUrl: document.getElementById('downloadUrl').value.trim(),
        description: document.getElementById('description').value.trim(), // وصف اللعبة
        size: document.getElementById('size').value.trim(),
        downloadSize: document.getElementById('downloadSize').value.trim(),
        downloadCount: isNaN(downloadCountValue) ? 0 : downloadCountValue,
        currentDate,
      };
    }
  });

  if (formValues && formValues.title && formValues.downloadUrl) {
    try {
      const gameId = formValues.title.replace(/\s+/g, '-');
      const docRef = doc(db, "games", gameId);
      await setDoc(docRef, formValues);
      Swal.fire('تم!', 'تمت إضافة اللعبة بنجاح.', 'success');
      loadData();
    } catch (error) {
      console.error("خطأ أثناء الإضافة:", error);
      Swal.fire('خطأ!', 'فشل إضافة اللعبة. حاول مجددًا.', 'error');
    }
  } else if (formValues) {
    Swal.fire('تنبيه!', 'اسم اللعبة ورابط التحميل مطلوبان.', 'warning');
  }
}


  
  


document.querySelector(".logo").addEventListener("click",()=>{
  window.location.href = "index.html";
});

let currentPage = 1;

// تحميل الألعاب عند فتح الصفحة
document.getElementById('addBookBtn').addEventListener('click', addgames);
window.addEventListener('DOMContentLoaded', function() {
    loadGamesData(currentPage);
    loadData();
});

// تحميل الألعاب من Firestore حسب التاريخ
async function loadGamesData(page = 1) {
    const container = document.getElementById('games-container');
    container.innerHTML = '<p>جاري تحميل الألعاب...</p>';
    
    try {
        // جلب الألعاب من Firestore وترتيبها حسب تاريخ الإضافة (currentDate) بشكل تنازلي
        const snapshot = await getDocs(
            query(collection(db, "games"), orderBy("currentDate", "desc"), limit(1 * page)) // جلب 9 ألعاب لكل صفحة
        );

        // تحويل البيانات إلى مصفوفة من الألعاب
        const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // عرض الألعاب
        displayGames(games);
        
    } catch (error) {
        console.error("فشل تحميل الألعاب:", error);
        container.innerHTML = '<p>تعذر تحميل البيانات. يرجى التحقق من الاتصال.</p>';
        Swal.fire("خطأ", "حدثت مشكلة أثناء تحميل البيانات من Firestore.", "error");
    }
};

// دالة لعرض الألعاب بشكل مربعات في 3 صفوف، كل صف يحتوي على 3 ألعاب
const gamesRef = collection(db, "games");
const gamesPerPage = 12
let totalGames = 0;
let totalPages = 0;
let lastVisibleDocs = [];
let allDocs = [];

async function getTotalGamesCount() {
    const snapshot = await getDocs(query(gamesRef, orderBy("currentDate", "desc"))); // الترتيب من الأحدث للأقدم
    allDocs = snapshot.docs;
    totalGames = allDocs.length;
    totalPages = Math.ceil(totalGames / gamesPerPage);

    for (let i = 0; i < totalPages; i++) {
        const lastDocIndex = (i + 1) * gamesPerPage - 1;
        if (allDocs[lastDocIndex]) {
            lastVisibleDocs[i] = allDocs[lastDocIndex];
        }
    }
}

async function loadGamesData1(page = 1) {
    let q;

    if (page === 1) {
        q = query(gamesRef, orderBy("currentDate", "desc"), limit(gamesPerPage));
    } else {
        const startDoc = lastVisibleDocs[page - 2];
        q = query(gamesRef, orderBy("currentDate", "desc"), startAfter(startDoc), limit(gamesPerPage));
    }

    const snapshot = await getDocs(q);
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    currentPage = page;
    displayGames(games);
}


function displayGames(games) {
    const container = document.getElementById('games-container');
    container.innerHTML = '';

    let row = document.createElement('div');
    row.classList.add('game-row');

    games.forEach((game, index) => {
        const gameBox = document.createElement('div');
        gameBox.classList.add('game-box');
        
        gameBox.innerHTML = `
            <a href="games.html?id=${game.id}" class="game-link" >
                <img src="${game.cover}" alt="${game.title}" itemprop="image" class="game-img">
                <div>
                    <p itemprop="name">${game.title}</p>
                    <p itemprop="fileSize">${game.size}</p>
                    <meta itemprop="gamePlatform" content="PC" />
                </div>
            </a>
        `;

        row.appendChild(gameBox);

        if ((index + 1) % 4 === 0) {
            container.appendChild(row);
            row = document.createElement('div');
            row.classList.add('game-row');
        }
    });

    if (row.children.length > 0) {
        container.appendChild(row);
    }

    addPagination();
}


function addPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.classList.add('pagination-btn');
        if (i === currentPage) btn.classList.add('active');
        btn.textContent = i;

        btn.addEventListener('click', () => {
            loadGamesData1(i);
        });

        paginationContainer.appendChild(btn);
    }
}

(async () => {
    await getTotalGamesCount();
    await loadGamesData1(currentPage);
})();


//الالعاب الترند
const trendingQuery = query(
  collection(db, "games"),
  where("isTrending", "==", true)
);

const snapshot = await getDocs(trendingQuery);
const trendingGames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

const box = document.getElementById("trending-box");

box.innerHTML = trendingGames.map(game => `
  <a href="games.html?id=${game.id}" class="trend-card">
    <img src="${game.images && game.images.length > 0 ? game.images[0] : 'no-image.png'}" alt="${game.name}" />
    <p>${game.title}</p>
  </a>
`).join('');

