const Icon = ({ name, onClick }) => {
  return (
    <>
      {name === "edit" ? (
        <svg
          onClick={onClick}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24px"
          height="24px"
        >
          <path d="M0 0h24v24H0z" fill="none" />

          <path d="M3 17.25V21h3.75l9.81-9.81-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      ) : (
        ""
      )}

      {name === "wallet" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="WalletIcon"
          tabIndex="-1"
          title="Wallet"
        >
          <path d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1.86 9.77c-.24.2-.57.28-.88.2L4.15 11.25C4.45 10.52 5.16 10 6 10h12c.67 0 1.26.34 1.63.84l-3.49 2.93zM6 6h12c1.1 0 2 .9 2 2v.55c-.59-.34-1.27-.55-2-.55H6c-.73 0-1.41.21-2 .55V8c0-1.1.9-2 2-2z"></path>
        </svg>
      ) : (
        ""
      )}

      {name === "key" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="KeyIcon"
          tabIndex="-1"
          title="Key"
        >
          <path d="M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13l2 2 2-2 2 2 4-4.04L21 10zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
        </svg>
      ) : (
        ""
      )}

      {name === "app" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="AppsIcon"
          tabIndex="-1"
          title="Apps"
        >
          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"></path>
        </svg>
      ) : (
        ""
      )}

      {name === "add" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="AddIcon"
          tabIndex="-1"
          title="Add"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
        </svg>
      ) : (
        ""
      )}

      {name === "tap" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="TouchAppIcon"
          tabIndex="-1"
          title="TouchApp"
        >
          <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74c-3.6-.76-3.54-.75-3.67-.75-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"></path>
        </svg>
      ) : (
        ""
      )}

      {name === "lit" ? (
        <svg
          onClick={onClick}
          width="125"
          height="146"
          viewBox="0 0 125 146"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7613 42.7561C17.7613 42.7561 17.5134 47.4605 8.39669 62.8062C-2.16247 80.5884 -3.15416 101.404 7.63039 118.781C30.3658 155.414 92.0699 154.722 114.946 118.803C123.792 104.91 126.328 88.9674 123.308 72.7721C123.308 72.7721 115.989 38.9577 90.9937 17.6359C91.3881 17.9679 92.3573 22.4923 92.5432 24.4224C93.1123 30.3536 92.5545 36.5717 90.5655 42.2159C89.1061 46.3632 87.0833 49.9534 83.6632 52.7221C83.6632 51.7542 83.4209 50.021 83.4152 49.4413C83.2518 37.6297 78.6766 26.6902 71.222 17.5065C64.7085 9.49323 55.7777 4.02351 46.3736 0C46.6103 0.810329 47.0498 4.16982 47.1118 4.83384C47.5963 10.4105 47.6865 18.2212 46.954 23.7922C46.2215 29.3632 44.965 32.3963 43.2577 37.6184C40.6715 45.536 37.1499 51.4053 32.6873 58.445C31.8646 59.7393 29.408 63.2901 28.0951 65.0852C28.0951 65.0852 25.8357 50.8144 17.767 42.7561H17.7613Z"
            fill="currentColor"
          ></path>
        </svg>
      ) : (
        ""
      )}
      {name === "seed" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-uqopch"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="PasswordIcon"
        >
          <path d="M2 17h20v2H2v-2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H5.3l.85-1.47L4.85 7 4 8.47 3.15 7l-1.3.75.85 1.47H1v1.5h1.7l-.85 1.48 1.3.75zm6.7-.75 1.3.75.85-1.48.85 1.48 1.3-.75-.85-1.48H15v-1.5h-1.7l.85-1.47-1.3-.75L12 8.47 11.15 7l-1.3.75.85 1.47H9v1.5h1.7l-.85 1.48zM23 9.22h-1.7l.85-1.47-1.3-.75L20 8.47 19.15 7l-1.3.75.85 1.47H17v1.5h1.7l-.85 1.48 1.3.75.85-1.48.85 1.48 1.3-.75-.85-1.48H23v-1.5z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "money" ? (
        <svg
          onClick={onClick}
          className="money MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-uqopch"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="RequestQuoteIcon"
        >
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm1 10h-4v1h3c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-1v1h-2v-1H9v-2h4v-1h-3c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1h1V9h2v1h2v2zm-2-4V3.5L17.5 8H13z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "listen-on" ? (
        <svg
          onClick={onClick}
          className="icon-listen-off MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="HearingIcon"
          tabIndex="-1"
          title="Hearing"
        >
          <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2zM7.64 2.64 6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36zM11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "listen-off" ? (
        <svg
          onClick={onClick}
          className="icon-listen-on MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="HearingDisabledIcon"
          tabIndex="-1"
          title="HearingDisabled"
        >
          <path d="M6.03 3.2C7.15 2.44 8.51 2 10 2c3.93 0 7 3.07 7 7 0 1.26-.38 2.65-1.07 3.9-.02.04-.05.08-.08.13l-1.48-1.48c.4-.86.63-1.75.63-2.55 0-2.8-2.2-5-5-5-.92 0-1.76.26-2.5.67L6.03 3.2zm11.18 11.18 1.43 1.43C20.11 13.93 21 11.57 21 9c0-3.04-1.23-5.79-3.22-7.78l-1.42 1.42C17.99 4.26 19 6.51 19 9c0 2.02-.67 3.88-1.79 5.38zM10 6.5c-.21 0-.4.03-.59.08l3.01 3.01c.05-.19.08-.38.08-.59 0-1.38-1.12-2.5-2.5-2.5zm11.19 14.69L2.81 2.81 1.39 4.22l2.13 2.13C3.19 7.16 3 8.05 3 9h2c0-.36.05-.71.12-1.05l6.61 6.61c-.88.68-1.78 1.41-2.27 2.9-.5 1.5-1 2.01-1.71 2.38-.19.1-.46.16-.75.16-1.1 0-2-.9-2-2H3c0 2.21 1.79 4 4 4 .57 0 1.13-.12 1.64-.35 1.36-.71 2.13-1.73 2.73-3.55.32-.98.9-1.43 1.71-2.05.03-.02.05-.04.08-.06l6.62 6.62 1.41-1.42z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "alert" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="ReportIcon"
          tabIndex="-1"
          title="Report"
        >
          <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "close" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="CloseIcon"
          tabIndex="-1"
          title="Close"
        >
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "refresh" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="RefreshIcon"
          tabIndex="-1"
          title="Refresh"
        >
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "more" ? (
        <svg
          onClick={onClick}
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="MoreVertIcon"
          tabIndex="-1"
          title="MoreVert"
        >
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
        </svg>
      ) : (
        ""
      )}
      {name === "wallet-connect" ? (
        <svg
          onClick={onClick}
          className="wallet-connect MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-1shn170"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="CloudSyncIcon"
          tabIndex="-1"
          title="CloudSync"
        >
          <path d="M21.5 14.98c-.02 0-.03 0-.05.01C21.2 13.3 19.76 12 18 12c-1.4 0-2.6.83-3.16 2.02C13.26 14.1 12 15.4 12 17c0 1.66 1.34 3 3 3l6.5-.02c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5zM10 4.26v2.09C7.67 7.18 6 9.39 6 12c0 1.77.78 3.34 2 4.44V14h2v6H4v-2h2.73C5.06 16.54 4 14.4 4 12c0-3.73 2.55-6.85 6-7.74zM20 6h-2.73c1.43 1.26 2.41 3.01 2.66 5h-2.02c-.23-1.36-.93-2.55-1.91-3.44V10h-2V4h6v2z"></path>
        </svg>
      ) : (
        ""
      )}
    </>
  );
};
export default Icon;
