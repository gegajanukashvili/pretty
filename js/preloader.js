document.addEventListener("DOMContentLoaded", () => {

    const preloader = document.getElementById("flower-preloader");

    if (!preloader) return;

    // თაიგულის აწყობის დრო — უფრო სწრაფი ანიმაცია
    const ANIMATION_DURATION = 8500;

    // გაქრობის ეფექტის დრო
    const FADE_DURATION = 1000;

    let animationFinished = false;
    let pageLoaded = document.readyState === "complete";
    let preloaderFinished = false;

    // ვამოწმებთ ორივე პირობას
    function checkFinish() {
        if (
            animationFinished &&
            pageLoaded &&
            !preloaderFinished
        ) {
            preloaderFinished = true;
            finishPreloader();
        }
    }

    // პრელოადერის გაქრობა
    function finishPreloader() {

        if (!preloader.isConnected) return;

        preloader.classList.add("is-hidden");

        setTimeout(() => {
            if (preloader.isConnected) {
                preloader.remove();
            }

            document.body.classList.remove("preloader-active");

        }, FADE_DURATION);
    }

    // გვერდის სრულ ჩატვირთვას ველოდებით
    if (!pageLoaded) {
        window.addEventListener("load", () => {
            pageLoaded = true;
            checkFinish();
        }, { once: true });
    }

    // თაიგულის აწყობის დასრულება
    setTimeout(() => {
        animationFinished = true;
        checkFinish();
    }, ANIMATION_DURATION);

});