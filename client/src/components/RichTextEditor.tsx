import React, { useState, useMemo } from "react";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";

interface RichTextEditorProps {
  initialHtml?: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialHtml, onChange }) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const onEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const contentState = newEditorState.getCurrentContent();
    const html = draftToHtml(convertToRaw(contentState));
    onChange(html);
  };

  return (
    <div className="border border-border rounded-lg p-2 bg-card text-card-foreground min-h-[200px]">
      <Editor
        editorState={editorState}
        wrapperClassName="demo-wrapper"
        editorClassName="demo-editor"
        onEditorStateChange={onEditorStateChange}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'history'],
          inline: { inDropdown: false, options: ['bold', 'italic', 'underline'] },
          list: { inDropdown: false, options: ['unordered', 'ordered'] },
          textAlign: { inDropdown: false, options: ['left', 'center', 'right', 'justify'] },
        }}
        localization={{
          locale: 'ar',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
