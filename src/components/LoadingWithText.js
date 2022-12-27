import { Loading } from "./Loading"

export const LoadingWithText = ({msg = 'Loading...'}) => {
    return <>
        <div className="loading-with-text">
            <div className="separator-sm"></div>
            <Loading />
            <span>{msg}</span>
            <div className="separator-sm"></div>
        </div>
    </>
}