// Check for mobile user agent
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

if (isMobileDevice()) {
    alert("For the best experience using this website we recommend that you use a desktop browser.");
}
