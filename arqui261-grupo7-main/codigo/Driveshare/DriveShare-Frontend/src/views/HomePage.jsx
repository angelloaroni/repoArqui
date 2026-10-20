import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'
import Home from '../components/Home/Home'

export default function HomePage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <Home />
      <Footer/>
    </>
  )
}