import { useState, useEffect } from 'react';

export default function useDeviceDetect() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
        const isMobileUA = Boolean(
            userAgent.match(
                /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
            )
        );
        
        // iPad on iOS 13+ requests desktop site by default and masquerades as Mac
        const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        const hasTouch = navigator.maxTouchPoints > 0;
        
        // Secondary check based on screen width just in case
        const isSmallScreen = window.innerWidth <= 1024; // Increased threshold for tablets

        // We assume it's mobile if it has a mobile UA, or it's an iPad, or it's a touch device with a smaller screen.
        const mobile = isMobileUA || isIPadOS || (hasTouch && isSmallScreen);

        setIsMobile(mobile);

        // Update on resize
        const handleResize = () => {
            const isSmallScreen = window.innerWidth <= 1024;
            setIsMobile(isMobileUA || isIPadOS || (hasTouch && isSmallScreen));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile };
}
