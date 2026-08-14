// 改良版 AvatarImage コンポーネント
const AvatarImage = ({
  src,
  alt,
  fallbackText,
  size = "w-10 h-10",
  bgColor = "bg-blue-500",
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(null);

  React.useEffect(() => {
    if (!src || !src.startsWith("http")) {
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
        console.error("画像プリロードエラー:", err);
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
        <div
          className={`${size} rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm`}
        >
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
          image: null,
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
          <p className="text-xs text-blue-500 truncate mt-1">{url}</p>
        </div>
      </a>
    </div>
  );
};