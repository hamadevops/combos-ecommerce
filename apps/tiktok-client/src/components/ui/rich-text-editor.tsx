import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Autoformat,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  BlockQuote,
  Heading,
  Link,
  List,
  TodoList,
  Image as CKImage,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageInsert,
  ImageResize,
  // Base64UploadAdapter, // REMOVED: Using custom API upload adapter
  Indent,
  IndentBlock,
  MediaEmbed,
  Table as CKTable,
  TableColumnResize,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Alignment,
  Font,
  Highlight,
  HorizontalLine,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Essentials,
  Undo,
  SourceEditing,
  GeneralHtmlSupport,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import { CustomUploadAdapterPlugin } from "@/lib/custom-upload-adapter";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string | number;
  maxHeight?: string | number;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  minHeight = "400px",
  maxHeight,
}: RichTextEditorProps) => {
  return (
    <div
      className="rich-text-editor-container text-black"
      style={
        {
          "--ck-min-height": typeof minHeight === "number" ? `${minHeight}px` : minHeight,
          "--ck-max-height":
            typeof maxHeight === "number" ? `${maxHeight}px` : (maxHeight ?? "none"),
        } as React.CSSProperties
      }
    >
      <style>{`
                .rich-text-editor-container .ck-editor__editable_inline {
                    min-height: var(--ck-min-height) !important;
                    max-height: var(--ck-max-height) !important;
                    overflow-y: auto !important;
                }
                .rich-text-editor-container .ck-source-editing-area textarea {
                    min-height: var(--ck-min-height) !important;
                    max-height: var(--ck-max-height) !important;
                    overflow-y: auto !important;
                }
                .rich-text-editor-container .ck-content {
                    max-width: none !important;
                }
            `}</style>
      <CKEditor
        editor={ClassicEditor as any}
        data={value}
        config={{
          placeholder: placeholder,
          extraPlugins: [CustomUploadAdapterPlugin] as any, // Adding the custom upload adapter
          toolbar: {
            items: [
              "sourceEditing",
              "|",
              "heading",
              "|",
              "fontFamily",
              "fontSize",
              "fontColor",
              "fontBackgroundColor",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "code",
              "subscript",
              "superscript",
              "removeFormat",
              "|",
              "bulletedList",
              "numberedList",
              "todoList",
              "|",
              "outdent",
              "indent",
              "alignment",
              "|",
              "link",
              "insertImage",
              "mediaEmbed",
              "insertTable",
              "highlight",
              "blockQuote",
              "horizontalLine",
              "specialCharacters",
              "|",
              "undo",
              "redo",
            ],
            shouldNotGroupWhenFull: false,
          },
          plugins: [
            Essentials,
            Autoformat,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Code,
            Subscript,
            Superscript,
            BlockQuote,
            Heading,
            Link,
            List,
            TodoList,
            CKImage,
            ImageCaption,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            ImageInsert, // Allows inserting via URL and Upload
            ImageResize,
            // Base64UploadAdapter, // REMOVED
            Indent,
            IndentBlock,
            MediaEmbed,
            CKTable,
            TableColumnResize,
            TableToolbar,
            TableProperties,
            TableCellProperties,
            Alignment,
            Font,
            Highlight,
            HorizontalLine,
            RemoveFormat,
            SpecialCharacters,
            SpecialCharactersEssentials,
            Undo,
            SourceEditing,
            GeneralHtmlSupport,
          ] as any,
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
          },
          image: {
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "|",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "|",
              "resizeImage",
            ],
            insert: {
              type: "auto",
            },
          },
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableProperties",
              "tableCellProperties",
            ],
          },
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          licenseKey: "GPL",
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default RichTextEditor;
