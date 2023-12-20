// TODO: add types/docs
const toggleActiveClass = (element, isActive) => {
    isActive
        ? element.classList.add('active')
        : element.classList.remove('active');
};

export default toggleActiveClass;
