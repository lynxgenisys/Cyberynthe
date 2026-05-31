import { useState, useEffect } from 'react';

const checkIsMobile = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent;
    const isMobileUA = Boolean(
        userAgent.match(
            /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
    );
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const hasTouch = navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    return isMobileUA || isIPadOS || (hasTouch && isSmallScreen);
};

export default function useDeviceDetect() {
    const [isMobile, setIsMobile] = useState(checkIsMobile);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(checkIsMobile());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile };
}
