import { useTheme } from "@mui/material";
import "./attachmentSection.css";
import COLORS from "src/utility/colors";

function AttachmentSection({
  attachments,
  onAdd,
  onRemove,
  style,
  hideBtn,
  maxAttachments,
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
    if (typeof bytes !== "number" || isNaN(bytes)) return null;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isMaxReached = attachments?.length >= maxAttachments;

  return (
    <div className="attach-wrapper" style={style}>
      {hideBtn ? null : (
        <label
          className="attach-btn"
          style={{
            backgroundColor: (theme || theme?.vars)?.palette.primary.dark,
            color: COLORS.WHITE,
            opacity: isMaxReached ? 0.5 : 1,
            cursor: isMaxReached ? "not-allowed" : "pointer",
            pointerEvents: isMaxReached ? "none" : "auto",
          }}
          title={
            isMaxReached ? `Maximum ${maxAttachments} attachments allowed` : ""
          }
        >
          📎 Attach Files{" "}
          {maxAttachments && maxAttachments > 0 && (
            <>
              {attachments?.length > 0 &&
                `(${attachments.length}/${maxAttachments})`}
            </>
          )}
          <input
            type="file"
            multiple
            onChange={onAdd}
            hidden
            disabled={isMaxReached}
          />
        </label>
      )}

      <div className="attach-preview">
        {Array.isArray(attachments) &&
          attachments?.length > 0 &&
          attachments.map((a: any) => (
            <div
              key={a?.id}
              className="attach-item"
              onClick={() => {
                if (a?.previewUrl) {
                  window.open(a.previewUrl, "_blank");
                }
              }}
              style={{ cursor: a.previewUrl ? "pointer" : "default" }}
            >
              <div className="attach-left">
                {a.previewUrl ? (
                  <img src={a.previewUrl} alt={a.name} className="attach-img" />
                ) : (
                  <div className="file-icon">{getFileIcon(a.type)}</div>
                )}
              </div>

              <div className="attach-right">
                <div className="file-size">{formatSize(a.size) || "-"}</div>
              </div>

              <div className="attach-bottom">
                <div className="file-name" title={a.name}>{a.name}</div>
              </div>

              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(a.id);
                }}
                style={{ display: hideBtn ? "none" : "block" }}
                type="button"
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
