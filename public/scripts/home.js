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

//

const navBarContainer = document.querySelector(".nav-bar");
navBarContainer.style.top = "0.5rem";
