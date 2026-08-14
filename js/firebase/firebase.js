// Firebase設定 - ここをあなたの設定に置き換えてください
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAy9BtVenAtxhrkezF-3gqmMkM7MbAs-DM",
  authDomain: "chatly-96293.firebaseapp.com",
  databaseURL: "https://chatly-96293-default-rtdb.firebaseio.com",
  projectId: "chatly-96293",
  storageBucket: "chatly-96293.firebasestorage.app",
  messagingSenderId: "24153547118",
  appId: "1:24153547118:web:4529699b640708f3a4e17f",
  measurementId: "G-QF545W9GWQ",
};

// Firebaseを初期化
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// グローバルスコープで const auth / const database を宣言しない
// これをすると他の script.js などと同名の識別子が衝突するため
window.chatlyFirebase = {
  auth: firebase.auth(),
  database: firebase.database(),
};
