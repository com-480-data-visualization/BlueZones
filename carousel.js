// Code from documentation: https://www.embla-carousel.com/docs/v8/get-started/cdn
// Scale effect code from: https://www.embla-carousel.com/docs/v8/examples/predefined#scale

const wrapperNode = document.querySelector('.embla')
const viewportNode = wrapperNode.querySelector('.embla__viewport')
const prevButtonNode = wrapperNode.querySelector('.embla__prev')
const nextButtonNode = wrapperNode.querySelector('.embla__next')

const emblaApi = EmblaCarousel(viewportNode, { loop: true }, [
    EmblaCarouselAutoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
])

setupTweenScale(emblaApi)

emblaApi.plugins().autoplay?.play()