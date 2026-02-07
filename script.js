const { useState, useEffect, useRef } = React;

// Cloudflare WorkerのURL
const WORKER_URL = 'https://icon-upload-proxy.katokato-s-js.workers.dev'; // ⬅️ ステップ3で取得したURL
const API_KEY = 'k4t0sh0-Chatly-app-icon-upload-function-api-8A7EscFtnwiYXMEAccRrs7SoALy75s'; // ⬅️ ステップ2で設定したAPIキー
const RECAPTCHA_SITE_KEY = '6LdZy2IsAAAAAIVyyVYd2NgzzVptaEbX39eAld6_'; // ⬅️ reCAPTCHA v3のサイトキーに変更してください

// ★ 公式アカウントの定義
const OFFICIAL_ACCOUNT = {
  uid: 'official_chatly_announce',
  username: '【公式】Chatly運営',
  email: 'official@chatly.app',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3536/3536569.png',
  isOfficial: true
};

// ★ 管理者UIDのリスト（ここにあなたのUIDを追加してください）
// 確認方法: ブラウザコンソールで firebase.auth().currentUser.uid を実行
const ADMIN_UIDS = [
  'fO8MZETZW5OjB6UkFgfVGbNzgHx2',
];

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
  measurementId: "G-QF545W9GWQ"
};

// Firebaseを初期化
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}



const auth = firebase.auth();
const database = firebase.database();

// SVGアイコンコンポーネント
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const MessageCircleIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ★ 公式バッジアイコン
const OfficialBadgeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

// ★ 公式アカウント用のアバターアイコン（ここに追加）
const OfficialAvatarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#3B82F6" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white" />
  </svg>
);

// 📎 画像添付アイコン
const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

// ❌ 閉じるアイコン
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// 🔍 拡大アイコン
const ZoomInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);


// ⬇️ ここに配置（MessagingApp関数の前）
// 画像キャッシュマネージャー
const imageCache = new Map();

const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    // キャッシュに既にある場合
    if (imageCache.has(src)) {
      resolve(src);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true);
      resolve(src);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
};

