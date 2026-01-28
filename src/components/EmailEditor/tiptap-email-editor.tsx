import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { EmailToolbar } from "./editor-toolbar";

import "./index.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export function EmailEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div style={editorContainer}>
      <EmailToolbar editor={editor} />
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

const editorContainer: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  background: 'hsla(220, 35%, 3%, 0.4)'
};