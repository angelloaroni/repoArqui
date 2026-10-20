import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'
import MyVehicles from '../components/myVehicles/MyVehicles'

export default function MyVehiclesPage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <MyVehicles />
      <Footer/>
    </>
  )
}