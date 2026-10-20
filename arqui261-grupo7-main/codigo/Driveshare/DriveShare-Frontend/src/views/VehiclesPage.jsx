// src/views/VehiclesPage.jsx

import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'
import Vehicles from '../components/vehicles/Vehicles'

export default function VehiclesPage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <Vehicles />
      <Footer/>
    </>
  )
}