// Code from documentation: https://www.embla-carousel.com/docs/v8/get-started/cdn
// Scale effect code from: https://www.embla-carousel.com/docs/v8/examples/predefined#scale

const wrapperNode = document.querySelector('.embla')
const viewportNode = wrapperNode.querySelector('.embla__viewport')
const prevButtonNode = wrapperNode.querySelector('.emblaprev')
const nextButtonNode = wrapperNode.querySelector('.embla__next')

const emblaApi = EmblaCarousel(viewportNode, { loop: true }, [
    EmblaCarouselAutoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
])

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

emblaApi.plugins().autoplay?.play()