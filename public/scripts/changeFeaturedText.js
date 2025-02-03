let textSelect = document.evaluate(
    "//h3[contains(., 'Featured Products')]",
    document,
    null,
    XPathResult.ANY_TYPE,
    null
);
let textNode = textSelect.iterateNext();

textNode.style.fontSize = "3rem";
textNode.style.textAlign = "left";
