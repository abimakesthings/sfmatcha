export default function Hero() {
  return (
    <div className='hero-section'>
      <div className='hero-left'>
      </div>
      <div className='hero-right'>
        <div className='hero-content-wrapper'>
          <div className='sf-map-illustration-wrapper'>
            <img className='sf-map-illustration' src='/assets/sf-map-illustration.png' alt='SF map illustration' />
          </div>
          <h1 className='hero-title'>the matcha</h1>
          <div className='shortlist-section'>
            <img className='shortlist-oval' src='/assets/oval.svg' alt='' />
            <h1 className='shortlist'>
              shortlist
              <span className='sparkle sparkle-1'>★</span>
              <span className='sparkle sparkle-2'>★</span>
              <span className='sparkle sparkle-3'>★</span>
            </h1>
            <p className='location'>for San Francisco</p>
          </div>
        </div>
        <div className='hero-subtitle'>
          <p className='subtitle'>Because life's too short to have bad matcha</p>
          <span className='scroll-arrow'>↓</span>
        </div>
      </div>
    </div>
  )
}
