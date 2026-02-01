/**
 * TipTap 编辑器封装
 *
 * 基于 TipTap 的富文本编辑器组件
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "开始写作...",
  className,
  editable = true,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px]",
          "prose-headings:font-bold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-em:text-foreground",
          "prose-ul:text-foreground prose-ol:text-foreground",
          "prose-li:text-foreground",
          "prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary",
          "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded",
          "prose-pre:bg-muted prose-pre:text-foreground",
        ),
      },
    },
  });

  // 当外部 content 变化时更新编辑器
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // 当 editable 变化时更新
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div
      className={cn(
        "border rounded-lg bg-background",
        "[&_.is-editor-empty:first-child::before]:text-muted-foreground",
        "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        "[&_.is-editor-empty:first-child::before]:float-left",
        "[&_.is-editor-empty:first-child::before]:h-0",
        "[&_.is-editor-empty:first-child::before]:pointer-events-none",
        className,
      )}
    >
      <EditorContent editor={editor} className="p-4" />
    </div>
  );
}

// 导出 editor 实例类型
export type { Editor } from "@tiptap/react";
