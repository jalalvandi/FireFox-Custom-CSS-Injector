// ~/background/background.js
//
//  * Copyright (C) Mohammad (Sina) Jalalvandi 2024-2025 <jalalvandi.sina@gmail.com>
//  * Package : Custom CSS Injector
//  * License : Apache-2.0
//  * Version : 1.1.0
//  * URL     : https://github.com/jalalvandi/custom-css-injector
//  * Sign: Custom CSS Injector-20250411-34b291c67838-27ee80d95aac2ee4c6d6cad04a14338d
//
// this file contains the background script for the extension.


/**
 * Listens for updates to tabs (like loading a new page or navigating).
 * When a page finishes loading, it checks if there's stored CSS for that domain
 * and tells the content script to load and apply it.
 */
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Check if the update is for a completed page load ('complete')
    // and the tab has a valid http/https URL.
    if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {

        let domain;
        try {
            // Extract the hostname (domain) from the tab's URL.
            const url = new URL(tab.url);
            domain = url.hostname;
            console.log(`BACKGROUND.JS: Tab ${tabId} updated to ${domain}. Status: ${changeInfo.status}`);

            // No need to check storage here anymore, the content script will do it.
            // Just send the message to the content script to handle the initial load.

            // Send a message to the content script in the updated tab.
            try {
                await browser.tabs.sendMessage(tabId, {
                    command: "loadInitialCss",
                    domain: domain // Pass the domain so the content script knows what to load
                });
                console.log(`BACKGROUND.JS: Sent 'loadInitialCss' command to tab ${tabId} for domain ${domain}`);
            } catch (error) {
                // It's possible the content script isn't ready immediately or the tab was closed.
                // Log errors other than the common "connection" errors.
                if (error.message.includes("Could not establish connection") || error.message.includes("Receiving end does not exist")) {
                    console.warn(`BACKGROUND.JS: Content script in tab ${tabId} (${domain}) was not available for initial load message. This can be normal.`);
                } else {
                    console.error(`BACKGROUND.JS: Error sending 'loadInitialCss' message to tab ${tabId} (${domain}):`, error);
                }
            }

        } catch (error) {
            // Catch potential errors from `new URL()` or other unexpected issues.
            if (domain) {
                console.error(`BACKGROUND.JS: Error processing tab update for domain ${domain}:`, error);
            } else {
                console.error("BACKGROUND.JS: Error processing tab update (before domain extraction):", error);
            }
        }
    }
});

// Log when the background script starts up.
console.log("BACKGROUND.JS: Custom CSS Injector background script started.");