try {
    const textSelect = document.evaluate(
        "//h3[contains(., 'Featured Products')]",
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    const textNode = textSelect.iterateNext();

    textNode.style.fontSize = "3rem";
    textNode.style.textAlign = "left";
} catch (error) {}
//

try {
    const navBarContainer = document.querySelector(".nav-bar");
    navBarContainer.style.top = "0.5rem";
} catch (error) {}

//

function translateAppToArabic() {
    // Create a hidden container for the Google Translate widget
    const translateContainer = document.createElement("div");
    translateContainer.id = "google_translate_container";
    translateContainer.style.display = "none";

    // Create the target element for translation
    const appElement = document.getElementById("app");
    appElement.insertAdjacentElement("beforebegin", translateContainer);

    // Set cookie to force Arabic translation (auto-detects source language)
    document.cookie = "googtrans=/auto/ar; path=/;";

    // Initialize translation widget
    const initScript = document.createElement("script");
    initScript.text = `
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'auto',
                includedLanguages: 'ar',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_container');
            
            // Remove Google's branding
            const banner = document.querySelector('.goog-te-banner-frame');
            if (banner) banner.style.display = 'none';
        }
    `;

    const translateScript = document.createElement("script");
    translateScript.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

    document.head.appendChild(initScript);
    document.head.appendChild(translateScript);

    // Handle dynamic content changes
    const observer = new MutationObserver(() => {
        if (window.google && window.google.translate) {
            google.translate.TranslateElement.Instance().translatePage(
                "auto",
                "ar"
            );
        }
    });

    observer.observe(appElement, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}

try {
    translateAppToArabic();
} catch (error) {}

//
function updatePrices() {
    // Select all product price listings
    const priceNodes = document.querySelectorAll(".product-price-listing");

    priceNodes.forEach((node) => {
        // Extract original price
        const priceElement = node.querySelector(".sale-price");
        const originalText = priceElement.innerText;
        const originalPrice = parseFloat(originalText.replace(/[^0-9.]/g, ""));

        // Calculate new price
        const newPrice = (originalPrice * 1.15).toFixed(2);

        // Create new HTML with strikethrough
        priceElement.innerHTML = `
            <span style="text-decoration: line-through">${newPrice}</span>
            - 
            ${originalText} ريال سعودي
        `;
    });
}

// Run the function when the page loads
window.addEventListener("DOMContentLoaded", updatePrices);

//

window.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".product-thumbnail-listing img");

    console.log(images);

    images.forEach(function (img) {
        // Create a container <div> with relative positioning and inline-block display
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.display = "inline-block";

        // Insert the container before the image in the DOM
        img.parentNode.insertBefore(container, img);
        // Move the image inside the container
        container.appendChild(img);

        // Create the <span> for the sale label
        const saleLabel = document.createElement("span");
        saleLabel.textContent = "خصم";
        // Style the label: absolute position at the bottom left, with a black background and white text
        saleLabel.style.position = "absolute";
        saleLabel.style.bottom = "0";
        saleLabel.style.left = "0";
        saleLabel.style.backgroundColor = "black";
        saleLabel.style.color = "white";
        saleLabel.style.fontSize = "12px";
        saleLabel.style.padding = "2px 4px";

        // Append the sale label to the container
        container.appendChild(saleLabel);
    });
});
