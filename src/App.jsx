import Hero from './components/Hero'
import Map from './components/Map'
import TopTen from './components/TopTen'
import PopularityChart from './components/PopularityChart'
import StandoutFlavors from './components/StandoutFlavors'
import PollSection from './components/PollSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Hero />
      <Map />
      <TopTen />
      <PopularityChart />
      <StandoutFlavors />
      <PollSection />
      <Footer />
    </>
  )
}
