// src/views/PublishVehiclePage.jsx

import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'
import PublishVehicle from '../components/publishVehicle/PublishVehicle'

export default function PublishVehiclePage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <PublishVehicle />
      <Footer/>
    </>
  )
}