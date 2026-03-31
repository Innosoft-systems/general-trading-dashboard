"use client";

import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const buttonClass =
  "rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-b-2xl border border-t-0 border-slate-300 bg-white px-4 py-3 outline-none prose prose-slate max-w-none",
      },
    },
    onUpdate: ({ editor: current }: { editor: { getHTML: () => string } }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-2xl">
      <div className="flex flex-wrap gap-2 rounded-t-2xl border border-slate-300 bg-slate-50 p-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass}
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={buttonClass}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass}
        >
          Ordered List
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter URL", "https://");
            if (!url) return;
            editor
              .chain()
              .focus()
              .setLink({
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
              })
              .run();
          }}
          className={buttonClass}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={buttonClass}
        >
          Unlink
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
