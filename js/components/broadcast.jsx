// ★ 管理者用の一斉送信パネル
const BroadcastPanel = ({ user, onSend }) => {
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      alert("メッセージを入力してください");
      return;
    }

    if (
      !confirm(
        "全ユーザーにこのメッセージを送信しますか？\n\n送信内容:\n" +
          broadcastMessage,
      )
    ) {
      return;
    }

    setSending(true);
    try {
      await onSend(broadcastMessage);
      setBroadcastMessage("");
      alert("✅ 一斉送信が完了しました！");
    } catch (error) {
      console.error("一斉送信エラー:", error);
      alert("❌ 送信に失敗しました: " + error.message);
    }
    setSending(false);
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📢</span>
        <h3 className="font-bold text-lg text-yellow-800">
          一斉送信（管理者専用）
        </h3>
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
          {sending ? "送信中..." : "📤 全ユーザーに送信"}
        </button>
        <button
          onClick={() => setBroadcastMessage("")}
          className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          クリア
        </button>
      </div>
    </div>
  );
};