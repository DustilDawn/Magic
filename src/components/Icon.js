const Icon = ({ name, onClick }) => {
    return (
        <>
            {
                name === 'edit' ?
                    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
                        <path d="M0 0h24v24H0z" fill="none" />

                        <path d="M3 17.25V21h3.75l9.81-9.81-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    : ''
            }

            {
                name === 'wallet' ?
                    <svg onClick={onClick} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="WalletIcon" tabIndex="-1" title="Wallet"><path d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1.86 9.77c-.24.2-.57.28-.88.2L4.15 11.25C4.45 10.52 5.16 10 6 10h12c.67 0 1.26.34 1.63.84l-3.49 2.93zM6 6h12c1.1 0 2 .9 2 2v.55c-.59-.34-1.27-.55-2-.55H6c-.73 0-1.41.21-2 .55V8c0-1.1.9-2 2-2z"></path></svg>
                    : ''

            }

            {
                name === 'key' ?
                    <svg onClick={onClick} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="KeyIcon" tabIndex="-1" title="Key"><path d="M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13l2 2 2-2 2 2 4-4.04L21 10zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path></svg>
                    : ''
            }

            {
                name === 'app' ?
                    <svg onClick={onClick} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AppsIcon" tabIndex="-1" title="Apps"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"></path></svg>
                    : ''
            }

            {
                name === 'add' ?
                    <svg onClick={onClick} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AddIcon" tabIndex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
                    : ''
            }

            {
                name === 'tap' ?
                    <svg onClick={onClick} className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="TouchAppIcon" tabIndex="-1" title="TouchApp"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74c-3.6-.76-3.54-.75-3.67-.75-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"></path></svg>
                    : ''
            }

            {
                name === 'lit' ?
                    <svg onClick={onClick}  width="125" height="146" viewBox="0 0 125 146" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.7613 42.7561C17.7613 42.7561 17.5134 47.4605 8.39669 62.8062C-2.16247 80.5884 -3.15416 101.404 7.63039 118.781C30.3658 155.414 92.0699 154.722 114.946 118.803C123.792 104.91 126.328 88.9674 123.308 72.7721C123.308 72.7721 115.989 38.9577 90.9937 17.6359C91.3881 17.9679 92.3573 22.4923 92.5432 24.4224C93.1123 30.3536 92.5545 36.5717 90.5655 42.2159C89.1061 46.3632 87.0833 49.9534 83.6632 52.7221C83.6632 51.7542 83.4209 50.021 83.4152 49.4413C83.2518 37.6297 78.6766 26.6902 71.222 17.5065C64.7085 9.49323 55.7777 4.02351 46.3736 0C46.6103 0.810329 47.0498 4.16982 47.1118 4.83384C47.5963 10.4105 47.6865 18.2212 46.954 23.7922C46.2215 29.3632 44.965 32.3963 43.2577 37.6184C40.6715 45.536 37.1499 51.4053 32.6873 58.445C31.8646 59.7393 29.408 63.2901 28.0951 65.0852C28.0951 65.0852 25.8357 50.8144 17.767 42.7561H17.7613Z" fill="currentColor"></path></svg>
                    : ''
            }
        </>
    )
}
export default Icon;