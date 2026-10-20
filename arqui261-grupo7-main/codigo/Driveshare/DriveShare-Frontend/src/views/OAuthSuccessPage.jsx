// src/views/OAuthSuccessPage.jsx
import OAuthSuccess from '../components/OAuthSuccess/OAuthSuccess'

function OAuthSuccessPage() {
  return (
    <>
      {/* Solo llamamos al componente que contiene la lógica de redirección */}
      <OAuthSuccess />
    </>
  )
}

export default OAuthSuccessPage