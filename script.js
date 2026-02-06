import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* Firebase設定 */
const firebaseConfig = {
  apiKey: "AIzaSyAY-ofXgWEF0I8L-7mEwwionGtrtLf7fj0",
  authDomain: "bcup-da27b.firebaseapp.com",
  projectId: "bcup-da27b",
  storageBucket: "bcup-da27b.firebasestorage.app",
  messagingSenderId: "1067812351812",
  appId: "1:1067812351812:web:08454b08ca18b20bb57111"
};

/* 初期化 */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 同期用ドキュメント（全端末共通） */
const docRef = doc(db, "sync", "buttons");

/* ボタン生成 */
const buttonContainer = document.getElementById("buttonContainer");
const rows = 3;
const columns = 40;
const totalButtons = rows * columns;

const buttons = [];

for (let i = 1; i <= totalButtons; i++) {
  const button = document.createElement("button");
  button.className = "square-button";
  button.textContent = i;
  button.dataset.id = i;

  // Read-only mode: disable all click interactions
  button.disabled = true;
  button.style.cursor = 'not-allowed';
  button.style.opacity = '0.8';

  buttonContainer.appendChild(button);
  buttons.push(button);
}

/* リアルタイム同期 */
onSnapshot(docRef, (snapshot) => {
  const data = snapshot.data() || {};
  const labels = data.labels || {};
  const colors = data.colors || {};
  buttons.forEach(button => {
    const id = button.dataset.id;
    // ラベル
    if (labels[id] !== undefined) {
      button.textContent = labels[id];
    } else {
      button.textContent = id;
    }
    // 色
    const color = colors[id] || 'none';
    button.dataset.color = color;
    button.style.backgroundColor = color === 'none' ? '#e0e0e0' : color;
    button.style.color = (color === 'black') ? '#ffffff' : '#000000';
  });
});

/* タイトル横の色リセットボタン */
const resetBtn = document.getElementById('resetColors');
if (resetBtn) {
  resetBtn.disabled = true;
  resetBtn.style.cursor = 'not-allowed';
  resetBtn.style.opacity = '0.6';
}

/* リザルト（赤のボタンの文字を表示） */
const showBtn = document.getElementById('showResults');
const resultsModal = document.getElementById('resultsModal');
const resultsList = document.getElementById('resultsList');
const closeModal = document.getElementById('closeModal');

function openResultsModal(lines) {
  if (!resultsModal || !resultsList) return;
  resultsList.innerHTML = '';
  lines.forEach(line => {
    const div = document.createElement('div');
    div.textContent = line;
    resultsList.appendChild(div);
  });
  resultsModal.classList.remove('hidden');
}

function closeResultsModal() {
  if (!resultsModal) return;
  resultsModal.classList.add('hidden');
}

// close handlers
if (closeModal) closeModal.addEventListener('click', closeResultsModal);
if (resultsModal) resultsModal.addEventListener('click', (e) => {
  if (e.target === resultsModal) closeResultsModal();
});

if (showBtn) {
  showBtn.addEventListener('click', () => {
    // 色ごとにラベルを収集（'none' は除外）
    const colorMap = {};
    buttons.forEach(b => {
      const c = (b.dataset.color || '').toString().toLowerCase();
      if (!c || c === 'none') return;
      const txt = b.textContent.trim();
      if (!colorMap[c]) colorMap[c] = [];
      colorMap[c].push(txt);
    });

    if (Object.keys(colorMap).length === 0) {
      openResultsModal(['今週は優秀やったね']);
      return;
    }

    const sortList = (arr) => arr.slice().sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });

    const mapLabel = (col) => {
      const m = { black: '黒', red: '赤', orange: '橙', yellow: '黄' };
      return m[col] || col;
    };

    const preferred = ['black', 'red', 'orange', 'yellow'];
    const lines = [];
    // 優先色を先に追加
    preferred.forEach(col => {
      if (colorMap[col]) {
        lines.push(`[${mapLabel(col)}]${sortList(colorMap[col]).join(',')}`);
        delete colorMap[col];
      }
    });
    // 残りの色をアルファベット順で追加
    Object.keys(colorMap).sort().forEach(col => {
      lines.push(`[${mapLabel(col)}]${sortList(colorMap[col]).join(',')}`);
    });

    openResultsModal(lines);
  });
}
