// A unique ID for the <style> tag we inject.
// Helps prevent conflicts and allows us to find/update it later.
const STYLE_TAG_ID = 'custom-css-injector-style-f9a3b1c7'; // Random suffix for uniqueness

/**
 * Applies the given CSS string to the page by injecting or updating
 * a <style> element in the document's <head>.
 * If cssString is empty or null, it effectively removes the custom style.
 * @param {string} cssString - The CSS rules to apply.
 */
function applyCssToPage(cssString) {
    let styleElement = document.getElementById(STYLE_TAG_ID);

    // If the style element doesn't exist yet, create it.
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = STYLE_TAG_ID;
        // Append the style tag to the <head> or the <html> element if <head> isn't available yet
        (document.head || document.documentElement).appendChild(styleElement);
        console.log("INJECTOR.JS: Created style tag with ID:", STYLE_TAG_ID);
    }

    // Update the content of the style tag with the new CSS.
    // If cssString is empty, the style tag will be empty, removing previous rules.
    styleElement.textContent = cssString || '';
    console.log("INJECTOR.JS: Applied CSS. Length:", (cssString || '').length);
}

/**
 * Loads the CSS stored for the given domain from browser.storage.local
 * and applies it to the page using applyCssToPage.
 * This is typically called when the page first loads.
 * @param {string} domain - The hostname of the current page.
 */
async function loadAndApplyInitialCss(domain) {
    if (!domain) {
        console.warn("INJECTOR.JS: loadAndApplyInitialCss called without a domain.");
        return;
    }
    try {
        // Retrieve the CSS associated with the domain key
        let result = await browser.storage.local.get(domain);
        const storedCss = result ? result[domain] : null; // Get the CSS or null

        if (storedCss) {
            console.log(`INJECTOR.JS: Found stored CSS for ${domain}. Applying...`);
            applyCssToPage(storedCss);
        } else {
            console.log(`INJECTOR.JS: No stored CSS found for ${domain}. Ensuring style tag is empty.`);
            // Ensure any previous style applied by this extension is removed if nothing is stored
            applyCssToPage('');
        }
    } catch (error) {
        console.error(`INJECTOR.JS: Error loading initial CSS for ${domain}:`, error);
    }
}

// --- Message Listener ---
// Listens for messages from other parts of the extension (popup or background script).
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("INJECTOR.JS: Message received!", message);

    // Handles the command sent from the popup after clicking "Save & Apply"
    if (message.command === "applyCss") {
        applyCssToPage(message.css);
        // Optionally, send a response back to the sender (popup)
        sendResponse({ status: "CSS applied by content script" });
        // Return true to indicate that the response will be sent asynchronously.
        // Required if you use sendResponse asynchronously (even if not strictly needed here).
        return true;
    }
    // Handles the command sent from the background script on page load
    else if (message.command === "loadInitialCss") {
        loadAndApplyInitialCss(message.domain);
        sendResponse({ status: "Initial CSS load triggered by content script" });
        // Return true for async response.
        return true;
    }

    // If the message is not recognized, you might return false or nothing.
});

// Log to confirm the content script has loaded and the listener is attached.
console.log("INJECTOR.JS: Custom CSS Injector content script loaded and listener attached on:", window.location.hostname);