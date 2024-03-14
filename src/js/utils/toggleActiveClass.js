/**
 * Toggles the active class on the given element based on the isActive flag.
 *
 * @param {HTMLElement} element - The HTML element to toggle the active class on
 * @param {boolean} isActive - Flag indicating whether to add or remove the active class
 * @return {void}
 */
const toggleActiveClass = (element, isActive) => {
    isActive
        ? element.classList.add('active')
        : element.classList.remove('active');
};

export default toggleActiveClass;
