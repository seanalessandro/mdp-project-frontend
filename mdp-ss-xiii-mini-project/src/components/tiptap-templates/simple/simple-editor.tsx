"use client"

import * as React from "react"
import { Editor, EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'

// --- Ant Design & Icons ---
import { Dropdown, Tooltip, Space, Button as AntButton } from 'antd';
import type { MenuProps } from 'antd';
import {
  TableOutlined,
  InsertRowBelowOutlined,
  InsertRowAboveOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  DeleteColumnOutlined,
  DeleteRowOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"


interface SimpleEditorProps {
  content: string;
  onUpdate: (editor: Editor) => void;
  headerContent?: React.ReactNode;
}

const MainToolbarContent = ({
  editor,
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  editor: Editor | null;
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  if (!editor) {
    return null;
  }

  const tableMenuItems: MenuProps['items'] = [
    {
      key: 'rows', label: 'Row Actions', type: 'group',
      children: [
        { key: 'addRowBefore', icon: <InsertRowAboveOutlined />, label: 'Add Row Before', onClick: () => editor.chain().focus().addRowBefore().run(), disabled: !editor.can().addRowBefore() },
        { key: 'addRowAfter', icon: <InsertRowBelowOutlined />, label: 'Add Row After', onClick: () => editor.chain().focus().addRowAfter().run(), disabled: !editor.can().addRowAfter() },
        { key: 'deleteRow', icon: <DeleteRowOutlined />, label: 'Delete Row', onClick: () => editor.chain().focus().deleteRow().run(), disabled: !editor.can().deleteRow() },
      ],
    },
    {
      key: 'cols', label: 'Column Actions', type: 'group',
      children: [
        { key: 'addColBefore', icon: <InsertRowLeftOutlined />, label: 'Add Column Before', onClick: () => editor.chain().focus().addColumnBefore().run(), disabled: !editor.can().addColumnBefore() },
        { key: 'addColAfter', icon: <InsertRowRightOutlined />, label: 'Add Column After', onClick: () => editor.chain().focus().addColumnAfter().run(), disabled: !editor.can().addColumnAfter() },
        { key: 'deleteCol', icon: <DeleteColumnOutlined />, label: 'Delete Column', onClick: () => editor.chain().focus().deleteColumn().run(), disabled: !editor.can().deleteColumn() },
      ],
    },
    { type: 'divider' },
    {
      key: 'deleteTable',
      icon: <DeleteOutlined />,
      label: 'Delete Table',
      onClick: () => editor.chain().focus().deleteTable().run(),
      danger: true,
      disabled: !editor.can().deleteTable(),
    },
  ];

  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (<ColorHighlightPopover />) : (<ColorHighlightPopoverButton onClick={onHighlighterClick} />)}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Space className="editor-toolbar-space">
          <Tooltip title="Insert Table">
            <AntButton
              icon={<TableOutlined />}
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            />
          </Tooltip>
          {editor.isActive('table') && (
            <Dropdown menu={{ items: tableMenuItems }} trigger={['click']}>
              <AntButton>
                <Space>
                  Table Actions
                </Space>
              </AntButton>
            </Dropdown>
          )}
        </Space>
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({ type, onBack }: { type: "highlighter" | "link"; onBack: () => void }) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (<HighlighterIcon className="tiptap-button-icon" />) : (<LinkIcon className="tiptap-button-icon" />)}
      </Button>
    </ToolbarGroup>
    <ToolbarSeparator />
    {type === "highlighter" ? (<ColorHighlightPopoverContent />) : (<LinkContent />)}
  </>
)

export function SimpleEditor({ content, onUpdate, headerContent }: SimpleEditorProps) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({ horizontalRule: false, link: { openOnClick: false, enableClickSelection: true }, }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
    content: '',
  })

  React.useEffect(() => {
    if (!editor || !content) {
      return;
    }
    const currentContentJSON = JSON.stringify(editor.getJSON());
    if (currentContentJSON !== content) {
      try {
        const parsedContent = JSON.parse(content);
        editor.commands.setContent(parsedContent, { emitUpdate: false });
      } catch (e) {
        console.error("Gagal mem-parsing konten JSON:", e);
        editor.commands.setContent("<p>Gagal memuat konten.</p>", { emitUpdate: false });
      }
    }
  }, [content, editor]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      {headerContent}
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{ ...(isMobile ? { bottom: `calc(100% - ${height - rect.y}px)` } : {}), }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              editor={editor}
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}