// Check for mobile user agent
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

if (isMobileDevice()) {
    alert("Sorry, this website is currently not supported on this device. For best experience try on a desktop browser.");
}
