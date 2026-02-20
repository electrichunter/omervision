"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
    Bold, Italic, Link as LinkIcon, Heading2, Quote, Code,
    Image as ImageIcon, Heading1, Sparkles, List, ListOrdered
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const isUpdating = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Placeholder.configure({
                placeholder: placeholder || "Hikayeni yazmaya başla...",
                emptyEditorClass: 'is-editor-empty',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-400 underline decoration-blue-400/30 hover:decoration-blue-400 transition-colors',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl border border-white/10 my-8 mx-auto max-w-full shadow-2xl',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            isUpdating.current = true;
            onChange(editor.getHTML());
            setTimeout(() => {
                isUpdating.current = false;
            }, 0);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-300 leading-relaxed',
            },
            handlePaste: (view, event, slice) => {
                return false;
            }
        },
    });

    useEffect(() => {
        if (editor && value && !isUpdating.current && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const res = await api.uploadFile(file);
            if (res && res.url) {
                editor?.chain().focus().setImage({ src: res.url }).run();
            }
        } catch (error) {
            console.error(error);
            alert("Resim yüklenirken bir hata oluştu.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt("Bağlantı adresi (URL):", previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return <div className="h-96 w-full animate-pulse bg-white/5 rounded-2xl" />;
    }

    const ToolbarButton = ({ onClick, isActive, title, children }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center
                ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg'
                    : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/5'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-8 tip-tap-editor relative">
            <style jsx global>{`
                .tip-tap-editor .ProseMirror p.is-editor-empty:first-child::before {
                    color: #4b5563;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                    font-style: italic;
                }
                
                .tip-tap-editor .ProseMirror blockquote {
                    border-left: 3px solid #3b82f6;
                    padding-left: 1rem;
                    color: #e2e8f0;
                    font-style: italic;
                    margin: 1.5rem 0;
                }

                .tip-tap-editor .ProseMirror a {
                    cursor: pointer;
                }

                .tip-tap-editor .ProseMirror pre {
                    background: #1e1e24;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    font-family: monospace;
                    margin: 1.5rem 0;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .tip-tap-editor .ProseMirror code {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.25rem;
                    font-size: 0.9em;
                }
                
                .tip-tap-editor .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }
                
                .tip-tap-editor .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }

                .tip-tap-editor .ProseMirror h1 {
                    font-size: 2.25rem;
                    font-weight: 800;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: white;
                    line-height: 1.2;
                }

                .tip-tap-editor .ProseMirror h2 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: white;
                }

                .tip-tap-editor .ProseMirror h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #f3f4f6;
                }
                
                .tip-tap-editor .ProseMirror p {
                    margin-bottom: 1.25rem;
                    font-size: 1.125rem;
                    line-height: 1.8;
                }
                
                .tip-tap-editor .ProseMirror p:last-child {
                    margin-bottom: 0;
                }
            `}</style>

            {/* Input for file upload */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
            />

            {/* Main Editor Area */}
            <div className="flex-1 min-w-0 bg-transparent rounded-2xl md:p-4 transition-colors focus-within:bg-white/[0.02] border border-transparent focus-within:border-white/5">
                <EditorContent editor={editor} />
            </div>

            {/* Bubble Menu for text selection */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    className="flex items-center gap-1 p-1 bg-[#111113] border border-white/10 shadow-2xl rounded-xl backdrop-blur-xl"
                >
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                        title="Kalın"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                        title="Eğik"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={setLink}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('link') ? 'bg-white/10 text-blue-400' : 'text-gray-400'}`}
                        title="Bağlantı Ekle"
                    >
                        <LinkIcon size={16} />
                    </button>
                </BubbleMenu>
            )}

            {/* Vertical Sticky Right Toolbar */}
            <div className="flex md:flex-col gap-2 md:w-14 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar py-2 md:py-4">
                <div className="md:sticky md:top-24 flex md:flex-col gap-2 bg-[#0d0d0e] border border-white/5 rounded-2xl p-2 shadow-2xl items-center w-max md:w-full">

                    {/* Elements for vertical structure */}
                    <div className="hidden md:flex flex-col items-center gap-2 mb-2 w-full">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Araçlar</span>
                        <div className="w-full h-px bg-white/5"></div>
                    </div>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Büyük Başlık Ekle"
                    >
                        <Heading1 size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Alt Başlık Ekle"
                    >
                        <Heading2 size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 md:w-6 md:h-px bg-white/5 my-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Kalın"
                    >
                        <Bold size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Eğik"
                    >
                        <Italic size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 md:w-6 md:h-px bg-white/5 my-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Madde İşaretli Liste"
                    >
                        <List size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numaralı Liste"
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Alıntı Blok"
                    >
                        <Quote size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 md:w-6 md:h-px bg-white/5 my-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        title="Kod Bloku"
                    >
                        <Code size={18} />
                    </ToolbarButton>

                    <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className={`p-2.5 rounded-xl transition-all flex items-center justify-center relative
                            ${isUploading ? 'bg-blue-600/10 text-blue-400 opacity-50 cursor-wait' : 'bg-transparent text-gray-400 hover:bg-blue-600/20 hover:text-blue-400 border border-transparent hover:border-blue-500/20'}`}
                        title="Bilgisayardan Resim Yükle"
                    >
                        <ImageIcon size={18} className={isUploading ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
}
