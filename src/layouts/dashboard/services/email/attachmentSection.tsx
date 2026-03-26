import { useTheme } from "@mui/material";
import "./attachmentSection.css";
import COLORS from "src/utility/colors";

function AttachmentSection({
  attachments,
  onAdd,
  onRemove,
  style,
  hideBtn,
}: any) {
  const theme = useTheme();
  const getFileIcon = (type: string) => {
    if (type?.startsWith("image/")) return "🖼️";
    if (type?.includes("pdf")) return "📕";
    if (type?.includes("zip") || type?.includes("rar")) return "🗜️";
    if (type?.includes("word")) return "📘";
    if (type?.includes("excel") || type?.includes("sheet")) return "📗";
    if (type?.includes("text")) return "📄";
    if (type?.includes("video")) return "🎬";
    if (type?.includes("audio")) return "🎵";
    return "📎";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="attach-wrapper" style={style}>
      {hideBtn ? null : (
        <label
          className="attach-btn"
          style={{
            backgroundColor: (theme || theme?.vars)?.palette.primary.dark,
            color: COLORS.WHITE,
          }}
        >
          📎 Attach Files
          <input type="file" multiple onChange={onAdd} hidden />
        </label>
      )}

      <div className="attach-preview">
        {Array.isArray(attachments) &&
          attachments?.length > 0 &&
          attachments.map((a: any) => (
            <div key={a.id} className="attach-item">
              {a.previewUrl ? (
                <img src={a.previewUrl} alt={a.name} className="attach-img" />
              ) : (
                <div className="file-icon">{getFileIcon(a.type)}</div>
              )}

              <div className="file-info">
                <div className="file-name">{a.name}</div>
                <div className="file-size">{formatSize(a.size)}</div>
              </div>

              <button
                className="remove-btn"
                onClick={() => onRemove(a.id)}
                style={{ display: hideBtn ? "none" : "block" }}
              >
                ✕
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default AttachmentSection;
