// ~/popup/popup.js
//
//  * Copyright (C) Mohammad (Sina) Jalalvandi 2024-2025 <jalalvandi.sina@gmail.com>
//  * Package : Custom CSS Injector
//  * License : Apache-2.0
//  * Version : 1.1.0
//  * URL     : https://github.com/jalalvandi/custom-css-injector
//  * Sign: Custom CSS Injector-20250411-34b291c67838-27ee80d95aac2ee4c6d6cad04a14338d
//
// this file containts the popup script for the extension



// Get references to the HTML elements
const cssInput = document.getElementById('css-input');
const saveButton = document.getElementById('save-button');
const statusMessage = document.getElementById('status-message');
const currentDomainDisplay = document.getElementById('current-domain');

// Variables to store the current tab's ID and domain
let currentTabId = null;
let currentDomain = null;

/**
 * Loads the saved CSS for the current active tab's domain.
 * Queries the active tab, extracts the hostname, and retrieves
 * CSS from browser.storage.local. Updates the UI accordingly.
 */
async function loadSavedCss() {
    try {
        // Get the currently active tab in the current window
        let [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // Validate if the tab is usable (has an ID, URL, and is http/https)
        if (tab && tab.id && tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
            currentTabId = tab.id;
            // Extract the hostname (domain) from the URL
            const url = new URL(tab.url);
            currentDomain = url.hostname;
            currentDomainDisplay.textContent = currentDomain; // Display the domain in the popup

            // Retrieve saved CSS for this domain from local storage
            // The key used for storage is the domain name itself
            let result = await browser.storage.local.get(currentDomain);

            // If CSS exists for this domain, display it in the textarea
            // Otherwise, set the textarea value to empty
            cssInput.value = result[currentDomain] || '';
            saveButton.disabled = false; // Enable the save button
            cssInput.disabled = false; // Enable the text area

        } else {
            // Handle cases where the tab is not supported (e.g., about:blank, about:addons)
            currentDomainDisplay.textContent = "Unsupported page";
            cssInput.placeholder = "Works on regular web pages (http/https).";
            cssInput.disabled = true;
            saveButton.disabled = true; // Disable the save button
        }
    } catch (error) {
        console.error("Error loading CSS:", error);
        statusMessage.textContent = "Error loading tab info.";
        statusMessage.style.color = 'red';
        saveButton.disabled = true;
        cssInput.disabled = true;
    }
}

/**
 * Saves the CSS from the textarea to local storage for the current domain
 * and sends a message to the content script to apply it immediately.
 */
async function saveAndApplyCss() {
    // Ensure we have a valid domain and tab ID
    if (!currentDomain || !currentTabId) {
        statusMessage.textContent = "No valid domain selected.";
        statusMessage.style.color = 'red';
        return;
    }

    // Get the CSS code from the textarea, removing leading/trailing whitespace
    const cssToApply = cssInput.value.trim();

    try {
        // 1. Save the CSS to browser.storage.local
        // We use an object where the key is the domain name and the value is the CSS string
        await browser.storage.local.set({ [currentDomain]: cssToApply });
        console.log(`CSS saved for domain: ${currentDomain}`);

        // 2. Send a message to the content script in the active tab to apply the CSS
        // This allows for instant application without a page refresh.
        try {
            await browser.tabs.sendMessage(currentTabId, {
                command: "applyCss",
                css: cssToApply // Send the actual CSS string
            });

            // Display success message
            statusMessage.textContent = "CSS saved and applied!";
            statusMessage.style.color = 'green';

        } catch (error) {
            // This error often means the content script isn't ready or injected yet
            console.error("Error sending message to content script:", error);
            if (error.message.includes("Could not establish connection") || error.message.includes("Receiving end does not exist")) {
                statusMessage.textContent = "Error: Page isn't ready for CSS. Try refreshing the page or wait a moment and save again.";
            } else {
                statusMessage.textContent = "Error applying CSS.";
            }
            statusMessage.style.color = 'red';
        }

        // Clear the status message after a few seconds
        setTimeout(() => { statusMessage.textContent = ''; }, 3000);

    } catch (error) {
        // Handle errors during the storage process
        console.error("Error saving CSS to storage:", error);
        statusMessage.textContent = "Error saving CSS.";
        statusMessage.style.color = 'red';
    }
}

// Add event listener to the save button
saveButton.addEventListener('click', saveAndApplyCss);

// Load the saved CSS when the popup is opened
document.addEventListener('DOMContentLoaded', loadSavedCss);