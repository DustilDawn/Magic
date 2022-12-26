import { useEffect, useState } from "react";
import Icon from "./components/Icon";
import { Loading } from "./components/Loading";

function Dialog({
    id,
    activePage,
    onCancelTop,
    pageTitle = 'PAGE TITLE',
    onCancel,
    onSubmit,
    submitText = 'Submit',
    children,
    alertMessage,
    input,
    signal,
}) {

    const [error, setError] = useState()
    const [success, setSuccess] = useState()
    const [loading, setLoading] = useState()
    const [loadingMessage, setLoadingMessage] = useState('Loading...');

    const [inputValue, setInputValue] = useState('');
    const [enterPressed, setEnterPressed] = useState(false);
    const [postContent, setPostContent] = useState(null);

    useEffect(() => {
        console.log("signal =>", signal);
        clearStates();
    }, [signal]);

    function clearStates() {
        setSuccess(null);
        setError(null);
        setLoading(null);
        setLoadingMessage(null);
        setPostContent(null);
        setInputValue('');
    }

    function submit() {
        clearStates();
        onSubmit(
            { inputValue },
            setError,
            setSuccess,
            setLoading,
            setLoadingMessage,
            setPostContent,
        )
    }

    var timeout;
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            submit();
            setEnterPressed(true);

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setEnterPressed(false);
                clearTimeout(timeout);
            }, 1000);
        };
    }

    return (
        <div>

            <div
                dangerouslySetInnerHTML={
                    {
                        __html: `
                    <style>
                    .${id} {
                      opacity: 1;
                      pointer-events: fill;
                    }
                    </style>`,
                    }
                }
            />

            <div className={`page page-input ${activePage === id ? id : ''}`}>
                <div className="page-input-inner">
                    {
                        !onCancelTop ? '' : <div className="text text-red cursor" onClick={onCancelTop}>Cancel</div>
                    }


                    <div className="page-center">
                        <div className="separator-sm"></div>
                        <div className="">
                            <h6 className="center"><span>{pageTitle}</span></h6>
                        </div>
                        <div className="separator-sm"></div>

                        <div className="input-group">
                            {
                                !input ? '' :
                                    <input onKeyDown={handleKeyDown} type="text" placeholder={input?.placeholder ?? '0x...'} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                            }

                            {
                                !alertMessage ? '' :
                                    <p className="alert-box">
                                        <Icon name="alert"></Icon>
                                        {alertMessage}
                                    </p>
                            }

                            {children}

                            <div className="button-group">
                                {
                                    !onCancel ? '' :
                                        <div className="button-cancel" onClick={() => {
                                            clearStates();
                                            onCancel();
                                        }}>Cancel</div>
                                }
                                {
                                    !onSubmit ? '' :
                                        <div className={`${enterPressed ? 'entered' : ''} button-brand-2 ${loading ? '' : ''}`} onClick={() => submit()}>{submitText}</div>
                                }
                            </div>

                            {/* states */}
                            {
                                loading ? <div className="loading-with-text">
                                    <div className="separator-sm"></div>
                                    <Loading />
                                    <span>{loadingMessage} </span>
                                    <div className="separator-sm"></div>
                                </div> : ''
                            }

                            {
                                error ? <div className="text text-red center">
                                    <div className="separator-sm"></div>
                                    {error}
                                    <div className="separator-sm"></div>
                                </div> : ''
                            }

                            {
                                success ? <div className="text text-green center">
                                    <div className="separator-sm"></div>
                                    {success}
                                    <div className="separator-sm"></div>
                                </div> : ''
                            }

                            {
                                postContent ? postContent : ''
                            }



                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dialog;