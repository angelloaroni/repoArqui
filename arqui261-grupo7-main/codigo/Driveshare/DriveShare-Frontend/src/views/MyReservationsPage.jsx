// src/views/MyReservationsPage.jsx

import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'
import MyReservations from '../components/myReservations/MyReservations'

export default function MyReservationsPage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <MyReservations />
      <Footer/>
    </>
  )
}