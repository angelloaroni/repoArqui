// src/views/YapePaymentPage.jsx

import YapePayment from '../components/yapePayment/YapePayment'
import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'

function YapePaymentPage() {

  return (

    <>
      <HeaderHome />
      <Navbar />
      <YapePayment />
      <Footer />
    </>

  )

}

export default YapePaymentPage