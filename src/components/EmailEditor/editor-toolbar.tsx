import { useTheme } from "@mui/material";
import { Editor, useEditorState } from "@tiptap/react";
import COLORS from "src/utility/colors";

type Props = { editor: Editor | null };

export function EmailToolbar({ editor }: Props) {
  const theme = useTheme();
  if (!editor) return null;

  const buttonStyle: React.CSSProperties = {};

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    ...buttonStyle,
    backgroundColor: isActive
      ? (theme || theme?.vars)?.palette.primary.dark
      : theme?.vars?.palette.background.paper,
    color: isActive ? COLORS.WHITE : theme.vars?.palette.text.secondary,
    fontWeight: isActive ? "bold" : "normal",
    cursor: "pointer",
    padding: "4px 8px",
    border: "1px solid rgb(221, 221, 221)",
    borderRadius: 8,
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isBullet: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
    }),
  });

  return (
    <div style={toolbarStyle}>
      <button
        style={getButtonStyle(editorState.isBold)}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        style={getButtonStyle(editorState.isItalic)}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </button>
      <button
        style={getButtonStyle(editorState.isUnderline)}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        U
      </button>
      <button
        style={getButtonStyle(editorState.isBullet)}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        style={getButtonStyle(editorState.isOrderedList)}
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
