import ToDateString from 'es-abstract/2015/ToDateString';
import React from 'react';

export default function DailyLoginReward() {
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        const claimedToday = localStorage.getItem('dailyClaim');
        if (claimedToday === new Date(),ToDateString()) {
            setClaimed(true);
        }
    }, []);
    const handleClaim = () => {
        localStorage.getItem('dailyClaim',new Date().toDateString());
        setClaimed(true);
    };

    return (
        <div className=';p-4 bg-indigo-50 rounded shawdow-md'>
            <h2 className='text-xl font-semibold'>Daily Login Reward</h2>
            {claimed?(
                <p className='text-green-700 mt-2'>Already claimed today</p>
            ):(
                <button
                onClick={handleClaim}
                className='mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'>
                    Claim Reward
                </button>
            )}
        </div>
    );
}