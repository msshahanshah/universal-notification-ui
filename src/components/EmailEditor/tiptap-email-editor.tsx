import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import { useEffect } from "react";
import { Plugin } from "prosemirror-state";

import { EmailToolbar } from "./editor-toolbar";
import "./index.css";

type Props = {
  value: string; // sanitized HTML
  onChange: (html: string) => void;
};

export function EmailEditor({ value, onChange }: Props) {
  const BlockHtmlInput = Extension.create({
    name: "blockHtmlInput",

    addKeyboardShortcuts() {
      return {
        "<": () => true,
        ">": () => true,
      };
    },
  });
  const SafePasteExtension = Extension.create({
    name: "safePaste",

    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handlePaste(view, event) {
              const html = event.clipboardData?.getData("text/html");

              if (!html) return false;

              const cleanHtml = DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
                ALLOWED_ATTR: [],
              });

              const text = cleanHtml.replace(/<[^>]+>/g, "");

              view.dispatch(view.state.tr.insertText(text));

              return true; // stop default paste
            },
          },
        }),
      ];
    },
  });
  const editor = useEditor({
    extensions: [StarterKit, BlockHtmlInput, SafePasteExtension],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external changes safely
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div>
      <label style={{ marginBottom: 4, fontSize: "12px" }}>
        Body
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
      </label>
      <div style={editorContainer}>
        <EmailToolbar editor={editor} />
        <div className="editor-wrapper">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

const editorContainer: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "hsla(220, 35%, 3%, 0.4)",
  marginTop: 4
};