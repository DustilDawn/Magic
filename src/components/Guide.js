export const Guide = () => {
    return (
        <div className="guide">
            The following commands are available:
            <ul>
                <li>/send [address] [amount in wei]</li>
                {/* <li>/help</li> */}
                <li className="disabled">/recurring-payment [address] [amount] [interval] [start] [end]</li>
                <li className="disabled">more coming soon...</li>
            </ul>
        </div>
    )
}