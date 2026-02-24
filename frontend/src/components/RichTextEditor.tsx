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
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] text-[var(--color-text-primary)] leading-relaxed selection:bg-[var(--color-accent-blue)]/30',
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
        return <div className="h-96 w-full animate-pulse bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-border)]" />;
    }

    const ToolbarButton = ({ onClick, isActive, title, children }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center font-bold
                ${isActive
                    ? 'bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/30 shadow-premium'
                    : 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] border border-transparent hover:border-[var(--color-border)]'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-8 tip-tap-editor relative">
            <style jsx global>{`
                .tip-tap-editor .ProseMirror p.is-editor-empty:first-child::before {
                    color: var(--color-text-muted);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                    font-style: italic;
                    opacity: 0.4;
                }
                
                .tip-tap-editor .ProseMirror blockquote {
                    border-left: 4px solid var(--color-accent-blue);
                    padding-left: 1.5rem;
                    color: var(--color-text-secondary);
                    font-style: italic;
                    margin: 2rem 0;
                    background: var(--color-bg-tertiary);
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    border-radius: 0 1rem 1rem 0;
                }

                .tip-tap-editor .ProseMirror a {
                    cursor: pointer;
                }

                .tip-tap-editor .ProseMirror pre {
                    background: var(--color-bg-tertiary);
                    color: var(--color-text-primary);
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    overflow-x: auto;
                    font-family: 'JetBrains Mono', monospace;
                    margin: 2rem 0;
                    border: 1px solid var(--color-border);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
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
                    font-size: 3rem;
                    font-weight: 900;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    color: var(--color-text-primary);
                    line-height: 1.1;
                    letter-spacing: -0.05em;
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
            <div className="flex-1 min-w-0 bg-transparent rounded-3xl md:p-6 transition-all focus-within:bg-[var(--color-bg-secondary)] border-2 border-transparent focus-within:border-[var(--color-border)] shadow-premium relative">
                <div className="absolute inset-0 bg-noise opacity-[0.01] pointer-events-none" />
                <EditorContent editor={editor} />
            </div>

            {/* Bubble Menu for text selection */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    className="flex items-center gap-1.5 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-premium rounded-2xl backdrop-blur-3xl"
                >
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2.5 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/20' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'}`}
                        title="Kalın"
                    >
                        <Bold size={16} strokeWidth={3} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2.5 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/20' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'}`}
                        title="Eğik"
                    >
                        <Italic size={16} strokeWidth={3} />
                    </button>
                    <button
                        type="button"
                        onClick={setLink}
                        className={`p-2.5 rounded-xl transition-all ${editor.isActive('link') ? 'bg-[var(--color-accent-blue)] text-white shadow-lg' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'}`}
                        title="Bağlantı Ekle"
                    >
                        <LinkIcon size={16} strokeWidth={3} />
                    </button>
                </BubbleMenu>
            )}

            {/* Vertical Sticky Right Toolbar */}
            <div className="flex md:flex-col gap-2 md:w-16 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar py-2 md:py-4">
                <div className="md:sticky md:top-24 flex md:flex-col gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-3 shadow-premium items-center w-max md:w-full">

                    {/* Elements for vertical structure */}
                    <div className="hidden md:flex flex-col items-center gap-2 mb-2 w-full">
                        <span className="text-[9px] uppercase font-black text-[var(--color-text-muted)] tracking-[0.2em] opacity-50">Araçlar</span>
                        <div className="w-full h-px bg-[var(--color-border)] opacity-30"></div>
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
                            ${isUploading ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] opacity-50 cursor-wait' : 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-accent-blue)]/20 hover:text-[var(--color-accent-blue)] border border-transparent hover:border-[var(--color-accent-blue)]/30'}`}
                        title="Bilgisayardan Resim Yükle"
                    >
                        <ImageIcon size={18} className={isUploading ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
}
