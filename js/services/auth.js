// Chatly 認証サービス

const firebaseAuth = window.chatlyFirebase.auth;
const firebaseDb = window.chatlyFirebase.database;

const chatlyAuth = {
  // メールアドレス・パスワードでログイン
  async login({
    email,
    password,
    rememberMe,
    recaptchaSiteKey,
  }) {
    if (!email || !password) {
      throw new Error("メールアドレスとパスワードを入力してください");
    }

    // reCAPTCHA v3
    const recaptchaToken = await window.grecaptcha.execute(
      recaptchaSiteKey,
      { action: "login" },
    );

    if (!recaptchaToken) {
      throw new Error("reCAPTCHA検証に失敗しました");
    }

    // ログイン状態
    if (rememberMe) {
      await firebaseAuth.setPersistence(
        firebase.auth.Auth.Persistence.LOCAL,
      );
    } else {
      await firebaseAuth.setPersistence(
        firebase.auth.Auth.Persistence.SESSION,
      );
    }

    return await firebaseAuth.signInWithEmailAndPassword(
      email,
      password,
    );
  },

  // 新規アカウント作成
  async signUp({
    email,
    password,
    username,
    recaptchaSiteKey,
    sendOfficialMessages,
  }) {
    if (!email || !password || !username) {
      throw new Error("すべてのフィールドを入力してください");
    }

    // reCAPTCHA v3
    const recaptchaToken = await window.grecaptcha.execute(
      recaptchaSiteKey,
      { action: "signup" },
    );

    if (!recaptchaToken) {
      throw new Error("reCAPTCHA検証に失敗しました");
    }

    // 新規登録時はSESSION
    await firebaseAuth.setPersistence(
      firebase.auth.Auth.Persistence.SESSION,
    );

    const userCredential =
      await firebaseAuth.createUserWithEmailAndPassword(
        email,
        password,
      );

    const user = userCredential.user;

    // users/{uid}
    await firebaseDb.ref(`users/${user.uid}`).set({
      username: username,
      email: email,
      photoURL: "",
      createdAt: Date.now(),
    });

    // usernames/{username}
    await firebaseDb.ref(`usernames/${username}`).set({
      uid: user.uid,
      username: username,
    });

    // 公式メッセージ
    if (sendOfficialMessages) {
      await sendOfficialMessages(user.uid);
    }

    return user;
  },

  // Googleログイン
  async googleLogin({
    onNewUser,
    sendOfficialMessages,
  }) {
    const provider = new firebase.auth.GoogleAuthProvider();

    provider.addScope("profile");
    provider.addScope("email");

    const result = await firebaseAuth.signInWithPopup(provider);
    const user = result.user;

    const userRef = firebaseDb.ref(`users/${user.uid}`);
    const snapshot = await userRef.once("value");

    // 初回Googleログイン
    if (!snapshot.exists()) {
      const displayName =
        user.displayName ||
        user.email.split("@")[0];

      await userRef.set({
        username: displayName,
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: Date.now(),
        provider: "google",
      });

      await database
        .ref(`usernames/${displayName}`)
        .set({
          uid: user.uid,
          username: displayName,
        });

      if (sendOfficialMessages) {
        await sendOfficialMessages(user.uid);
      }

      if (onNewUser) {
        onNewUser({
          username: displayName,
          photoURL: user.photoURL || "",
        });
      }
    }

    return user;
  },

  // ログアウト
  async logout() {
    await firebaseAuth.signOut();
  },

  // Firebase Authの状態監視
  onAuthStateChanged(callback) {
    return firebaseAuth.onAuthStateChanged(callback);
  },
};

window.chatlyAuth = chatlyAuth;