// 改良版 AvatarImage コンポーネント
const AvatarImage = ({ src, alt, fallbackText, size = 'w-10 h-10', bgColor = 'bg-blue-500' }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(null);

  React.useEffect(() => {
    if (!src || !src.startsWith('http')) {
      setImageError(true);
      return;
    }

    setImageError(false);
    setImageLoaded(false);

    // 画像をプリロード
    preloadImage(src)
      .then(() => {
        setImageSrc(src);
        setImageLoaded(true);
      })
      .catch((err) => {
        console.error('画像プリロードエラー:', err);
        setImageError(true);
      });
  }, [src]);

  const shouldShowImage = imageSrc && !imageError && imageLoaded;

  return (
    <>
      {shouldShowImage && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${size} rounded-full object-cover`}
        />
      )}
      {!shouldShowImage && (
        <div className={`${size} rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm`}>
          {fallbackText}
        </div>
      )}
    </>
  );
};



// URLプレビューコンポーネント
const UrlPreview = ({ url }) => {
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    // 簡易的なプレビュー情報を取得
    const fetchPreview = async () => {
      try {
        // CORSの問題があるため、実際のOGP取得は難しいので
        // URLからドメイン名とパスを表示する簡易版
        const urlObj = new URL(url);
        setPreview({
          title: urlObj.hostname,
          description: urlObj.pathname,
          image: null
        });
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading || error) return null;

  return (
    <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden hover:border-blue-500 transition-colors">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-gray-50 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {preview.image && (
          <img
            src={preview.image}
            alt="プレビュー"
            className="w-full h-32 object-cover"
          />
        )}
        <div className="p-3">
          <p className="font-semibold text-sm text-gray-800 truncate">
            {preview.title}
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">
            {preview.description}
          </p>
          <p className="text-xs text-blue-500 truncate mt-1">
            {url}
          </p>
        </div>
      </a>
    </div>
  );
};

// ★ 管理者用の一斉送信パネル
const BroadcastPanel = ({ user, onSend }) => {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      alert('メッセージを入力してください');
      return;
    }

    if (!confirm('全ユーザーにこのメッセージを送信しますか？\n\n送信内容:\n' + broadcastMessage)) {
      return;
    }

    setSending(true);
    try {
      await onSend(broadcastMessage);
      setBroadcastMessage('');
      alert('✅ 一斉送信が完了しました！');
    } catch (error) {
      console.error('一斉送信エラー:', error);
      alert('❌ 送信に失敗しました: ' + error.message);
    }
    setSending(false);
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📢</span>
        <h3 className="font-bold text-lg text-yellow-800">一斉送信（管理者専用）</h3>
      </div>
      <p className="text-xs text-yellow-700 mb-3">
        ⚠️ このメッセージは全てのユーザーの公式アカウントチャットに送信されます
      </p>
      <textarea
        value={broadcastMessage}
        onChange={(e) => setBroadcastMessage(e.target.value)}
        placeholder="例: 新機能を追加しました！詳しくは..."
        className="w-full border border-yellow-300 rounded-lg p-3 mb-3 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 resize-none"
        rows="4"
      />
      <div className="flex gap-2">
        <button
          onClick={handleBroadcast}
          disabled={sending || !broadcastMessage.trim()}
          className="flex-1 bg-yellow-500 text-white rounded-lg py-2 font-semibold hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {sending ? '送信中...' : '📤 全ユーザーに送信'}
        </button>
        <button
          onClick={() => setBroadcastMessage('')}
          className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          クリア
        </button>
      </div>
    </div>
  );
};

function MessagingApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  // グループ関連のstate（既存のstateの下に追加）
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [currentView, setCurrentView] = useState('friends'); // 'friends' or 'groups'
  const notifiedMessages = useRef(new Set());
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);
  const [isTabActive, setIsTabActive] = useState(true);
  // プロフィール設定用のstate
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameChangeLoading, setUsernameChangeLoading] = useState(false);
  const [usernameChangeError, setUsernameChangeError] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  // 既存のstate定義の下に追加
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupInfoView, setGroupInfoView] = useState('members'); // 'members', 'name', 'manage'
  const [newGroupName, setNewGroupName] = useState('');
  const [groupNameChangeLoading, setGroupNameChangeLoading] = useState(false);
  const [groupNameChangeError, setGroupNameChangeError] = useState('');

  // ★ メッセージ本文はこれ1つだけ
  const [messageText, setMessageText] = React.useState('');

  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false); // reCAPTCHA v3用
  const [rememberMe, setRememberMe] = useState(false); // ← ログイン状態保持用

  // 既存のstateに追加
  const [allUsers, setAllUsers] = useState([]); // 全ユーザー一覧
  const [searchMode, setSearchMode] = useState('list'); // 'list' or 'search'

  //最後のメッセージ
  const [lastMessages, setLastMessages] = useState({}); //個人
  const [lastGroupMessages, setLastGroupMessages] = useState({}); // グループ

  // 絵文字パネル
  const [showEmoji, setShowEmoji] = React.useState(false);

  const emojiContainer = document.getElementById('emoji-container');

  // グループ画像アップロード用state
  const [uploadingGroupAvatar, setUploadingGroupAvatar] = useState(false);

  // 画像送信用のstate
  const [selectedImage, setSelectedImage] = useState(null); // 選択中の画像
  const [imagePreview, setImagePreview] = useState(null); // プレビューURL
  const [uploadingImage, setUploadingImage] = useState(false); // アップロード中
  const [expandedImage, setExpandedImage] = useState(null); // 拡大表示中の画像
  const imageInputRef = useRef(null); // 画像input要素の参照

  // 77行目から
  const emojiList = [
    // 1. 感情・コミュニケーション
    "😂", "😊", "🤣", "😍", "🥺", "😭", "🤔", "🤨", "😱", "😴", "😋", "🥳", "😎", "🤩", "🙄",
    // 2. リアクション・挨拶
    "🙏", "👍", "🙌", "👏", "👋", "🤝", "👊", "✌️", "👌", "✅", "🆗", "🆙", "🆘", "⚠️", "❌",
    // 3. ハート・きらきら
    "✨", "💖", "❤️", "🔥", "🌈", "🌟", "🍀", "🎀", "🎁", "🎊", "🎉", "🎈", "💎",
    // 4. 食べ物・飲み物
    "☕️", "🍵", "🍺", "🍶", "🍱", "🍣", "🍙", "🍰", "🍦", "🍎", "🍕", "🍔",
    // 5. 仕事・指示
    "🚀", "💡", "💻", "📱", "📩", "📝", "📌", "📢", "🔍", "⚙️", "⏳", "🏃‍♂️", "💨"
  ];

  const [recipientStatus, setRecipientStatus] = useState({ online: false });

  // ★ 絵文字追加（messageTextに直接入れる）
  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    // 連続で入力しやすいように、ここでは setShowEmoji(false) をあえて外すのもアリです
  };

  // 【新規追加】未読数と最後のメッセージを一度に取得
  const updateUnreadCountAndLastMessage = async (friendUid, chatKey) => {
    if (!user || !user.uid) return;

    try {
      const messagesRef = database.ref(`chats/${chatKey}/messages`).limitToLast(50);
      const snapshot = await messagesRef.once('value');

      if (!snapshot.exists()) return;

      let unreadCount = 0;
      let lastMsg = null;
      const messages = [];

      snapshot.forEach((childSnapshot) => {
        const msg = childSnapshot.val();
        messages.push(msg);

        if (msg.sender !== user.uid && !msg.read) {
          unreadCount++;
        }
      });

      // 最後のメッセージを取得
      if (messages.length > 0) {
        lastMsg = messages[messages.length - 1];
      }

      setUnreadCounts(prev => ({
        ...prev,
        [`friend-${friendUid}`]: unreadCount
      }));

      setLastMessages(prev => ({
        ...prev,
        [friendUid]: lastMsg
      }));
    } catch (err) {
      console.error("データ取得エラー:", err);
    }
  };

  // 画像をBase64に変換する関数
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // data:image/png;base64,... の形式から base64部分だけ取り出す
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // アイコンアップロード処理
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック(5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      alert('画像サイズは5MB以下にしてください');
      return;
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPEG、PNG、WebP、GIF形式の画像のみ対応しています');
      return;
    }

    setUploadingAvatar(true);

    try {
      console.log('📤 アップロード開始...');

      // ✅ FormDataを使用（Base64変換なし = 高速）
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
          // Content-Typeは指定しない（自動設定される）
        },
        body: formData
      });

      console.log('📥 レスポンス受信:', response.status);

      const data = await response.json();
      console.log('📦 受取データ:', data);

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      // URLを取得
      const finalUrl = data.url || data.downloadUrl;
      if (!finalUrl) {
        throw new Error('画像URLが返ってきませんでした');
      }

      // FirebaseにURLを保存
      await database.ref(`users/${user.uid}`).update({
        photoURL: finalUrl,
        updatedAt: Date.now()
      });

      setAvatarUrl(finalUrl);
      alert('✅ アイコンを更新しました！');

    } catch (error) {
      console.error('❌ アップロードエラー:', error);
      alert('アップロードに失敗しました: ' + error.message);
    }

    setUploadingAvatar(false);
  };

  // グループアイコンアップロード処理
  const handleGroupAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック(5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      alert('画像サイズは5MB以下にしてください');
      return;
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPEG、PNG、WebP、GIF形式の画像のみ対応しています');
      return;
    }

    setUploadingGroupAvatar(true);

    try {
      console.log('📤 グループアイコンアップロード開始...');

      // ✅ FormDataを使用（Base64変換なし = 高速）
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', `group_${selectedGroup.groupId}`);

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
        },
        body: formData
      });

      console.log('📥 レスポンス受信:', response.status);

      const data = await response.json();
      console.log('📦 受取データ:', data);

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      const finalUrl = data.url || data.downloadUrl;
      if (!finalUrl) {
        throw new Error('画像URLが返ってきませんでした');
      }

      // Firebaseに保存
      await database.ref(`groups/${selectedGroup.groupId}`).update({
        groupImage: finalUrl,
        updatedAt: Date.now()
      });

      alert('✅ グループアイコンを更新しました！');
      setShowGroupSettings(false);
      loadGroups();

    } catch (error) {
      console.error('❌ アップロードエラー:', error);
      alert('アップロードに失敗しました: ' + error.message);
    }

    setUploadingGroupAvatar(false);
  };

  // 画像選択処理
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック(3MB以下)
    if (file.size > 3 * 1024 * 1024) {
      alert('❌ 画像サイズは3MB以下にしてください');
      e.target.value = ''; // リセット
      return;
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ JPEG、PNG、WebP、GIF形式の画像のみ対応しています');
      e.target.value = ''; // リセット
      return;
    }

    // プレビュー用のURLを生成
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

  // 画像選択キャンセル
  const handleCancelImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview); // メモリ解放
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ''; // input要素をリセット
    }
  };

  // 画像アップロード＆送信（個人チャット用）
  const handleSendImage = async () => {
    if (!selectedImage || !selectedFriend) return;

    setUploadingImage(true);

    try {
      console.log('📤 画像アップロード開始...');

      // FormDataで送信
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('userId', `chat_${user.uid}`);

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
        },
        body: formData
      });

      console.log('📥 レスポンス受信:', response.status);

      const data = await response.json();
      console.log('📦 受取データ:', data);

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      // URLを取得
      const imageUrl = data.url || data.downloadUrl;
      if (!imageUrl) {
        throw new Error('画像URLが返ってきませんでした');
      }

      // Firebaseにメッセージとして保存
      const chatKey = [user.uid, selectedFriend.uid].sort().join('_');
      const messagesRef = database.ref(`chats/${chatKey}/messages`);

      await messagesRef.push({
        type: 'image',
        imageUrl: imageUrl,
        sender: user.uid,
        senderName: username,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });

      console.log('✅ 画像メッセージ送信完了');

      // プレビューをクリア
      handleCancelImage();

    } catch (error) {
      console.error('❌ 画像送信エラー:', error);
      alert('画像の送信に失敗しました: ' + error.message);
    }

    setUploadingImage(false);
  };

  // 画像アップロード＆送信（グループチャット用）
  const handleSendGroupImage = async () => {
    if (!selectedImage || !selectedGroup) return;

    setUploadingImage(true);

    try {
      console.log('📤 グループ画像アップロード開始...');

      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('userId', `group_${selectedGroup.groupId}`);

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      const imageUrl = data.url || data.downloadUrl;
      if (!imageUrl) {
        throw new Error('画像URLが返ってきませんでした');
      }

      // Firebaseにメッセージとして保存
      const messagesRef = database.ref(`groupChats/${selectedGroup.groupId}/messages`);

      await messagesRef.push({
        type: 'image',
        imageUrl: imageUrl,
        sender: user.uid,
        senderName: username,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      });

      console.log('✅ グループ画像メッセージ送信完了');

      // プレビューをクリア
      handleCancelImage();

    } catch (error) {
      console.error('❌ グループ画像送信エラー:', error);
      alert('画像の送信に失敗しました: ' + error.message);
    }

    setUploadingImage(false);
  };


  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';

    const d = new Date(timestamp);

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');

    return `${month}/${day} ${hour}:${minute}`;
  };

  const formatChatListDate = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      // 今日 → 時刻
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // それ以外 → 日付
      return date.toLocaleDateString('ja-JP', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  const [settingsView, setSettingsView] = useState('notification');
  const [unreadCounts, setUnreadCounts] = useState({}); // ← ここに追加

  // 設定モーダル統合用
  const [showSettings, setShowSettings] = useState(false);

  //音量調整用state
  const [notificationVolume, setNotificationVolume] = useState(
    parseFloat(localStorage.getItem('notificationVolume') || '0.5')
  );

  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [customSoundFile, setCustomSoundFile] = useState(null);

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') !== 'false'
  );

  const [dataSize, setDataSize] = useState({
    users: { size: 0, count: 0 },
    usernames: { size: 0, count: 0 },
    friends: { size: 0, count: 0 },
    groups: { size: 0, count: 0 },
    chats: { size: 0, count: 0 },
    groupChats: { size: 0, count: 0 },
    total: 0,
    loading: false
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // データサイズをチェックする関数
  const checkDataSize = async () => {
    setDataSize(prev => ({ ...prev, loading: true }));

    try {
      // キャッシュをクリア
      await database.goOffline();
      await new Promise(resolve => setTimeout(resolve, 500));
      await database.goOnline();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const paths = ['users', 'usernames', 'friends', 'groups', 'chats', 'groupChats'];
      const results = {};
      let totalSize = 0;

      for (const path of paths) {
        const snapshot = await database.ref(path).once('value');
        const data = snapshot.val();

        if (data) {
          const dataStr = JSON.stringify(data);
          const sizeInBytes = new Blob([dataStr]).size;
          const count = typeof data === 'object' ? Object.keys(data).length : 0;

          results[path] = {
            size: sizeInBytes,
            count: count
          };

          totalSize += sizeInBytes;
        } else {
          results[path] = { size: 0, count: 0 };
        }
      }

      setDataSize({
        ...results,
        total: totalSize,
        loading: false
      });
    } catch (error) {
      console.error('データサイズ取得エラー:', error);
      setDataSize(prev => ({ ...prev, loading: false }));
    }
  };

  // 音量変更処理
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setNotificationVolume(volume);
    localStorage.setItem('notificationVolume', volume.toString());
  };

  // カスタム通知音の読み込み
  useEffect(() => {
    const savedSound = localStorage.getItem('customNotificationSound');
    if (savedSound) {
      // ファイル名を復元(必要に応じて)
      setCustomSoundFile('カスタム音源');
    }
  }, []);

  // reCAPTCHA v3の初期化
  useEffect(() => {
    if (user) return; // ログイン済みの場合は何もしない

    const initRecaptchaV3 = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA v3 初期化完了');
          setRecaptchaVerified(true); // v3は自動的に検証されるため常にtrue
        });
      }
    };

    if (window.grecaptcha && window.grecaptcha.ready) {
      initRecaptchaV3();
    } else {
      // reCAPTCHAスクリプトの読み込みを待つ
      const checkInterval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          clearInterval(checkInterval);
          initRecaptchaV3();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [user]);

  // グループ名変更関数
  const handleGroupNameChange = async () => {
    if (!newGroupName.trim()) {
      setGroupNameChangeError('グループ名を入力してください');
      return;
    }

    if (newGroupName === selectedGroup.name) {
      setGroupNameChangeError('現在と同じグループ名です');
      return;
    }

    setGroupNameChangeLoading(true);
    setGroupNameChangeError('');

    try {
      // Firebaseのグループ名を更新
      await database.ref(`groups/${selectedGroup.groupId}/name`).set(newGroupName);

      alert('グループ名を変更しました！');
      setNewGroupName('');
      setShowGroupInfo(false);
    } catch (err) {
      console.error('グループ名変更エラー:', err);
      setGroupNameChangeError('グループ名の変更に失敗しました');
    }

    setGroupNameChangeLoading(false);
  };

  // メンバー削除関数
  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`${memberName}をグループから削除しますか？`)) return;

    try {
      await database.ref(`groups/${selectedGroup.groupId}/members/${memberId}`).remove();
      alert(`${memberName}を削除しました`);
    } catch (err) {
      console.error('メンバー削除エラー:', err);
      alert('メンバーの削除に失敗しました');
    }
  };

  const recoverMyFriends = async () => {
    const myUid = user.uid;
    const friendsRef = database.ref('friends');

    const snap = await friendsRef.once('value');
    if (!snap.exists()) {
      alert('friends データが存在しません');
      return;
    }

    const allFriends = snap.val();
    let recoveredCount = 0;

    for (const otherUid of Object.keys(allFriends)) {
      if (otherUid === myUid) continue;

      const otherFriends = allFriends[otherUid];

      // 壊れた構造対策（object でない場合は無視）
      if (typeof otherFriends !== 'object') continue;

      for (const key of Object.keys(otherFriends)) {
        const entry = otherFriends[key];

        if (
          entry &&
          typeof entry === 'object' &&
          entry.uid === myUid
        ) {
          // 🔑 正しい形で復旧
          await database
            .ref(`friends/${myUid}/${otherUid}`)
            .set({
              uid: otherUid,
              username: entry.username || 'unknown',
              addedAt: entry.addedAt || Date.now()
            });

          recoveredCount++;
          break;
        }
      }
    }

    alert(`復旧完了：${recoveredCount} 人`);
  };


  // グループにメンバーを追加
  const handleAddMemberToGroup = async (friend) => {
    try {
      await database.ref(`groups/${selectedGroup.groupId}/members/${friend.uid}`).set({
        username: friend.username,
        joinedAt: Date.now()
      });
      alert(`${friend.username}を追加しました！`);
    } catch (err) {
      console.error('メンバー追加エラー:', err);
      alert('メンバーの追加に失敗しました');
    }
  };

  // グループ削除関数（権限チェック付き）
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    // 作成者のみ削除可能
    if (selectedGroup.createdBy !== user.uid) {
      alert('グループの作成者のみが削除できます');
      return;
    }

    const confirmMessage = `「${selectedGroup.name}」を削除しますか？\n\n※ このグループの全てのメッセージも削除されます。\n※ この操作は取り消せません。`;

    if (!confirm(confirmMessage)) return;

    // 二重確認
    const finalConfirm = confirm('本当に削除しますか？');
    if (!finalConfirm) return;

    setLoading(true);

    try {
      await database.ref(`groups/${selectedGroup.groupId}`).remove();
      await database.ref(`groupChats/${selectedGroup.groupId}`).remove();

      alert('グループを削除しました');
      setShowGroupInfo(false);
      setSelectedGroup(null);
      setMessages([]);
    } catch (err) {
      console.error('グループ削除エラー:', err);
      alert('グループの削除に失敗しました');
    }

    setLoading(false);
  };

  //グループ最後のメッセージ
  const updateLastGroupMessage = (groupId) => {
    const messagesRef = database.ref(`groupChats/${groupId}/messages`).limitToLast(1);
    messagesRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const msgs = snapshot.val();
        const lastMsg = Object.values(msgs)[0];
        setLastGroupMessages(prev => ({
          ...prev,
          [groupId]: lastMsg
        }));
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        console.log('ログインユーザー:', user.uid); // デバッグ用

        try {
          const userRef = database.ref(`users/${user.uid}`);
          const snapshot = await userRef.once('value');
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('ユーザーデータ:', userData); // デバッグ用
            console.log('photoURL:', userData.photoURL); // ← 追加
            setUsername(userData.username);
            setAvatarUrl(userData.photoURL || '');
            loadFriends(user.uid);
            loadGroups(user.uid);
          } else {
            console.log('ユーザーデータが存在しません');
          }
        } catch (err) {
          console.error('ユーザーデータ取得エラー:', err);
        }
      } else {
        setUser(null);
        setUsername('');
        setAvatarUrl('');
        setFriends([]);
        setGroups([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // MessagingApp関数内に追加
  useEffect(() => {
    if (!user) return;

    const userStatusRef = database.ref(`/status/${user.uid}`);
    const connectedRef = database.ref('.info/connected');

    // 接続状態の監視
    const unsubscribe = connectedRef.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        // オンライン状態を設定
        userStatusRef.set({
          online: true,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        });

        // タブを閉じたときに自動的にオフラインに設定
        userStatusRef.onDisconnect().set({
          online: false,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
      }
    });


    // Page Visibility APIでタブの表示/非表示を監視
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // タブがバックグラウンド(でも開いている)
        userStatusRef.update({
          online: true,
          state: 'away'
        });
      } else {
        // タブがフォアグラウンド
        userStatusRef.update({
          online: true,
          state: 'active'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      connectedRef.off('value', unsubscribe);
    };
  }, [user]);

  // 相手のオンライン状態を監視
  useEffect(() => {
    if (!selectedFriend) return;

    // 公式アカウントは常にオンライン
    if (selectedFriend.isOfficial) {
      setRecipientStatus({ online: true });
      return;
    }

    // 通常のユーザーのステータスを監視
    const statusRef = database.ref(`/status/${selectedFriend.uid}`);
    statusRef.on('value', (snapshot) => {
      setRecipientStatus(snapshot.val() || { online: false });
    });

    return () => statusRef.off();
  }, [selectedFriend]);

  // 時間の経過を表示する関数
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';

    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return new Date(timestamp).toLocaleDateString('ja-JP');
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
      console.log('タブ状態:', document.hidden ? '非アクティブ' : 'アクティブ');
    };
    const handleFocus = () => setIsTabActive(true);
    const handleBlur = () => setIsTabActive(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const textareaRef = React.useRef(null);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    const el = textareaRef.current;
    if (!el) return;

    // 高さをリセット（縮むように）
    el.style.height = "auto";

    // 内容に応じて高さ調整
    el.style.height = el.scrollHeight + "px";
  };


  const resetTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const usersRef = database.ref('users');
      const snapshot = await usersRef.once('value');

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = Object.keys(usersData)
          .filter(uid => uid !== user.uid) // 自分を除外
          .map(uid => ({
            uid: uid,
            username: usersData[uid].username,
            email: usersData[uid].email
          }))
          .filter(u => !friends.some(f => f.uid === u.uid)); // 既に友達の人を除外

        setAllUsers(usersList);
      }
    } catch (err) {
      console.error('ユーザー一覧取得エラー:', err);
    }
    setLoading(false);
  };

  const handleAddFriendFromList = async (friendData) => {
    setLoading(true);
    try {
      const now = Date.now();

      // 自分 → 相手
      await database.ref(`friends/${user.uid}/${friendData.uid}`).set({
        uid: friendData.uid,
        username: friendData.username,
        addedAt: now
      });

      // 相手 → 自分
      await database.ref(`friends/${friendData.uid}/${user.uid}`).set({
        uid: user.uid,
        username: username,
        addedAt: now
      });

      alert(`${friendData.username}を友達に追加しました!`);
      loadAllUsers(); // 一覧を再読み込み
    } catch (err) {
      console.error('友達追加エラー:', err);
      alert('友達の追加に失敗しました');
    }
    setLoading(false);
  };

  // バックグラウンドで全チャットを監視（リアルタイムリスナー版）
  useEffect(() => {
    if (!user || isTabActive) {
      return;
    }

    const listeners = [];

    // 友達のチャットを監視
    if (friends && friends.length > 0) {
      friends.forEach(friend => {
        // 現在選択中の友達はスキップ
        if (selectedFriend && selectedFriend.uid === friend.uid) {
          return;
        }

        const chatKey = [user.uid, friend.uid].sort().join('_');
        const messagesRef = database.ref(`chats/${chatKey}/messages`);

        // 新しいメッセージが追加された時のみ実行
        const now = Date.now();

        const listener = messagesRef.limitToLast(1).on('child_added', (snapshot) => {
          const msg = snapshot.val();
          const msgId = snapshot.key;

          // 修正：リスナー開始（now）より前の古いメッセージは無視する
          if (msg.timestamp < now) return;

          if (msg.sender !== user.uid && !msg.read) {
            if (!notifiedMessages.current.has(msgId)) {
              notifiedMessages.current.add(msgId);
              // 通知処理...
              setUnreadCounts(prev => ({
                ...prev,
                [`friend-${friend.uid}`]: (prev[`friend-${friend.uid}`] || 0) + 1
              }));
            }
          }
        });

        listeners.push({ ref: messagesRef, listener });
      });
    }

    // グループチャットを監視
    if (groups && groups.length > 0) {
      groups.forEach(group => {
        // 現在選択中のグループはスキップ
        if (selectedGroup && selectedGroup.groupId === group.groupId) {
          return;
        }

        const messagesRef = database.ref(`groupChats/${group.groupId}/messages`);

        // 新しいメッセージが追加された時のみ実行
        const listener = messagesRef.limitToLast(1).on('child_added', (snapshot) => {
          const msg = snapshot.val();
          const msgId = snapshot.key;

          // 他人からの未読メッセージのみ通知
          if (msg.sender !== user.uid) {
            const readBy = msg.readBy || {};
            if (!readBy[user.uid]) {
              // 既に通知済みかチェック
              if (!notifiedMessages.current.has(msgId)) {
                notifiedMessages.current.add(msgId);
                showNotification(msg.senderName, msg.text, msgId, true, group.name);

                setUnreadCounts(prev => ({
                  ...prev,
                  [`group-${group.groupId}`]: (prev[`group-${group.groupId}`] || 0) + 1 // ✅ 正しいキー形式
                }));
              }
            }
          }
        });

        listeners.push({ ref: messagesRef, listener });
      });
    }

    // クリーンアップ
    return () => {
      listeners.forEach(({ ref, listener }) => {
        ref.off('child_added', listener);
      });
    };
  }, [user, friends, groups, isTabActive, selectedFriend, selectedGroup]);

  // 【修正】loadFriends関数の最後に追加
  const loadFriends = (uid) => {
    const friendsRef = database.ref(`friends/${uid}`);

    // 既存のリスナーをクリーンアップ
    const listeners = [];

    friendsRef.on('value', async (snapshot) => {
      // 古いリスナーを全て解除
      listeners.forEach(({ ref, handler }) => ref.off('value', handler));
      listeners.length = 0;

      if (snapshot.exists()) {
        const friendsData = snapshot.val();
        const friendsList = Object.keys(friendsData).map(key => ({
          ...friendsData[key],
          friendKey: key
        }));

        // ⬇️ 各友達のphotoURLを取得
        const friendsWithPhotos = await Promise.all(
          friendsList.map(async (friend) => {
            try {
              const userSnapshot = await database.ref(`users/${friend.uid}`).once('value');
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                return {
                  ...friend,
                  photoURL: userData.photoURL || null
                };
              }
            } catch (err) {
              console.error('友達の画像取得エラー:', err);
            }
            return friend;
          })
        );

        // ★ 公式アカウントを常にリストの先頭に追加
        friendsWithPhotos.unshift({
          uid: OFFICIAL_ACCOUNT.uid,
          username: OFFICIAL_ACCOUNT.username,
          email: OFFICIAL_ACCOUNT.email,
          avatarUrl: OFFICIAL_ACCOUNT.avatarUrl,
          isOfficial: true
        });

        setFriends(friendsWithPhotos);

        // 各友達の未読数を取得
        friendsWithPhotos.forEach(friend => {
          const chatKey = [uid, friend.uid].sort().join('_');
          updateUnreadCountAndLastMessage(friend.uid, chatKey);

          const messagesRef = database.ref(`chats/${chatKey}/messages`).limitToLast(1);
          const handler = (snapshot) => {
            if (snapshot.exists()) {
              const msgs = snapshot.val();
              const lastMsg = Object.values(msgs)[0];
              setLastMessages(prev => ({
                ...prev,
                [friend.uid]: lastMsg
              }));
            }
          };

          messagesRef.on('value', handler);
          listeners.push({ ref: messagesRef, handler });
        });
      } else {
        // ★ 友達がいない場合も公式アカウントを表示
        setFriends([{
          uid: OFFICIAL_ACCOUNT.uid,
          username: OFFICIAL_ACCOUNT.username,
          email: OFFICIAL_ACCOUNT.email,
          avatarUrl: OFFICIAL_ACCOUNT.avatarUrl,
          isOfficial: true
        }]);
      }
    });
  };

  // 【修正】未読数カウント関数
  const updateUnreadCount = async (friendUid, chatKey) => {
    if (!user || !user.uid) return;

    try {
      // 👇 limitToLast(50)で最新50件のみ取得
      const messagesRef = database.ref(`chats/${chatKey}/messages`).limitToLast(50);
      const snapshot = await messagesRef.once('value');

      if (!snapshot.exists()) return;

      let unreadCount = 0;

      snapshot.forEach((childSnapshot) => {
        const msg = childSnapshot.val();
        if (!msg || !msg.sender) return;

        if (msg.sender !== user.uid && !msg.read) {
          unreadCount++;
        }
      });

      setUnreadCounts(prev => ({
        ...prev,
        [`friend-${friendUid}`]: unreadCount
      }));
    } catch (err) {
      console.error("未読数取得エラー:", err);
    }
  };


  // 【修正】グループ未読数カウント
  const updateGroupUnreadCount = async (groupId) => {
    if (!user || !user.uid) return;

    try {
      // 👇 limitToLast(50)で最新50件のみ取得
      const messagesRef = database.ref(`groupChats/${groupId}/messages`).limitToLast(50);
      const snapshot = await messagesRef.once('value');

      if (snapshot.exists()) {
        let unreadCount = 0;

        snapshot.forEach((childSnapshot) => {
          const msg = childSnapshot.val();
          if (!msg) return;

          if (msg.sender !== user.uid) {
            const readBy = msg.readBy || {};
            if (!readBy[user.uid]) {
              unreadCount++;
            }
          }
        });

        setUnreadCounts(prev => ({
          ...prev,
          [`group-${groupId}`]: unreadCount
        }));
      }
    } catch (err) {
      console.error('グループ未読数取得エラー:', err);
    }
  };


  // 通知権限のリクエスト（ログイン後に実行）
  useEffect(() => {
    if (user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
          if (permission === 'granted') {
            // テスト通知を表示
            new Notification('通知が有効になりました', {
              body: '新しいメッセージが届いたら通知します',
              icon: '💬'
            });
          }
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }
  }, [user]);

  // タブのアクティブ状態を監視
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      setIsTabActive(isActive);
      console.log('タブ状態:', isActive ? 'アクティブ' : '非アクティブ');

      // タブがアクティブになったら既読処理
      if (isActive) {
        if (selectedFriend) {
          setTimeout(() => markMessagesAsRead(), 500);
        } else if (selectedGroup) {
          setTimeout(() => markGroupMessagesAsRead(), 500);
        }
      }
    };

    const handleFocus = () => {
      setIsTabActive(true);
      console.log('ウィンドウフォーカス: アクティブ');
    };

    const handleBlur = () => {
      setIsTabActive(false);
      console.log('ウィンドウフォーカス: 非アクティブ');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedFriend, selectedGroup]);

  // 通知音を再生
  const playNotificationSound = () => {
    try {
      // カスタム通知音が設定されている場合
      const customSound = localStorage.getItem('customNotificationSound');

      if (customSound) {
        const audio = new Audio(customSound);
        audio.volume = 0.5; // 音量50%
        audio.play().catch(err => {
          console.log('カスタム通知音の再生に失敗:', err);
          playDefaultSound(); // 失敗したらデフォルト音
        });
      } else {
        playDefaultSound();
      }
    } catch (error) {
      console.log('通知音の再生に失敗:', error);
    }
  };

  const safeFriends = Object.entries(friends || {})
    .filter(([friendUid, friend]) => {
      // 基本チェック
      if (!friend || typeof friend !== 'object') return false;

      // 必須プロパティ
      if (typeof friend.uid !== 'string') return false;
      if (typeof friend.username !== 'string') return false;

      // 自分自身は除外
      if (friend.uid === user.uid) return false;

      // UID がキーと一致しないものは除外（壊れデータ）
      if (friendUid !== friend.uid) return false;

      return true;
    })
    .map(([friendUid, friend]) => ({
      uid: friend.uid,
      username: friend.username,
      addedAt: friend.addedAt
    }));


  // デフォルトの通知音（ビープ音）
  const playDefaultSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('デフォルト通知音の再生に失敗:', error);
    }
  };

  // 通知音のアップロード処理
  const handleSoundUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // MP3ファイルかチェック
    if (!file.type.includes('audio')) {
      alert('音声ファイル（MP3など）を選択してください');
      return;
    }

    // ファイルサイズチェック（1MB以下）
    if (file.size > 1024 * 1024) {
      alert('ファイルサイズは1MB以下にしてください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const soundData = event.target.result;
      localStorage.setItem('customNotificationSound', soundData);
      setCustomSoundFile(file.name);
      alert('通知音を設定しました！');
    };
    reader.readAsDataURL(file);
  };

  // 通知音をデフォルトに戻す
  const resetNotificationSound = () => {
    localStorage.removeItem('customNotificationSound');
    setCustomSoundFile(null);
    alert('通知音をデフォルトに戻しました');
  };

  // 通知音をテスト再生
  const testNotificationSound = () => {
    playNotificationSound();
  };

  // 通知音プリセット
  const notificationPresets = [
    { name: 'デフォルト（ビープ音）', value: 'default' },
    { name: 'ポップ音', value: 'pop' },
    { name: 'チャイム', value: 'chime' },
    { name: 'カスタム', value: 'custom' }
  ];

  // プリセット音を生成する関数
  const playPresetSound = (preset) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (preset) {
      case 'pop':
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'chime':
        oscillator.frequency.value = 880;
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
      default: // デフォルト
        playDefaultSound();
    }
  };

  // トグル処理
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue.toString());
  };

  // デスクトップ通知を表示
  const showNotification = (senderName, messageText, msgId, isGroup = false, chatName = null) => {
    console.log('通知チェック:', {
      hasNotification: 'Notification' in window,
      permission: notificationPermission,
      isTabActive: isTabActive,
      senderName: senderName,
      messageText: messageText
    });

    if ('Notification' in window && notificationPermission === 'granted') {
      // タブが非アクティブの時のみ通知
      if (!isTabActive) {
        console.log('通知を表示します');

        try {
          playNotificationSound();

          // 通知のタイトルを作成
          let notificationTitle;
          if (isGroup && chatName) {
            notificationTitle = `💬 [${chatName}] ${senderName}より`;
          } else {
            notificationTitle = `💬 ${senderName}からメッセージ`;
          }

          const notification = new Notification(
            notificationTitle,
            {
              body: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
              icon: '💬',
              badge: '💬',
              tag: `message-${Date.now()}`, // 各通知を個別に表示
              requireInteraction: false,
              silent: false
            }
          );

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // 10秒後に自動で閉じる
          setTimeout(() => notification.close(), 10000);
        } catch (error) {
          console.error('通知の表示に失敗:', error);
        }
      } else {
        console.log('タブがアクティブなため通知をスキップ');
      }
    } else {
      console.log('通知の条件を満たしていません');
    }
  };

  // 個人チャットの新着メッセージ監視
  useEffect(() => {
    if (user && selectedFriend) {
      const chatKey = [user.uid, selectedFriend.uid].sort().join('_');
      // .limitToLast(50) を指定。Firebase側でこの50件だけを取得して送ってくれます。
      const messagesRef = database.ref(`chats/${chatKey}/messages`).limitToLast(50);

      let isInitialLoad = true;

      const handleValue = (snapshot) => {
        if (snapshot.exists()) {
          const msgsObj = snapshot.val();

          // 【修正ポイント1】ここで作る変数名を msgs に統一します
          const msgs = Object.keys(msgsObj).map(key => ({
            ...msgsObj[key],
            messageId: key
          })).sort((a, b) => a.timestamp - b.timestamp);

          // 【修正ポイント2】エラーの原因：msgsList ではなく、定義した msgs をセットします
          // これにより「古い会話が残る」問題も解決（上書き）されます
          setMessages(msgs);

          // 新着メッセージのチェック
          if (!isInitialLoad && msgs.length > 0) {
            const latestMessage = msgs[msgs.length - 1];

            // 相手からのメッセージで、まだ通知していない場合
            if (latestMessage.sender !== user.uid &&
              latestMessage.messageId !== lastSeenMessageId) {
              console.log('新着メッセージ検出（個人）:', latestMessage);
              showNotification(selectedFriend.username, latestMessage.text, latestMessage.messageId, false, selectedFriend.username);
              setLastSeenMessageId(latestMessage.messageId);
            }
          }

          isInitialLoad = false;

          // タブがアクティブな時だけ既読にする
          if (isTabActive) {
            setTimeout(() => markMessagesAsRead(), 500);
          }
        } else {
          setMessages([]);
        }
      };

      messagesRef.on('value', handleValue);

      // クリーンアップ：タブを離れる時や友達を変える時に接続を切る
      return () => messagesRef.off('value', handleValue);
    }
  }, [user, selectedFriend, isTabActive]);

  // 【修正】メッセージ取得用：isTabActiveを監視対象から外して再取得を防ぐ
  useEffect(() => {
    if (user && selectedFriend) {
      const chatKey = [user.uid, selectedFriend.uid].sort().join('_');
      console.log('=== 友達チャット読み込み ===');
      console.log('自分のUID:', user.uid);
      console.log('友達のUID:', selectedFriend.uid);
      console.log('友達の名前:', selectedFriend.username);
      console.log('生成されたチャットキー:', chatKey);
      console.log('Firebaseパス:', `chats/${chatKey}/messages`);

      // .limitToLast(50) で最新50件に固定
      const messagesRef = database.ref(`chats/${chatKey}/messages`).limitToLast(50);

      const handleValue = (snapshot) => {
        console.log('メッセージスナップショット取得:', snapshot.exists());
        if (snapshot.exists()) {
          const msgsObj = snapshot.val();
          console.log('取得したメッセージ数:', Object.keys(msgsObj).length);
          console.log('メッセージ内容:', msgsObj);
          // msgsListではなくmsgsに統一
          const msgs = Object.keys(msgsObj).map(key => ({
            ...msgsObj[key],
            messageId: key
          })).sort((a, b) => a.timestamp - b.timestamp);

          // 最新データで上書き（古いデータは消える）
          setMessages(msgs);
        } else {
          console.log('メッセージが存在しません');
          setMessages([]);
        }
      };

      messagesRef.on('value', handleValue);
      // クリーンアップ：接続を解除
      return () => messagesRef.off('value', handleValue);
    }
  }, [user, selectedFriend]);

  // 【追加】既読処理専用：タブがアクティブになった時だけ実行
  useEffect(() => {
    if (isTabActive && user && selectedFriend) {
      const timer = setTimeout(() => markMessagesAsRead(), 500);
      return () => clearTimeout(timer);
    }
  }, [isTabActive, selectedFriend, user]);


  // 【修正】メッセージ取得用：再取得を防ぐ構成
  useEffect(() => {
    if (user && selectedGroup) {
      const messagesRef = database.ref(`groupChats/${selectedGroup.groupId}/messages`).limitToLast(50);

      const handleValue = (snapshot) => {
        if (snapshot.exists()) {
          const msgsObj = snapshot.val();
          const msgs = Object.keys(msgsObj).map(key => ({
            ...msgsObj[key],
            messageId: key
          })).sort((a, b) => a.timestamp - b.timestamp);

          setMessages(msgs);
        } else {
          setMessages([]);
        }
      };

      messagesRef.on('value', handleValue);
      return () => messagesRef.off('value', handleValue);
    }
  }, [user, selectedGroup]);


  // Page Visibility APIでタブの状態を監視
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // タブがバックグラウンド(でも開いている)
      userStatusRef.update({
        online: true, // まだオンライン
        state: 'away' // 離席中
      });
    } else {
      // タブがフォアグラウンド
      userStatusRef.update({
        online: true,
        state: 'active' // アクティブ
      });
    }
  };

  useEffect(() => {
    if (!selectedFriend) return;

    // 公式アカウントは常にオンライン
    if (selectedFriend.isOfficial) {
      setRecipientStatus({ online: true });
      return;
    }

    // 通常のユーザーのステータスを監視
    const statusRef = database.ref(`/status/${selectedFriend.uid}`);
    statusRef.on('value', (snapshot) => {
      setRecipientStatus(snapshot.val() || { online: false });
    });

    return () => statusRef.off();
  }, [selectedFriend]);  // ← ここも selectedChat から selectedFriend に修正

  const isEmojiOnly = (text) => {
    if (!text) return false;

    // 空白を除去
    const trimmed = text.trim();

    // 絵文字だけか判定（Unicode）
    return /^[\p{Emoji}\u200d]+$/u.test(trimmed);
  };

  const linkifyText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if (!urlRegex.test(text)) {
      return text;
    }

    const parts = text.split(urlRegex);

    return (
      <>
        {parts.map((part, index) => {
          if (part.match(/(https?:\/\/[^\s]+)/)) {
            return (
              <React.Fragment key={index}>
                <a
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="message-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {part}
                </a>
                <UrlPreview url={part} />
              </React.Fragment>
            );
          }
          return part;
        })}
      </>
    );
  };


  const markGroupMessagesAsRead = async () => {
    if (!user || !selectedGroup || !isTabActive) return;

    const messagesRef = database.ref(`groupChats/${selectedGroup.groupId}/messages`);

    try {
      const snapshot = await messagesRef.once('value');
      if (snapshot.exists()) {
        const updates = {};
        snapshot.forEach((childSnapshot) => {
          const msg = childSnapshot.val();
          if (msg.sender !== user.uid) {
            const readBy = msg.readBy || {};
            if (!readBy[user.uid]) {
              updates[`${childSnapshot.key}/readBy/${user.uid}`] = {
                username: username,
                readAt: Date.now()
              };
            }
          }
        });
        if (Object.keys(updates).length > 0) {
          console.log('既読更新:', updates);
          await messagesRef.update(updates);
        }
      }
    } catch (err) {
      console.error('既読処理エラー:', err);
    }

    // ← ここに以下の4行を追加
    setUnreadCounts(prev => ({
      ...prev,
      [`group-${selectedGroup.groupId}`]: 0
    }));
  };

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      setError('すべてのフィールドを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ reCAPTCHA v3トークンを取得
      const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'signup' });

      if (!recaptchaToken) {
        setError('reCAPTCHA検証に失敗しました');
        setLoading(false);
        return;
      }

      // ✅ セッションベース
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await database.ref(`users/${user.uid}`).set({
        username: username,
        email: email,
        photoURL: '',
        createdAt: Date.now()
      });

    } catch (err) {
      setError('アカウント作成に失敗しました: ' + err.message);
    }
    setLoading(false);
  };

  // ユーザー名変更機能
  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      setUsernameChangeError('ユーザー名を入力してください');
      return;
    }

    if (newUsername === username) {
      setUsernameChangeError('現在と同じユーザー名です');
      return;
    }

    // ユーザー名の長さチェック
    if (newUsername.length < 3 || newUsername.length > 20) {
      setUsernameChangeError('ユーザー名は3〜20文字にしてください');
      return;
    }

    setUsernameChangeLoading(true);
    setUsernameChangeError('');

    try {
      // 新しいユーザー名が既に使用されているかチェック
      const usernameCheckRef = database.ref(`usernames/${newUsername}`);
      const snapshot = await usernameCheckRef.once('value');

      if (snapshot.exists() && snapshot.val().uid !== user.uid) {
        setUsernameChangeError('このユーザー名は既に使用されています');
        setUsernameChangeLoading(false);
        return;
      }

      // 古いユーザー名のインデックスを削除
      await database.ref(`usernames/${username}`).remove();

      // 新しいユーザー名のインデックスを追加
      await database.ref(`usernames/${newUsername}`).set({
        uid: user.uid,
        username: newUsername
      });

      // ユーザー情報を更新
      await database.ref(`users/${user.uid}`).update({
        username: newUsername,
        updatedAt: Date.now()
      });

      // 友達リストの自分の名前を更新
      const friendsSnapshot = await database.ref('friends').once('value');
      if (friendsSnapshot.exists()) {
        const allFriends = friendsSnapshot.val();
        const updates = {};

        Object.keys(allFriends).forEach(userId => {
          const userFriends = allFriends[userId];
          Object.keys(userFriends).forEach(friendKey => {
            if (userFriends[friendKey].uid === user.uid) {
              updates[`friends/${userId}/${friendKey}/username`] = newUsername;
            }
          });
        });

        if (Object.keys(updates).length > 0) {
          await database.ref().update(updates);
        }
      }

      // グループメンバーの名前を更新
      const groupsSnapshot = await database.ref('groups').once('value');
      if (groupsSnapshot.exists()) {
        const allGroups = groupsSnapshot.val();
        const groupUpdates = {};

        Object.keys(allGroups).forEach(groupId => {
          const group = allGroups[groupId];
          if (group.members && group.members[user.uid]) {
            groupUpdates[`groups/${groupId}/members/${user.uid}/username`] = newUsername;
          }
        });

        if (Object.keys(groupUpdates).length > 0) {
          await database.ref().update(groupUpdates);
        }
      }

      setUsername(newUsername);
      setNewUsername('');
      setShowProfileSettings(false);
      alert('ユーザー名を変更しました!');
    } catch (err) {
      console.error('ユーザー名変更エラー:', err);
      setUsernameChangeError('ユーザー名の変更に失敗しました');
    }

    setUsernameChangeLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ reCAPTCHA v3トークンを取得
      const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'login' });

      if (!recaptchaToken) {
        setError('reCAPTCHA検証に失敗しました');
        setLoading(false);
        return;
      }

      // ✅ チェックボックスの状態に応じて永続性を設定
      if (rememberMe) {
        // ログイン状態を保持（ブラウザを閉じても保持）
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      } else {
        // タブを閉じるとログアウト
        await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      }

      await auth.signInWithEmailAndPassword(email, password);

    } catch (err) {
      setError('ログインに失敗しました: ' + err.message);
    }
    setLoading(false);
  };

  // Googleログイン
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      // ユーザー情報を確認・登録
      const userRef = database.ref(`users/${user.uid}`);
      const snapshot = await userRef.once('value');

      if (!snapshot.exists()) {
        // 新規ユーザーの場合、ユーザー名を生成
        const displayName = user.displayName || user.email.split('@')[0];

        await userRef.set({
          username: displayName,
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: Date.now(),
          provider: 'google'
        });

        // ユーザー名インデックスにも登録
        await database.ref(`usernames/${displayName}`).set({
          uid: user.uid,
          username: displayName
        });
      }
    } catch (err) {
      console.error('Googleログインエラー:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('ログインがキャンセルされました');
      } else if (err.code === 'auth/popup-blocked') {
        setError('ポップアップがブロックされました。ブラウザの設定を確認してください。');
      } else {
        setError('Googleログインに失敗しました: ' + err.message);
      }
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setFriends([]);
    setSelectedFriend(null);
    setMessages([]);
  };

  const handleAddFriend = async () => {
    if (!searchName.trim()) {
      alert('ユーザー名を入力してください');
      return;
    }
    if (searchName === username) {
      alert('自分自身は追加できません');
      return;
    }

    setLoading(true);
    try {
      const usernameRef = database.ref(`usernames/${searchName}`);
      const snapshot = await usernameRef.once('value');

      if (!snapshot.exists()) {
        alert('このユーザーは存在しません');
        setLoading(false);
        return;
      }

      const friendData = snapshot.val();

      if (friendData.uid === user.uid) {
        alert('自分自身は追加できません');
        setLoading(false);
        return;
      }

      // すでに友達か確認（DB基準）
      const alreadyRef = database.ref(`friends/${user.uid}/${friendData.uid}`);
      const alreadySnap = await alreadyRef.once('value');
      if (alreadySnap.exists()) {
        alert('すでに友達です');
        setLoading(false);
        return;
      }

      const now = Date.now();

      // 自分 → 相手
      await database
        .ref(`friends/${user.uid}/${friendData.uid}`)
        .set({
          uid: friendData.uid,
          username: friendData.username,
          addedAt: now
        });

      // 相手 → 自分
      await database
        .ref(`friends/${friendData.uid}/${user.uid}`)
        .set({
          uid: user.uid,
          username: username,
          addedAt: now
        });

      setSearchName('');
      setShowAddFriend(false);
      alert(`${searchName}を友達に追加しました！`);
    } catch (err) {
      console.error('友達追加エラー:', err);
      alert('友達の追加に失敗しました');
    }
    setLoading(false);
  };


  const handleSend = async () => {
    // 画像送信がある場合
    if (selectedImage) {
      await handleSendImage();
      return;
    }

    // ★ 公式アカウントへの送信をブロック
    if (selectedFriend?.uid === OFFICIAL_ACCOUNT.uid) {
      alert('📢 公式アカウントへのメッセージ送信はできません');
      return;
    }

    if (!messageText.trim() || !selectedFriend) return;

    const chatKey = [user.uid, selectedFriend.uid].sort().join('_');
    const messagesRef = database.ref(`chats/${chatKey}/messages`);

    await messagesRef.push({
      type: 'text', // ← typeを明示的に追加
      text: messageText,
      sender: user.uid,
      senderName: username,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    setMessageText('');
    resetTextareaHeight();
  };

  // 個人チャットのメッセージ取り消し
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('このメッセージを取り消しますか?')) return;

    const chatKey = [user.uid, selectedFriend.uid].sort().join('_');
    const messageRef = database.ref(`chats/${chatKey}/messages/${messageId}`);

    try {
      // 元のメッセージを取得
      const snapshot = await messageRef.once('value');
      const originalMessage = snapshot.val();

      // メッセージを削除メッセージに置き換え
      await messageRef.set({
        sender: originalMessage.sender,
        senderName: originalMessage.senderName,
        timestamp: originalMessage.timestamp,
        deleted: true,
        deletedAt: Date.now()
      });
    } catch (err) {
      console.error('取り消しエラー:', err);
      alert('メッセージの取り消しに失敗しました');
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !selectedFriend || !isTabActive) return;

    const chatKey = [user.uid, selectedFriend.uid].sort().join('_');
    const messagesRef = database.ref(`chats/${chatKey}/messages`);

    const snapshot = await messagesRef.once('value'); // 👈 onceを使う
    if (snapshot.exists()) {
      const updates = {};
      snapshot.forEach((childSnapshot) => {
        const msg = childSnapshot.val();
        if (msg.sender !== user.uid && msg.read === false) {
          updates[`${childSnapshot.key}/read`] = true;
        }
      });
      if (Object.keys(updates).length > 0) {
        await messagesRef.update(updates); // 👈 一括更新
      }
    }

    setUnreadCounts(prev => ({
      ...prev,
      [`friend-${selectedFriend.uid}`]: 0
    }));
  };


  // テキスト入力の変更を処理
  const handleChange = (e) => {
    setMessageText(e.target.value);
  };

  const handleKeyDown = (e) => {
    // 1. IME変換中（全角入力中）のチェックを強化
    // Safari対策として e.keyCode === 229 も含めるのが一般的です
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }

    // 2. Enterのみで送信、Shift+Enterは改行
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        // ここで送信処理
        e.preventDefault();

        // 入力欄が空（空白のみ）の場合は送信しない処理も入れておくとより安全です
        const text = e.target.value || "";
        if (text.trim() === "") return;

        if (selectedGroup) {
          handleSendGroupMessage();
        } else {
          handleSend();
        }
      }
      // Shift+Enter の場合は preventDefault しないので、そのまま改行されます
    }
  };


  // グループ一覧の読み込み
  const loadGroups = async (uid) => {
    const groupsRef = database.ref('groups');
    groupsRef.on('value', async (snapshot) => {
      if (snapshot.exists()) {
        const allGroups = snapshot.val();
        const userGroups = Object.keys(allGroups)
          .filter(groupId => {
            const group = allGroups[groupId];
            return group.members && group.members[uid];
          })
          .map(groupId => ({
            groupId: groupId,
            ...allGroups[groupId]
          }));

        // ⬇️ 各グループのメンバーのphotoURLを取得
        const groupsWithMemberPhotos = await Promise.all(
          userGroups.map(async (group) => {
            const membersWithPhotos = {};

            for (const memberId of Object.keys(group.members || {})) {
              try {
                const userSnapshot = await database.ref(`users/${memberId}`).once('value');
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.val();
                  membersWithPhotos[memberId] = {
                    ...group.members[memberId],
                    photoURL: userData.photoURL || null
                  };
                } else {
                  membersWithPhotos[memberId] = group.members[memberId];
                }
              } catch (err) {
                console.error('メンバー画像取得エラー:', err);
                membersWithPhotos[memberId] = group.members[memberId];
              }
            }

            return {
              ...group,
              members: membersWithPhotos
            };
          })
        );

        console.log('グループリスト:', groupsWithMemberPhotos);
        setGroups(groupsWithMemberPhotos);

        // 各グループの未読数を取得と最後の会話
        groupsWithMemberPhotos.forEach(group => {
          updateGroupUnreadCount(group.groupId);
          updateLastGroupMessage(group.groupId);
        });
      } else {
        console.log('グループデータが存在しません');
        setGroups([]);
      }
    });
  };

  // グループ作成
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('グループ名を入力してください');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('メンバーを選択してください');
      return;
    }

    setLoading(true);
    try {
      const groupsRef = database.ref('groups');
      const newGroupRef = groupsRef.push();

      const members = {
        [user.uid]: {
          username: username,
          joinedAt: Date.now()
        }
      };

      selectedMembers.forEach(member => {
        members[member.uid] = {
          username: member.username,
          joinedAt: Date.now()
        };
      });

      await newGroupRef.set({
        name: groupName,
        createdBy: user.uid,
        createdAt: Date.now(),
        members: members
      });

      setGroupName('');
      setSelectedMembers([]);
      setShowCreateGroup(false);
      alert('グループを作成しました！');
    } catch (err) {
      console.error('グループ作成エラー:', err);
      alert('グループの作成に失敗しました');
    }
    setLoading(false);
  };

  const handleSendGroupMessage = async () => {
    // 画像送信がある場合
    if (selectedImage) {
      await handleSendGroupImage();
      return;
    }

    if (!messageText.trim() || !selectedGroup) return;

    const messagesRef = database.ref(`groupChats/${selectedGroup.groupId}/messages`);

    await messagesRef.push({
      type: 'text', // ← typeを明示的に追加
      text: messageText,
      sender: user.uid,
      senderName: username,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    });

    setMessageText('');
    resetTextareaHeight();
  };

  // ★ 一斉送信機能
  const handleBroadcastMessage = async (message) => {
    if (!ADMIN_UIDS.includes(user.uid)) {
      throw new Error('管理者権限がありません');
    }

    console.log('一斉送信開始...');

    // 全ユーザーを取得
    const usersSnapshot = await database.ref('users').once('value');
    const allUsers = [];

    usersSnapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      // 公式アカウント以外の全ユーザー（管理者自身も含む）に送信
      if (childSnapshot.key !== OFFICIAL_ACCOUNT.uid) {
        allUsers.push({
          uid: childSnapshot.key,
          username: userData.username
        });
      }
    });

    console.log(`${allUsers.length}人のユーザーに送信します...`);
    console.log('送信対象ユーザー:', allUsers);
    console.log('現在のユーザーUID:', user.uid);

    // 各ユーザーにメッセージを送信
    const promises = allUsers.map(async (targetUser) => {
      const chatKey = [OFFICIAL_ACCOUNT.uid, targetUser.uid].sort().join('_');
      console.log(`送信先: ${targetUser.username} (${targetUser.uid}), チャットキー: ${chatKey}`);
      const messagesRef = database.ref(`chats/${chatKey}/messages`);

      return messagesRef.push({
        text: message,
        sender: OFFICIAL_ACCOUNT.uid,
        senderName: OFFICIAL_ACCOUNT.username,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        isOfficial: true
      });
    });

    await Promise.all(promises);
    console.log('一斉送信完了！');
  };

  // グループチャットのメッセージ取り消し
  const handleDeleteGroupMessage = async (messageId) => {
    if (!confirm('このメッセージを取り消しますか?')) return;

    const messageRef = database.ref(`groupChats/${selectedGroup.groupId}/messages/${messageId}`);

    try {
      // 元のメッセージを取得
      const snapshot = await messageRef.once('value');
      const originalMessage = snapshot.val();

      // メッセージを削除メッセージに置き換え
      await messageRef.set({
        sender: originalMessage.sender,
        senderName: originalMessage.senderName,
        timestamp: originalMessage.timestamp,
        deleted: true,
        deletedAt: Date.now(),
        readBy: originalMessage.readBy || {}
      });
    } catch (err) {
      console.error('取り消しエラー:', err);
      alert('メッセージの取り消しに失敗しました');
    }
  };

  // メンバー選択のトグル
  const toggleMemberSelection = (friend) => {
    const isSelected = selectedMembers.some(m => m.uid === friend.uid);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.uid !== friend.uid));
    } else {
      setSelectedMembers([...selectedMembers, friend]);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              💬
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Chatly</h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'アカウントを作成' : 'ログイン'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Googleログインボタン */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-50 transition-colors disabled:bg-gray-100 mb-4 flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            Googleでログイン<span class="google-develop">(開発中)</span>
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500">現在は使用できません</span>
            </div>

          </button>

          {/* メール/パスワードログイン */}
          {isSignUp && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-green-500"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-green-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (isSignUp ? handleSignUp() : handleLogin())}
            placeholder="パスワード"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-green-500"
          />

          {/* ✅ reCAPTCHA v3 (非表示で自動実行) */}

          {/* ✅ ログイン状態を保持するチェックボックス（ログイン時のみ） */}
          {!isSignUp && (
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                ログイン状態を保持する
              </label>
            </div>
          )}

          <button
            onClick={isSignUp ? handleSignUp : handleLogin}
            disabled={loading}
            className="w-full bg-green-500 text-white rounded-lg py-3 font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
          >
            {loading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
          </button>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="w-full text-green-600 hover:text-green-700 text-sm"
          >
            {isSignUp ? 'すでにアカウントをお持ちですか?ログイン' : 'アカウントを作成'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col custom-scrollbar">
        <div className="p-4 bg-green-500 text-white">
          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center">
              <button
                onClick={() => {
                  setShowSettings(true);
                  setSettingsView('profile');
                  setNewUsername(username);
                }}
                className="hover:opacity-80 transition-opacity"
                title="プロフィール設定"
              >
                <AvatarImage
                  src={avatarUrl}   // ← ★ここが重要
                  alt="プロフィール"
                  fallbackText={username ? username[0].toUpperCase() : "?"}
                  size="w-10 h-10"
                  bgColor="bg-white bg-opacity-30"
                />
              </button>

              <div className="ml-3">
                <h1 className="text-lg font-bold">{username}</h1>
                <p className="text-xs opacity-90">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* 通知設定ボタン */}
              {notificationPermission !== 'granted' && (
                <button
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        setNotificationPermission(permission);
                        if (permission === 'granted') {
                          alert('通知が有効になりました！');
                          new Notification('通知テスト', {
                            body: 'これがデスクトップ通知です',
                            icon: '💬'
                          });
                        } else {
                          alert('通知が拒否されました。ブラウザの設定から許可してください。');
                        }
                      });
                    }
                  }}
                  className="p-2 hover:bg-green-600 rounded-full transition-colors"
                  title="通知を有効化"
                >
                  🔔
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-green-600 rounded-full transition-colors"
                title="ログアウト"
              >
                <LogOutIcon />
              </button>
            </div>
          </div>

          {/* 統合設定モーダル */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 m-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ 設定</h2>

                {/* タブ切り替えボタン */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSettingsView('notification')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${settingsView === 'notification'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    🔔 通知
                  </button>
                  <button
                    onClick={() => {
                      setSettingsView('profile');
                      setNewUsername(username);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${settingsView === 'profile'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    👤 プロフィール
                  </button>
                  <button
                    onClick={() => {
                      setSettingsView('data');
                      checkDataSize();
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${settingsView === 'data'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    📊 データ
                  </button>
                </div>

                {/* 通知設定タブ */}
                {settingsView === 'notification' && (
                  <div>
                    {/* 現在の設定 */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">現在の通知音:</p>
                      <p className="text-sm font-semibold">
                        {customSoundFile || localStorage.getItem('customNotificationSound')
                          ? (customSoundFile || '🎵 カスタム音源')
                          : '🔊 デフォルト(ビープ音)'}
                      </p>
                    </div>

                    {/* 通知音の有効/無効 */}
                    <div className="mb-4 flex items-center">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={toggleSound}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">
                        通知音を有効にする
                      </label>
                    </div>

                    {/* 音量調整 */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2 volume">
                        通知音の音量: {Math.round(notificationVolume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={notificationVolume}
                        onChange={handleVolumeChange}
                        className="w-full"
                      />
                    </div>

                    {/* 通知音アップロード */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2">
                        カスタム通知音をアップロード(MP3など)
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleSoundUpload}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ※ 1MB以下の音声ファイルを選択してください
                      </p>
                    </div>

                    {/* テスト再生ボタン */}
                    <button
                      onClick={testNotificationSound}
                      className="w-full bg-blue-500 text-white rounded-lg py-2 mb-3 hover:bg-blue-600 transition-colors"
                    >
                      🔊 通知音をテスト再生
                    </button>

                    {/* デフォルトに戻す */}
                    {(customSoundFile || localStorage.getItem('customNotificationSound')) && (
                      <button
                        onClick={resetNotificationSound}
                        className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 mb-3 hover:bg-gray-300 transition-colors"
                      >
                        🔄 デフォルト音に戻す
                      </button>
                    )}
                  </div>
                )}

                {/* プロフィール設定タブ */}
                {settingsView === 'profile' && (
                  <div>
                    {/* 🆕 アイコン画像アップロード */}
                    <div className="mb-6 text-center">
                      <p className="text-sm text-gray-600 mb-3">プロフィール画像</p>

                      <div className="inline-block relative">
                        {avatarUrl || user.photoURL ? (
                          <img
                            src={avatarUrl || user.photoURL}
                            alt="アイコン"
                            className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-4xl border-4 border-gray-400">
                            {username.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* カメラボタン */}
                        <label className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-green-600 shadow-lg transition-transform hover:scale-110">
                          📷
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={uploadingAvatar}
                          />
                        </label>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {uploadingAvatar ? '⏳ アップロード中...' : '📸 クリックして画像を変更(最大5MB)'}
                      </p>
                    </div>

                    {/* 既存のユーザー名変更部分はそのまま */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">現在のユーザー名:</p>
                      <p className="text-lg font-semibold text-gray-800">{username}</p>
                    </div>

                    {/* エラー表示 */}
                    {usernameChangeError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {usernameChangeError}
                      </div>
                    )}

                    {/* 新しいユーザー名入力 */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2">
                        新しいユーザー名 (3〜20文字)
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => {
                          setNewUsername(e.target.value);
                          setUsernameChangeError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleUsernameChange()}
                        placeholder="新しいユーザー名を入力"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 change-username"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ※ 変更すると友達リストとグループの表示名も更新されます
                      </p>
                      <div className="warning-box">
                        <div>
                          注意:以下の文字は使用できません。
                        </div>
                        <p>{"特殊文字( { } . / $ # )"}</p>
                        <p>ただし、スペース、絵文字は利用可能です。</p>
                      </div>
                    </div>

                    {/* 変更ボタン */}
                    <button
                      onClick={handleUsernameChange}
                      disabled={usernameChangeLoading || !newUsername.trim()}
                      className="w-full bg-green-500 text-white rounded-lg py-3 font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 mb-3"
                    >
                      {usernameChangeLoading ? '変更中...' : 'ユーザー名を変更'}
                    </button>
                  </div>
                )}

                {/* ⬇️ ここに追加 */}
                {/* データサイズタブ */}
                {settingsView === 'data' && (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 Firebaseに保存されているデータのサイズを確認できます
                      </p>
                    </div>

                    {dataSize.loading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-500 mb-3"></div>
                        <p className="text-sm text-gray-600">データを取得中...</p>
                      </div>
                    ) : (
                      <div>
                        {/* 合計サイズ */}
                        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-600 mb-1">合計データサイズ</p>
                          <p className="text-3xl font-bold text-green-600">
                            {(dataSize.total / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            ({(dataSize.total / (1024 * 1024)).toFixed(3)} MB)
                          </p>
                        </div>

                        {/* 各データの詳細 */}
                        <div className="space-y-2">
                          {[
                            { key: 'users', label: '👤 ユーザー情報', color: 'blue' },
                            { key: 'usernames', label: '📝 ユーザー名一覧', color: 'purple' },
                            { key: 'friends', label: '👥 友達リスト', color: 'green' },
                            { key: 'groups', label: '🏢 グループ情報', color: 'yellow' },
                            { key: 'chats', label: '💬 個人チャット', color: 'pink' },
                            { key: 'groupChats', label: '💬 グループチャット', color: 'indigo' }
                          ].map(({ key, label, color }) => {
                            const data = dataSize[key] || { size: 0, count: 0 };
                            const sizeKB = (data.size / 1024).toFixed(2);
                            const percentage = dataSize.total > 0 ? ((data.size / dataSize.total) * 100).toFixed(1) : 0;

                            return (
                              <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                                  <span className="text-xs text-gray-500">{data.count}件</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex-1 mr-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">{sizeKB} KB</p>
                                    <p className="text-xs text-gray-500">{percentage}%</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* 再確認ボタン */}
                        <button
                          onClick={checkDataSize}
                          className="w-full mt-4 bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors"
                        >
                          🔄 データを再確認
                        </button>

                        {/* 説明 */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                          <p className="font-semibold mb-1">📌 データサイズについて</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>無料プラン: ストレージ 1GB まで</li>
                            <li>現在の使用率: {((dataSize.total / (1024 * 1024 * 1024)) * 100).toFixed(3)}%</li>
                            <li>文字メッセージは非常に軽量です</li>
                            <li>画像を保存すると大幅に増加します</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 閉じるボタン */}
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setNewUsername('');
                    setUsernameChangeError('');
                  }}
                  className="w-full bg-gray-500 text-white rounded-lg py-2 hover:bg-gray-600 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

          {/* タブ切り替え */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                setCurrentView('friends');
                setSelectedGroup(null);
              }}
              className={`relative flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${currentView === 'friends' ? 'bg-white text-green-600' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              友達
              {(() => {
                const totalUnread = Object.keys(unreadCounts)
                  .filter(key => key.startsWith('friend-'))
                  .reduce((sum, key) => sum + (unreadCounts[key] || 0), 0);
                return totalUnread > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                ) : null;
              })()}
            </button>
            <button
              onClick={() => {
                setCurrentView('groups');
                setSelectedFriend(null);
              }}
              className={`relative flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${currentView === 'groups' ? 'bg-white text-green-600' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              グループ
              {(() => {
                const totalUnread = Object.keys(unreadCounts)
                  .filter(key => key.startsWith('group-'))
                  .reduce((sum, key) => sum + (unreadCounts[key] || 0), 0);
                return totalUnread > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                ) : null;
              })()}
            </button>
          </div>

          <button
            onClick={() => {
              if (currentView === 'friends') {
                setShowAddFriend(true);
                setSearchMode('list'); // 一覧モードに設定
                loadAllUsers(); // ユーザー一覧を読み込み
              } else {
                setShowCreateGroup(true);
              }
            }}
            className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center"
          >
            <span className="mr-2"><UserPlusIcon /></span>
            {currentView === 'friends' ? '友達を追加' : 'グループ作成'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentView === 'friends' ? (
            // 既存の友達リスト表示コード
            friends.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="flex justify-center mb-4 opacity-50">
                  <MessageCircleIcon size={48} />
                </div>
                <p>友達がいません</p>
                <p className="text-sm mt-2">上のボタンから<br />友達を追加しましょう</p>
              </div>
            ) : (
              [...friends]
                .sort((a, b) => {
                  // 最後のメッセージのタイムスタンプを取得
                  const timeA = lastMessages[a.uid]?.timestamp || a.addedAt || 0;
                  const timeB = lastMessages[b.uid]?.timestamp || b.addedAt || 0;
                  // 新しい順（降順）にソート
                  return timeB - timeA;
                })

                .map((friend, index) => {
                  const unreadCount = unreadCounts[`friend-${friend.uid}`] || 0;
                  const lastMsg = lastMessages[friend.uid];

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedGroup(null);
                        setMessages([]);
                        setSelectedFriend(friend);
                        setUnreadCounts(prev => ({
                          ...prev,
                          [`friend-${friend.uid}`]: 0
                        }));
                      }}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedFriend?.uid === friend.uid ? 'bg-gray-100' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center flex-1 min-w-0">
                            {/* アバター画像の表示 */}
                            {friend.isOfficial ? (
                              // 公式アカウントの場合はSVGアイコン
                              <div className="w-12 h-12 flex-shrink-0">
                                <OfficialAvatarIcon />
                              </div>
                            ) : friend.photoURL && friend.photoURL.startsWith('http') ? (
                              // 通常ユーザーで画像URLがある場合
                              <img
                                src={friend.photoURL}
                                alt={friend.username}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}

                            {/* フォールバック: 文字アイコン */}
                            <div
                              className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                              style={{ display: friend.isOfficial || (friend.photoURL && friend.photoURL.startsWith('http')) ? 'none' : 'flex' }}
                            >
                              {(friend.username ?? '?').charAt(0).toUpperCase()}
                            </div>

                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 flex items-center gap-1">
                                {friend.username}
                                {friend.isOfficial && <OfficialBadgeIcon />}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {lastMsg
                                  ? (lastMsg.type === 'image'
                                    ? (lastMsg.sender === user.uid ? '📷 画像を送信しました' : '📷 画像を受信しました')
                                    : isEmojiOnly(lastMsg.text)
                                      ? (lastMsg.sender === user.uid ? 'スタンプを送信しました' : 'スタンプを受信しました')
                                      : (lastMsg.text || '').substring(0, 25) + ((lastMsg.text || '').length > 25 ? '...' : ''))
                                  : 'タップしてチャット'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                            {formatChatListDate(lastMessages[friend.uid]?.timestamp)}
                          </span>

                          {unreadCount > 0 && (
                            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )
          ) : (

            // グループリスト表示
            groups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="flex justify-center mb-4 opacity-50">
                  <MessageCircleIcon size={48} />
                </div>
                <p>グループがありません</p>
                <p className="text-sm mt-2">上のボタンから<br />グループを作成しましょう</p>
              </div>
            ) : (
              [...groups]
                .sort((a, b) => {
                  // 最後のメッセージのタイムスタンプを取得
                  const timeA = lastGroupMessages[a.groupId]?.timestamp || a.createdAt || 0;
                  const timeB = lastGroupMessages[b.groupId]?.timestamp || b.createdAt || 0;
                  // 新しい順（降順）にソート
                  return timeB - timeA;
                })

                .map((group, index) => {
                  const unreadCount = unreadCounts[`group-${group.groupId}`] || 0;
                  const lastMsg = lastGroupMessages[group.groupId];

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedFriend(null);
                        setMessages([]);
                        setSelectedGroup(group);
                        setUnreadCounts(prev => ({
                          ...prev,
                          [`group-${group.groupId}`]: 0
                        }));
                      }}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedGroup?.groupId === group.groupId ? 'bg-gray-100' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center flex-1">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              <AvatarImage
                                src={group.groupPhotoURL}
                                alt={group.name}
                                fallbackText="👥"
                                size="w-12 h-12"
                                bgColor="bg-purple-500"
                              />
                            </div>

                            {/* メッセージ表示エリア */}
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800">{group.name}</h3>

                              {/* 最後のメッセージを表示 */}
                              {lastMsg ? (
                                <div className="flex items-center text-sm text-gray-500 min-w-0">
                                  {/* 送信者のアイコン */}
                                  <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                                    {lastMsg.senderName ? lastMsg.senderName.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  {/* メッセージ内容 */}
                                  <p className="truncate">
                                    {lastMsg.type === 'image'
                                      ? '📷 画像を送信しました'
                                      : isEmojiOnly(lastMsg.text)
                                        ? `スタンプを送信しました`
                                        : `${lastMsg.text || ''}`}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  {Object.keys(group.members || {}).length}人のメンバー  {/* ← ここは group で正しい */}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                            {formatChatListDate(lastGroupMessages[group.groupId]?.timestamp)}
                          </span>

                          {/* 未読バッジ */}
                          {unreadCount > 0 && (
                            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {(selectedFriend || selectedGroup) ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                {/* グループの場合はクリック可能に */}
                {selectedGroup ? (
                  <button
                    onClick={() => {
                      setShowGroupInfo(true);
                      setNewGroupName(selectedGroup.name);
                    }}
                    className="hover:opacity-80 transition-opacity"
                    title="グループ情報"
                  >
                    <AvatarImage
                      src={selectedGroup.groupPhotoURL}
                      alt={selectedGroup.name}
                      fallbackText="👥"
                      size="w-10 h-10"
                      bgColor="bg-purple-500"
                    />
                  </button>
                ) : (
                  // ⬇️ 個人チャットの場合、画像があれば表示
                  selectedFriend.photoURL && selectedFriend.photoURL.startsWith('http') ? (
                    <AvatarImage
                      src={selectedFriend.photoURL}
                      alt={selectedFriend.username}
                      fallbackText={selectedFriend.username.charAt(0).toUpperCase()}
                      size="w-10 h-10"
                      bgColor="bg-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-blue-500">
                      {selectedFriend.username.charAt(0).toUpperCase()}
                    </div>
                  )
                )}
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-1">
                    {selectedGroup ? selectedGroup.name : selectedFriend.username}
                    {!selectedGroup && selectedFriend.isOfficial && <OfficialBadgeIcon />}
                  </h2>
                  <p className={`text-sm ${selectedGroup
                    ? 'text-green-600 font-semibold'
                    : (selectedFriend.isOfficial || recipientStatus.online)
                      ? 'text-green-600 font-semibold' // ここに指定のクラスを配置
                      : 'text-gray-400'
                    }`}>
                    {selectedGroup
                      ? `${Object.keys(selectedGroup.members || {}).length}人のメンバー`
                      : (selectedFriend.isOfficial || recipientStatus.online)
                        ? 'オンライン'
                        : recipientStatus.lastSeen
                          ? `最終接続: ${getTimeAgo(recipientStatus.lastSeen)}`
                          : 'オフライン'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* ★ 管理者用一斉送信パネル（公式アカウント選択時のみ表示） */}
            {!selectedGroup && selectedFriend && selectedFriend.uid === OFFICIAL_ACCOUNT.uid && ADMIN_UIDS.includes(user.uid) && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <BroadcastPanel user={user} onSend={handleBroadcastMessage} />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="flex justify-center mb-4 opacity-50">
                      <MessageCircleIcon size={48} />
                    </div>
                    <p>メッセージがありません</p>
                    <p className="text-sm mt-2">最初のメッセージを送信しましょう！</p>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => {
                  const isMe = message.sender === user.uid;
                  const isDeleted = message.deleted === true;
                  const isImageMessage = message.type === 'image' && !!message.imageUrl;

                  const readBy = message.readBy || {};
                  const readCount = Object.keys(readBy).length;
                  const totalMembers = selectedGroup ? Object.keys(selectedGroup.members || {}).length - 1 : 0;

                  // デバッグ用（コンソールで確認）
                  if (selectedGroup && isMe) {
                    console.log('メッセージID:', message.messageId, '既読者:', readBy);
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'} fade-in`}
                    >
                      {!isMe && !isDeleted && (
                        selectedGroup ? (
                          (() => {
                            const sender = selectedGroup.members[message.sender];
                            const senderPhotoURL = sender?.photoURL;

                            return (
                              <AvatarImage
                                src={senderPhotoURL}
                                alt={message.senderName}
                                fallbackText={message.senderName ? message.senderName.charAt(0).toUpperCase() : '?'}
                                size="w-8 h-8"
                                bgColor="bg-purple-500"
                              />
                            );
                          })()
                        ) : (
                          <AvatarImage
                            src={selectedFriend.photoURL}
                            alt={selectedFriend.username}
                            fallbackText={selectedFriend.username.charAt(0).toUpperCase()}
                            size="w-8 h-8"
                            bgColor="bg-blue-500"
                          />
                        )
                      )}

                      <div className="max-w-xs lg:max-w-md message-wrapper">
                        {/* 削除されていないメッセージのみ削除ボタンを表示 */}
                        {isMe && !isDeleted && (
                          <button
                            onClick={() => selectedGroup ? handleDeleteGroupMessage(message.messageId) : handleDeleteMessage(message.messageId)}
                            className="delete-button delete-button-right"
                            title="取り消し"
                          >
                            ×
                          </button>
                        )}

                        <div>
                          {!isMe && selectedGroup && !isDeleted && (
                            <p className="text-xs text-gray-600 mb-1 px-2">{message.senderName}</p>
                          )}

                          {/* 削除されたメッセージの表示 */}
                          {isDeleted ? (
                            <div className="rounded-2xl px-4 py-2 bg-gray-200 border border-gray-300">
                              <p className="text-sm text-gray-500 italic">
                                メッセージの送信を取り消しました。
                              </p>
                            </div>
                          ) : (
                            isImageMessage ? (
                              <div
                                className="cursor-pointer"
                                onClick={() => setExpandedImage(message.imageUrl)}
                              >
                                <img
                                  src={message.imageUrl}
                                  alt="送信画像"
                                  className="max-w-xs rounded-lg hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">読み込み失敗</text></svg>';
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-green-500 text-white' : 'bg-white text-gray-800'
                                  }`}
                              >
                                <div
                                  className={`break-words whitespace-pre-wrap ${isEmojiOnly(message.text)
                                    ? 'text-6xl leading-none text-center'
                                    : 'text-base'
                                    }`}
                                >
                                  {isEmojiOnly(message.text) ? message.text : linkifyText(message.text)}
                                </div>
                              </div>
                            )
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 px-2">
                            <span>{formatDateTime(message.timestamp)}</span>

                            {/* 削除されていないメッセージのみ既読表示 */}
                            {!isDeleted && isMe && selectedGroup && (
                              <span className="text-xs text-green-600 font-semibold">
                                既読 {readCount}/{totalMembers}
                              </span>
                            )}
                            {!isDeleted && isMe && !selectedGroup && message.read !== undefined && (
                              <span className={`text-xs font-semibold ${message.read ? 'text-green-600' : 'text-gray-500'}`}>
                                {message.read ? '既読' : '未読'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isMe && !isDeleted && (
                        <AvatarImage
                          src={user?.photoURL || avatarUrl}
                          alt={username}
                          fallbackText={username.charAt(0).toUpperCase()}
                          size="w-8 h-8"
                          bgColor="bg-green-500"
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ★ メッセージ入力エリア */}
            {!selectedGroup && selectedFriend && selectedFriend.uid === OFFICIAL_ACCOUNT.uid ? (
              // 公式アカウント選択時は送信不可の表示
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                <div className="flex items-center justify-center gap-3 text-gray-700">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-blue-700">公式アカウント - 通知専用</p>
                    <p className="text-xs text-gray-600">このアカウントへのメッセージ送信はできません</p>
                  </div>
                </div>
              </div>
            ) : (
              // 通常のメッセージ入力エリア
              <div className="bg-white border-t border-gray-200 p-4">
                {/* 画像プレビュー */}
                {imagePreview && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg relative">
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="プレビュー"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">📸 画像を送信</p>
                        <p className="text-xs text-gray-500">{(selectedImage.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={handleCancelImage}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        disabled={uploadingImage}
                      >
                        <XIcon />
                      </button>
                    </div>
                  </div>
                )}

                {/* 入力欄 */}
                <div className="flex items-end gap-2">
                  {/* 絵文字パネル */}
                  {showEmoji && (
                    <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-xl p-3 shadow-2xl z-50 w-72">
                      <div className="grid grid-cols-5 gap-2 text-2xl max-h-60 overflow-y-auto custom-scrollbar">
                        {emojiList.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="hover:bg-gray-100 p-1 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 絵文字ボタン（背景なし） */}
                  <button
                    onClick={() => {
                      console.log('emoji button clicked');
                      setShowEmoji(prev => !prev);
                    }}
                    className="text-2xl px-2"
                    title="絵文字を選択"
                  >
                    😊
                  </button>

                  {/* 画像選択ボタン（丸型・背景なし） */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage || !!imagePreview}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    title="画像を選択"
                  >
                    📎
                  </button>

                  {/* テキスト入力（枠なし・背景なし） */}
                  <textarea
                    ref={textareaRef}
                    className="flex-1 rounded-lg px-4 py-3 resize-none focus:outline-none disabled:bg-gray-100"
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={uploadingImage ? "📤 画像を送信中..." : "メッセージを入力　（Shift ＋ Enterで改行）"}
                    rows="1"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={uploadingImage}
                  />

                  {/* 送信ボタン（丸型） */}
                  <button
                    onClick={selectedGroup ? handleSendGroupMessage : handleSend}
                    disabled={(!messageText.trim() && !imagePreview) || uploadingImage}
                    className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors disabled:bg-gray-300"
                  >
                    {uploadingImage ? '📤' : <SendIcon />}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="flex justify-center mb-4 opacity-30">
                <MessageCircleIcon size={64} />
              </div>
              <p className="text-lg">友達を選択してチャットを開始</p>
            </div>
          </div>
        )}
      </div>

      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 m-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">友達を追加</h2>

            {/* タブ切り替え */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setSearchMode('list');
                  loadAllUsers();
                }}
                className={`flex-1 py-2 rounded-lg ${searchMode === 'list'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200'
                  }`}
              >
                一覧から選択
              </button>
              <button
                onClick={() => setSearchMode('search')}
                className={`flex-1 py-2 rounded-lg ${searchMode === 'search'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200'
                  }`}
              >
                名前で検索
              </button>
            </div>

            {/* 一覧モード */}
            {searchMode === 'list' ? (
              <div className="space-y-2">
                {allUsers.map(user => (
                  <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriendFromList(user)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      追加
                    </button>
                  </div>
                ))}
                {allUsers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    追加できる友達がいません
                  </p>
                )}
              </div>
            ) : (
              // 検索モード（既存のコード）
              <>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="ユーザー名を入力"
                  className="w-full border rounded-lg px-4 py-3 mb-4"
                />
                <button
                  onClick={handleAddFriend}
                  className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">追加</button>
              </>
            )}

            <button
              onClick={() => setShowAddFriend(false)}
              className="w-full mt-4 bg-gray-500 text-white rounded-lg py-2"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* グループ作成モーダル */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 m-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">グループ作成</h2>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="グループ名"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-green-500"
            />

            <p className="text-sm text-gray-600 mb-2">メンバーを選択:</p>
            <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {friends.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">友達がいません</p>
              ) : (
                friends.map((friend, index) => (
                  <div
                    key={index}
                    onClick={() => toggleMemberSelection(friend)}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center ${selectedMembers.some(m => m.uid === friend.uid) ? 'bg-green-50' : ''
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.some(m => m.uid === friend.uid)}
                      onChange={() => { }}
                      className="mr-3"
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{friend.username}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim() || selectedMembers.length === 0}
                className="flex-1 bg-green-500 text-white rounded-lg py-3 font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300"
              >
                {loading ? '作成中...' : '作成'}
              </button>
              <button
                onClick={() => {
                  setShowCreateGroup(false);
                  setGroupName('');
                  setSelectedMembers([]);
                }}
                className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* グループ情報モーダル */}
      {showGroupInfo && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ℹ️ グループ情報</h2>

            {/* タブ切り替えボタン */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setGroupInfoView('members')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${groupInfoView === 'members'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                👥 メンバー
              </button>
              <button
                onClick={() => setGroupInfoView('name')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${groupInfoView === 'name'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                ✏️ 名前変更
              </button>
              <button
                onClick={() => setGroupInfoView('manage')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${groupInfoView === 'manage'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                ⚙️ 管理
              </button>
            </div>

            {/* 各タブの内容 */}
            {/* ここに手順7-9の内容を追加 */}
            {/* メンバー一覧タブ */}
            {groupInfoView === 'members' && (
              <div>
                {/* ⬇️ グループアイコン画像アップロード */}
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">グループアイコン</p>

                  <div className="inline-block relative">
                    <AvatarImage
                      src={selectedGroup.groupPhotoURL}
                      alt={selectedGroup.name}
                      fallbackText="👥"
                      size="w-24 h-24"
                      bgColor="bg-purple-500"
                    />

                    {/* カメラボタン */}
                    {selectedGroup.createdBy === user.uid && (
                      <label className="absolute bottom-0 right-0 bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-purple-600 shadow-lg transition-transform hover:scale-110">
                        📷
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleGroupAvatarUpload}
                          className="hidden"
                          disabled={uploadingGroupAvatar}
                        />
                      </label>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {uploadingGroupAvatar ? '⏳ アップロード中...' : (
                      selectedGroup.createdBy === user.uid
                        ? '📸 クリックして画像を変更(最大5MB)'
                        : 'グループアイコン'
                    )}
                  </p>
                </div>

                {/* 既存のメンバーリスト */}
                <p className="text-sm text-gray-600 mb-3">
                  グループメンバー ({Object.keys(selectedGroup.members || {}).length}人)
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(selectedGroup.members || {}).map(([memberId, member]) => (
                    <div key={memberId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      {/* ⬇️ メンバーの画像を表示 */}
                      {member.photoURL && member.photoURL.startsWith('http') ? (
                        <img
                          src={member.photoURL}
                          alt={member.username}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{member.username}</p>
                        <p className="text-xs text-gray-500">
                          {memberId === user.uid ? 'あなた' : '参加日: ' + new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 名前変更タブ */}
            {groupInfoView === 'name' && (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">現在のグループ名:</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedGroup.name}</p>
                </div>

                {groupNameChangeError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {groupNameChangeError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    新しいグループ名
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                      setGroupNameChangeError('');
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleGroupNameChange()}
                    placeholder="新しいグループ名を入力"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                  />
                </div>

                <button
                  onClick={handleGroupNameChange}
                  disabled={groupNameChangeLoading || !newGroupName.trim()}
                  className="w-full bg-green-500 text-white rounded-lg py-3 font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 mb-3"
                >
                  {groupNameChangeLoading ? '変更中...' : 'グループ名を変更'}
                </button>
              </div>
            )}

            {/* メンバー管理タブ */}
            {groupInfoView === 'manage' && (
              <div>
                {/* メンバー削除セクション */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">メンバーの削除</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(selectedGroup.members || {}).map(([memberId, member]) => {
                      if (memberId === user.uid) return null; // 自分は削除できない
                      return (
                        <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">{member.username}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(memberId, member.username)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* メンバー追加セクション */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">メンバーの追加</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {friends.filter(friend => !selectedGroup.members[friend.uid]).map((friend) => (
                      <div key={friend.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm">{friend.username}</span>
                        </div>
                        <button
                          onClick={() => handleAddMemberToGroup(friend)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          追加
                        </button>
                      </div>
                    ))}
                    {friends.filter(friend => !selectedGroup.members[friend.uid]).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">追加できる友達がいません</p>
                    )}
                  </div>
                </div>

                {/* グループ削除セクション */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {selectedGroup.createdBy === user.uid ? (
                    <>
                      <p className="text-sm font-semibold text-red-600 mb-2">⚠️ 危険な操作</p>
                      <p className="text-xs text-gray-600 mb-3">
                        グループを削除すると、全てのメッセージと履歴が完全に削除されます。この操作は取り消せません。
                      </p>
                      <button
                        onClick={handleDeleteGroup}
                        disabled={loading}
                        className="w-full bg-red-500 text-white rounded-lg py-3 font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300"
                      >
                        {loading ? '削除中...' : '🗑️ グループを削除'}
                      </button>
                    </>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        グループの削除は作成者のみが行えます
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 閉じるボタン */}
            <button
              onClick={() => {
                setShowGroupInfo(false);
                setNewGroupName('');
                setGroupNameChangeError('');
              }}
              className="w-full bg-gray-500 text-white rounded-lg py-2 hover:bg-gray-600 transition-colors groupclose"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-gray-700 shadow hover:bg-gray-100"
              onClick={() => setExpandedImage(null)}
            >
              x
            </button>
            <img
              src={expandedImage}
              alt="拡大画像"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">読み込み失敗</text></svg>';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MessagingApp />);
