import { Editor, useEditorState } from "@tiptap/react";
import { useTheme } from "@mui/material";

type Props = { editor: Editor | null };

export function EmailToolbar({ editor }: Props) {
  const theme = useTheme();

  if (!editor) return null;

  const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive
      ? theme.palette.primary.main
      : theme.palette.background.paper,
    color: isActive
      ? theme.palette.primary.contrastText
      : theme.palette.text.secondary,
    fontWeight: isActive ? "bold" : 500,
    cursor: "pointer",
    padding: "4px 8px",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    transition: "all 0.2s ease",
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
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 8,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
      }}
    >
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
