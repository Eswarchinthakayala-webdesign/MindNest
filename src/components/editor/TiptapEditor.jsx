import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code,
  Heading1,
  Heading2,
  Highlighter
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const items = [
    {
      icon: <Bold className="w-4 h-4" />,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: <UnderlineIcon className="w-4 h-4" />,
      title: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: <Highlighter className="w-4 h-4" />,
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      type: 'divider',
    },
    {
      icon: <Heading1 className="w-4 h-4" />,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      type: 'divider',
    },
    {
      icon: <List className="w-4 h-4" />,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      title: 'Task List',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
    },
    {
      type: 'divider',
    },
    {
      icon: <Quote className="w-4 h-4" />,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 mb-4 bg-stone-900/50 border border-stone-800 rounded-xl backdrop-blur-sm sticky top-0 z-10">
      {items.map((item, index) => (
        item.type === 'divider' ? (
          <div key={index} className="w-px h-6 bg-stone-800 mx-1" />
        ) : (
          <button
            key={index}
            onClick={item.action}
            title={item.title}
            className={`p-2 rounded-lg transition-colors ${
              item.isActive() 
                ? 'bg-primary/20 text-primary' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {item.icon}
          </button>
        )
      ))}
    </div>
  );
};

const TiptapEditor = ({ content, onChange, editable = true }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your thoughts...',
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      Typography,
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange({
        json: editor.getJSON(),
        html: editor.getHTML(),
        text: editor.getText(),
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-stone max-w-none focus:outline-none min-h-[300px]',
      },
    },
  });

  return (
    <div className="w-full">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
