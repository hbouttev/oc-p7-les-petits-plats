/**
 * @param {string} html representing a single element
 * @return {ChildNode | HTMLElement}
 */
export function htmlToElement(html) {
  const template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

/**
 * @param {string} html representing any number of sibling elements
 * @return {NodeList}
 */
export function htmlToElements(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.childNodes;
}

/**
 * @param {HTMLElement} parentElement parent element to remove all children from
 * @return {void}
 */
export function removeAllChildNodes(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
}

/**
 * @param {string} string string to capitalize first letter of
 * @returns {string}
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {Set<any>} setA
 * @param {Set<any>} setB
 * @returns {Set<any>}
 */
export function setDifference(setA, setB) {
  const difference = new Set(setA);
  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
}
