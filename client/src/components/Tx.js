import React from 'react';

const Tx = ({tx}) => {
    const {input, outputMap} = tx;
    const recipients = Object.keys(outputMap);

    return (
        <div className="Tx">
            <div>From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
            {
                recipients.map(recipient => (
                        <div key={recipient}>
                            To: {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
                        </div>
                    )
                )
            }
        </div>
    );
}

export default Tx;