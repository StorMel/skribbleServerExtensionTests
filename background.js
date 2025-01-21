let notificationsEnabled = false; // Default state is OFF

// Set the badge text to "OFF" when the extension is installed
chrome.runtime.onInstalled.addListener(({ reason }) => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
    if (reason === "install") {
        chrome.storage.local.set({
            apiSuggestions: ["webNavigation", "storage", "notifications","activeTab","tabs","scripting"],
            
        });
    }

});
// Toggle the badge text between "ON" and "OFF" when the extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === "ON" ? "OFF" : "ON";
    notificationsEnabled = nextState === "ON";  // Enable/Disable notifications based on the state

    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState,
    });

    console.log(`Extension is ${nextState === "ON" ? "ON" : "OFF"}`);

    // Send the toggle state to content script
    chrome.tabs.sendMessage(tab.id, { type: 'toggle', enabled: notificationsEnabled });
});

// Handle messages and show notifications if enabled
chrome.runtime.onMessage.addListener((message) => {
    if (!notificationsEnabled) return;  // Don't show notifications if the extension is OFF

    if (message.type === 'serverLink') {
        const { link } = message;

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'player.png', 
            title: 'New Server Link',
            message: `Click to join the room.`,
            buttons: [{ title: 'Open Link' }],
            silent: true
        });

        // Open the link when the notification is clicked
        chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
            if (btnIdx === 0) {
                chrome.tabs.create({ url: link });
            }
        });
    }

    if (message.type === 'joined') {
        const { playerId, playerName } = message;
        showNotification(playerId, playerName, message.type);
    }

   /* if (message.type === 'left') {
        const { playerId, playerName } = message;
        showNotification(playerId, playerName, message.type);
    }*/
});

// Unified function for creating notifications
function showNotification(playerId, playerName, actionText) {
    const notificationMessage = `Player ${playerName} (ID: ${playerId}) has ${actionText} the game.`;
    debugger
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'player.png',
        title: `Player ${actionText === 'joined' ? 'joined' : 'left'}!`,
        message: notificationMessage,
        silent: true
    });
}