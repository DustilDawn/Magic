export const Links = ({ links, onClickOrbis, onClickCerscan }) => {
    return (
        <div className="page-input-result example-format text-left">

            <h6><span>Orbis</span></h6>
            <a onClick={() => onClickOrbis(links.orbis)}>{links.orbis}</a>
            <div className="separator-xxs"></div>
            <h6><span>Cerscan</span></h6>
            <a onClick={() => onClickCerscan(links.cerscan)}>{links.cerscan}</a>
        </div>
    )
}