// FileInput.tsx
import React, { useRef } from 'react';
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

interface Props {
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const FileInput: React.FC<Props> = ({ onChange }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <>
            <AttachFileOutlinedIcon
                className="upload-icon"
                onClick={handleClick}
                style={{ cursor: 'pointer' }}
            />
            <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.heic,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv"
                multiple
                style={{ display: "none" }}
                ref={inputRef}
                onChange={onChange}
            />
        </>
    );
};

export default FileInput;
