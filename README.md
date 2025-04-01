# Custom CSS Injector (Firefox Extension)

A simple Firefox browser extension that allows you to inject your own custom CSS rules into any website. Styles are saved per domain and applied automatically whenever you visit the site.

## Features

*   **Inject Custom CSS:** Apply your own styles to modify the appearance of websites.
*   **Domain-Specific Styles:** Save different CSS rules for different websites (based on their hostname).
*   **Persistent Storage:** Your custom CSS rules are saved locally using `browser.storage.local` and persist across browser sessions.
*   **Automatic Application:** Saved CSS is automatically applied every time you load a page on a configured domain.
*   **Instant Application:** CSS changes made in the popup are applied immediately without needing to reload the page.
*   **Simple Popup Interface:** Easily add or edit CSS via a popup accessed from the Firefox toolbar icon.

## How to Use

1.  **Install the Extension:** Follow the installation steps below.
2.  **Navigate:** Go to the website you wish to style.
3.  **Open Popup:** Click the extension's icon (usually looks like the `icon-48.png` you created) in the Firefox toolbar.
4.  **Verify Domain:** The popup will display the current website's domain.
5.  **Enter CSS:** Type or paste your custom CSS rules into the text area.
6.  **Save & Apply:** Click the "Save & Apply" button.
7.  **See Changes:** Your CSS rules should immediately affect the page. They are now saved and will be automatically applied the next time you visit this domain.
8.  **Edit/Remove:** To edit, open the popup again on the same domain, modify the CSS, and save. To remove styles for a domain, clear the text area and click "Save & Apply".

## Installation (for Development/Testing)

Since this is custom code, you need to load it as a temporary add-on:

1.  **Get the Code:** Download or clone the extension's files to a local directory on your computer.
2.  **Open Firefox.**
3.  **Navigate to Add-ons Debugging:** Type `about:debugging#/runtime/this-firefox` into the address bar and press Enter.
4.  **Load Temporary Add-on:** Click the "Load Temporary Add-on..." button.
5.  **Select Manifest:** Browse to the directory where you saved the extension files and select the `manifest.json` file.
6.  **Done:** The extension should now be loaded, and its icon should appear in the Firefox toolbar.

**Note:** Temporary add-ons are removed when you close Firefox. For a permanent installation, the extension would need to be packaged and potentially signed by Mozilla.

## File Structure

*   `manifest.json`: The core configuration file detailing the extension's properties, permissions, scripts, and UI components.
*   `icons/`: Contains the icons used for the toolbar button and extension listings.
*   `popup/`: Holds the files for the user interface that appears when clicking the toolbar icon.
    *   `popup.html`: The structure of the popup window.
    *   `popup.css`: Styles for the popup window.
    *   `popup.js`: Handles user input, saving CSS to storage, and communicating with the content script.
*   `content_scripts/`: Contains scripts injected directly into web pages.
    *   `injector.js`: Responsible for creating/updating the `<style>` tag on the web page and applying the CSS rules. Listens for messages from the popup and background script.
*   `background/`: Contains scripts that run in the background, independent of specific web pages.
    *   `background.js`: Listens for events (like page loads) and instructs the content script to apply the appropriate saved CSS for the loaded domain.

## Reporting Issues
Encounter a bug? Click "Report Issue" in the popup and send the URL along with a description to jalalvandi.sina@gmail.com.

## License
This project is open-source under the MIT License (LICENSE). Feel free to use, modify, and distribute it.

## Credits
Developed by Sina Jalalvandi (mailto:jalalvandi.sina@gmail.com). Contributions and feedback are welcome!