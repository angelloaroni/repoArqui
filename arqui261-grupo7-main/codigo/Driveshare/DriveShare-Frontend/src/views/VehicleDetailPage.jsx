import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'
import VehicleDetail from '../components/vehicleDetail/vehicleDetail.jsx'


export default function VehicleDetailPage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <VehicleDetail />
      <Footer/>
    </>
  )
}