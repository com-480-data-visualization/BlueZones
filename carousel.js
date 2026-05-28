// Code from documentation: https://www.embla-carousel.com/docs/v8/get-started/cdn
// Scale effect code from: https://www.embla-carousel.com/docs/v8/examples/predefined#scale

const wrapperNode = document.querySelector('.embla')
const viewportNode = wrapperNode.querySelector('.embla__viewport')
const prevButtonNode = wrapperNode.querySelector('.emblaprev')
const nextButtonNode = wrapperNode.querySelector('.embla__next')

const emblaApi = EmblaCarousel(viewportNode, { loop: true })

const slideToCountry = [
    "Japan",
    "Greece",
    "Italy",
    "Costa Rica",
    "United States of America"
]

const notifyActiveCountry = () => {
    const activeSlideIndex = emblaApi.selectedScrollSnap()
    const activeCountry = slideToCountry[activeSlideIndex]

    if (!activeCountry) return

    window.currentBlueZoneCountry = activeCountry

    window.dispatchEvent(
        new CustomEvent("bluezone:active-country-change", {
            detail: { country: activeCountry, slideIndex: activeSlideIndex }
        })
    )
}

setupTweenScale(emblaApi)

emblaApi.on("select", notifyActiveCountry)
emblaApi.on("reInit", notifyActiveCountry)
notifyActiveCountry()

let autoplayTimer = null

const startAutoplay = () => {
    clearInterval(autoplayTimer)
    autoplayTimer = setInterval(() => emblaApi.scrollNext(), 4000)
}

const stopAutoplay = () => {
    clearInterval(autoplayTimer)
    autoplayTimer = null
}

wrapperNode.addEventListener('mouseenter', stopAutoplay)
wrapperNode.addEventListener('mouseleave', startAutoplay)

startAutoplay()
