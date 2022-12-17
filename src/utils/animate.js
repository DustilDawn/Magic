export function scrollEaseIn(element, to, duration) {
    const start = element.scrollLeft;
    const change = to - start;
    const increment = 20;

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function animateScroll() {
        const elapsedTime = Date.now() - startTime;
        const fraction = elapsedTime / duration;

        element.scrollLeft = start + change * easeInOutQuad(fraction);

        if (fraction < 1) {
            setTimeout(animateScroll, increment);
        }
    }

    const startTime = Date.now();
    animateScroll();
}