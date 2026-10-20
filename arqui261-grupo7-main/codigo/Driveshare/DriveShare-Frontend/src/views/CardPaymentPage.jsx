// src/views/CardPaymentPage.jsx

import CardPayment from '../components/cardPayment/CardPayment'
import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'

function CardPaymentPage() {

  return (

    <>
      <HeaderHome />
      <Navbar />
      <CardPayment />
      <Footer />
    </>

  )

}

export default CardPaymentPage