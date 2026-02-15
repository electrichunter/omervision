"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

// Server-side rendering hatasını önlemek için dynamic import
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    readOnly?: boolean;
}

export default function Editor({ value, onChange, className, readOnly = false }: EditorProps) {

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image", "code-block"],
            ["clean"],
        ],
    }), []);

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "link",
        "image",
        "code-block",
    ];

    return (
        <div className={cn("bg-white text-black rounded-lg overflow-hidden border border-slate-200 shadow-sm", className)}>
            <style jsx global>{`
        .ql-toolbar {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0 !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
        }
        .ql-container {
          border: none !important;
          min-height: 200px;
          font-size: 16px;
        }
        .ql-editor {
          min-height: 200px;
          padding: 1.5rem;
        }
      `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                readOnly={readOnly}
                className="h-full"
            />
        </div>
    );
}
