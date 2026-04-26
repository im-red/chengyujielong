import { useRef, KeyboardEvent, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { GameMode } from '../types';

interface IdiomInputProps {
    input: string;
    isSubmitting: boolean;
    mode: GameMode;
    onInputChange: (value: string) => void;
    onSubmit: () => void;
    onGiveUp?: () => void;
    showGiveUp?: boolean;
}

function IdiomInput({
    input,
    isSubmitting,
    mode,
    onInputChange,
    onSubmit,
    onGiveUp,
    showGiveUp = false
}: IdiomInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!isSubmitting) {
            onInputChange(e.target.value);
        }
    };

    const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onInputChange('');
    };

    const handleSubmitClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onSubmit();
    };

    const handleTouchEnd = (e: TouchEvent<HTMLButtonElement>, action: () => void) => {
        e.preventDefault();
        action();
    };

    return (
        <div className="input-section">
            <div className="input-group">
                <div className="input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        id="idiom-input"
                        placeholder="请输入成语接龙..."
                        autoComplete="off"
                        value={input}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            if (isSubmitting) {
                                e.preventDefault();
                                return;
                            }
                            handleKeyDown(e);
                        }}
                    />
                    {input && !isSubmitting && (
                        <button
                            className="input-clear-btn"
                            onClick={handleClear}
                            onMouseDown={(e) => e.preventDefault()}
                            type="button"
                            aria-label="清空输入"
                        >
                            ×
                        </button>
                    )}
                </div>
                <button
                    className="btn btn-primary"
                    id="submit-btn"
                    onClick={handleSubmitClick}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchEnd={(e) => handleTouchEnd(e, onSubmit)}
                    disabled={isSubmitting || !input.trim()}
                >
                    发送
                </button>
                {showGiveUp && onGiveUp && (
                    <button
                        className="btn btn-secondary"
                        id="giveup-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            onGiveUp();
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.preventDefault()}
                        onTouchEnd={(e) => handleTouchEnd(e, onGiveUp)}
                        disabled={isSubmitting}
                    >
                        放弃
                    </button>
                )}
            </div>
        </div>
    );
}

export default IdiomInput;
