/**
 * Throttles a function call, ensuring that the function is not executed more than once in a specified time period.
 * This is useful for limiting the number of function calls made in response to an event, such as scroll or resize events.
 *
 * @param {Function} callback - The function to be executed after the throttle time has elapsed.
 * @param {number} time - The time, in milliseconds, for which to throttle the function call.
 *                        The function will not be executed more than once within this time frame.
 */
let throttlePause;
const throttle = (callback, time) => {
    //don't run the function if throttlePause is true
    if (throttlePause) return;
    //set throttlePause to true after the if condition. This allows the function to be run once
    throttlePause = true;

    //setTimeout runs the callback within the specified time
    setTimeout(() => {
        callback();

        //throttlePause is set to false once the function has been called, allowing the throttle function to loop
        throttlePause = false;
    }, time);
};

export default throttle;
