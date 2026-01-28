import { Editor } from "@tiptap/react";

type Props = { editor: Editor | null };

export function EmailToolbar({ editor }: Props) {
  if (!editor) return null;

  const buttonStyle: React.CSSProperties = {};

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    ...buttonStyle,
    background: isActive ? "rgba(48, 110, 232, 0.25)" : "rgb(18, 18, 18)",
    color: isActive ? "#fff" : "#ccc",
    fontWeight: isActive ? "bold" : "normal",
    cursor: "pointer",
    padding: "4px 8px",
    border: "1px solid rgb(221, 221, 221)",
    borderRadius: 8,
  });

  return (
    <div style={toolbarStyle}>
      <button
        style={getButtonStyle(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        style={getButtonStyle(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </button>
      <button
        style={getButtonStyle(editor.isActive("underline"))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        U
      </button>
      <button
        style={getButtonStyle(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        style={getButtonStyle(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
    </div>
  );
}

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  padding: 8,
  borderBottom: "1px solid #e0e0e0",
};
