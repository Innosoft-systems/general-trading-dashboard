"use client";

import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const buttonClass =
  "rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700";

function wrapNode(documentRef: Document, node: Node, tagName: string) {
  const wrapper = documentRef.createElement(tagName);
  wrapper.appendChild(node);
  return wrapper;
}

function normalizeWordNode(documentRef: Document, node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return documentRef.createTextNode(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (["style", "script", "meta", "link", "xml:o", "o:p"].includes(tag)) {
    return null;
  }

  const children = Array.from(element.childNodes)
    .map((child) => normalizeWordNode(documentRef, child))
    .filter((child): child is Node => child !== null);

  const style = (element.getAttribute("style") ?? "").toLowerCase();
  const isBold =
    tag === "strong" ||
    tag === "b" ||
    /font-weight\s*:\s*(bold|700|800|900)/.test(style);
  const isItalic =
    tag === "em" || tag === "i" || /font-style\s*:\s*italic/.test(style);
  const isUnderline =
    tag === "u" || /text-decoration[^;]*underline/.test(style);

  let baseNode: Node;

  if (tag === "br") {
    baseNode = documentRef.createElement("br");
  } else if (
    [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
    ].includes(tag)
  ) {
    const nextElement = documentRef.createElement(tag);
    children.forEach((child) => nextElement.appendChild(child));
    baseNode = nextElement;
  } else if (tag === "a") {
    const anchor = documentRef.createElement("a");
    const href = element.getAttribute("href");
    if (href) {
      anchor.setAttribute("href", href);
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
    children.forEach((child) => anchor.appendChild(child));
    baseNode = anchor;
  } else if (tag === "div") {
    const paragraph = documentRef.createElement("p");
    children.forEach((child) => paragraph.appendChild(child));
    baseNode = paragraph;
  } else {
    const fragment = documentRef.createDocumentFragment();
    children.forEach((child) => fragment.appendChild(child));
    baseNode = fragment;
  }

  if (
    isBold &&
    !(
      baseNode instanceof HTMLElement &&
      baseNode.tagName.toLowerCase() === "strong"
    )
  ) {
    baseNode = wrapNode(documentRef, baseNode, "strong");
  }

  if (
    isItalic &&
    !(
      baseNode instanceof HTMLElement && baseNode.tagName.toLowerCase() === "em"
    )
  ) {
    baseNode = wrapNode(documentRef, baseNode, "em");
  }

  if (
    isUnderline &&
    !(baseNode instanceof HTMLElement && baseNode.tagName.toLowerCase() === "u")
  ) {
    baseNode = wrapNode(documentRef, baseNode, "u");
  }

  return baseNode;
}

function normalizePastedHtml(html: string) {
  if (typeof window === "undefined" || !html) {
    return html;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const container = parsed.createElement("div");

  Array.from(parsed.body.childNodes).forEach((node) => {
    const normalized = normalizeWordNode(parsed, node);
    if (normalized) {
      container.appendChild(normalized);
    }
  });

  return container.innerHTML || html;
}

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
      transformPastedHTML: (html: string) => normalizePastedHtml(html),
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
