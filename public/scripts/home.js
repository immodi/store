async function getUserCurrency() {
    try {
        // Step 1: Get the user's country code using ipapi.co
        const locationResponse = await fetch("https://api.country.is/");
        if (!locationResponse.ok) throw new Error("Failed to fetch location");

        const locationData = await locationResponse.json();
        const countryCode = locationData.country; // Example: "US"

        // Step 2: Fetch currency code for the country from restcountries.com
        const countryResponse = await fetch(
            `https://restcountries.com/v3.1/alpha/${countryCode}`
        );
        if (!countryResponse.ok)
            throw new Error("Failed to fetch country details");

        const countryData = await countryResponse.json();
        const currencyCode = Object.keys(countryData[0].currencies)[0]; // Example: "USD"

        return currencyCode || "USD"; // Return currency or default to USD
    } catch (error) {
        console.error("Error fetching user currency:", error);
        return "USD"; // Fallback currency
    }
}

async function convertUSD(amountUSD, targetCurrency) {
    try {
        const response = await fetch(
            `https://hexarate.paikama.co/api/rates/latest/USD?target=${targetCurrency}`
        );

        if (!response.ok) {
            return amountUSD;
        }

        const data = await response.json();

        const rate = data.data.mid; // conversion rate: 1 SAR = rate USD
        const newAmount = amountUSD * rate;
        return newAmount.toFixed(2);
    } catch (error) {
        return amountUSD;
    }
}

function extractNumber(text) {
    const number = text.match(/[\d.]+/g)?.join("") || "";
    return number;
}

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
            try {
                google.translate.TranslateElement.Instance().translatePage(
                    "auto",
                    "ar"
                );
            } catch (e) {}
        }
    });

    observer.observe(appElement, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}

function updatePrices() {
    // Select all product price listings
    const priceNodes = document.querySelectorAll(".sale-price");

    setTimeout(() => {
        priceNodes.forEach((node) => {
            // Extract original price
            const originalText = node.innerText;
            const originalPrice = parseFloat(
                originalText.replace(/[^0-9.]/g, "")
            );

            // Calculate new price
            const newPrice = (originalPrice * 1.15).toFixed(2);
            // Create new HTML with strikethrough
            node.innerHTML = `
                <span style="text-decoration: line-through">${newPrice}</span>
                -
                ${originalText}`;
        });
    }, 2000);
}

function addSaleCaption() {
    window.addEventListener("DOMContentLoaded", () => {
        const images = document.querySelectorAll(
            ".product-thumbnail-listing img"
        );

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
}

function removeTheGoogleTranslateHeader() {
    if (window.location.pathname !== "/checkout") {
        try {
            setTimeout(() => {
                new MutationObserver(() => {
                    const iframe = document.querySelector("iframe");
                    if (iframe) iframe.style.visibility = "hidden";
                }).observe(document.body, { childList: true, subtree: true });
            }, 10);
        } catch (e) {
            console.error("Error in removeTheGoogleTranslateHeader:", e);
        }
    }
}

function styleThePage() {
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

    try {
        const navBarContainer = document.querySelector(".nav-bar");
        navBarContainer.style.top = "0.5rem";
    } catch (error) {}
}

styleThePage();

try {
    getUserCurrency()
        .then((userCurrency) => {
            const allPriceNodes = [...document.querySelectorAll("*")].filter(
                (node) =>
                    node.childNodes.length === 1 && // Ensure only one child node
                    node.childNodes[0].nodeType === Node.TEXT_NODE && // Ensure it's a text node
                    node.innerText?.includes("$") && // Check if it contains "$"
                    !node.closest("script") // Ensure it's not inside a <script> tag
            );

            const alreadySavedPrices = {};
            for (const priceNode of allPriceNodes) {
                if (alreadySavedPrices[priceNode.innerHTML] !== undefined) {
                    priceNode.innerHTML =
                        alreadySavedPrices[priceNode.innerHTML];
                    continue;
                }

                const productPrice = extractNumber(priceNode.innerHTML);
                convertUSD(productPrice, userCurrency).then((newPrice) => {
                    const newText = `${newPrice} ${userCurrency}`;

                    alreadySavedPrices[priceNode.innerHTML] = newText;
                    priceNode.innerHTML = newText;
                });
            }
        })
        .finally(() => {
            updatePrices();
        });

    translateAppToArabic();
} catch (error) {}

addSaleCaption();

removeTheGoogleTranslateHeader();
