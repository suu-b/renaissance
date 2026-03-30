import React from "react";
import 'quill/dist/quill.snow.css'
import ReactQuill from 'react-quill'

function RequestEditor({ setMessage }) {
    var modules = {
        toolbar: [
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
                { align: [] }
            ],
        ]
    };
    var formats = [
        "header", "height", "bold", "italic",
        "underline", "strike", "blockquote",
        "list", "color", "bullet", "indent",
        "link", "image", "align", "size",
    ];
    const handleProcedureContentChange = (content) => {
        setMessage(content)
    };
    return (
        <>
            <div className="mb-5">
                <div>
                    <ReactQuill
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        placeholder="Send a message from here"
                        onChange={handleProcedureContentChange}
                    >
                    </ReactQuill>
                </div>
            </div>
        </>
    )
}

export default RequestEditor
