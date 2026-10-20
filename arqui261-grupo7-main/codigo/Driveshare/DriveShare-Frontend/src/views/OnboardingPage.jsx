// src/views/OnboardingPage.jsx
import Onboarding from '../components/Onboarding/Onboarding'
import Footer from '../components/footer/Footer'
import HeaderHome from '../components/headerHome/HeaderHome'
import Navbar from '../components/navbar/Navbar'

function OnboardingPage() {
  return (
    <>
      <HeaderHome />
      <Navbar />
      <Onboarding /> {/* El componente con toda la lógica del formulario */}
      <Footer />
    </>
  )
}

export default OnboardingPage;