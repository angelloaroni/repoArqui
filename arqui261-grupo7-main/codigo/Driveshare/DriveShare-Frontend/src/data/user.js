// src/data/user.js

const users = [
  {
    id_user: 'USR-001',
    email: 'juan.perez@gmail.com',
    google_id: null,
    password_hash: 'hashed_password_001',
    name: 'Juan',
    lastname: 'Pérez',
    phone: '+51999888777',
    avatar_url: 'https://i.pravatar.cc/300?img=11',
    role: 'Arrendatario',
    created_at: '2026-01-15T10:00:00',
    // ✨ Nuevos campos basados en el ERD
    document_id: '45781236',
    nationality: 'Peruano',
    driver_license: 'Q-45781236',
    birth_date: '1995-04-12'
  },
  {
    id_user: 'USR-002',
    email: 'maria.torres@gmail.com',
    google_id: 'google_usr_002',
    password_hash: 'hashed_password_002',
    name: 'María',
    lastname: 'Torres',
    phone: '+51988777666',
    avatar_url: 'https://i.pravatar.cc/300?img=5',
    role: 'Arrendador',
    created_at: '2026-01-20T14:30:00',
    // ✨ Nuevos campos basados en el ERD
    document_id: '09874521',
    nationality: 'Peruana',
    driver_license: 'A-09874521',
    birth_date: '1988-11-23'
  },
  {
    id_user: 'USR-003',
    email: 'carlos.rojas@gmail.com',
    google_id: null,
    password_hash: 'hashed_password_003',
    name: 'Carlos',
    lastname: 'Rojas',
    phone: '+51977666555',
    avatar_url: 'https://i.pravatar.cc/300?img=15',
    role: 'Arrendatario',
    created_at: '2026-02-01T09:15:00',
    // ✨ Nuevos campos basados en el ERD
    document_id: '71245369',
    nationality: 'Peruano',
    driver_license: 'B-71245369',
    birth_date: '1992-07-05'
  },
  {
    id_user: 'USR-004',
    email: 'andrea.vega@gmail.com',
    google_id: null,
    password_hash: 'hashed_password_004',
    name: 'Andrea',
    lastname: 'Vega',
    phone: '+51966555444',
    avatar_url: 'https://i.pravatar.cc/300?img=47',
    role: 'Arrendador',
    created_at: '2026-02-12T16:20:00',
    // ✨ Nuevos campos basados en el ERD
    document_id: '41253698',
    nationality: 'Peruana',
    driver_license: 'A-41253698',
    birth_date: '1994-02-28'
  },
  {
    id_user: 'USR-005',
    email: 'diego.salas@gmail.com',
    google_id: 'google_usr_005',
    password_hash: 'hashed_password_005',
    name: 'Diego',
    lastname: 'Salas',
    phone: '+51955444333',
    avatar_url: 'https://i.pravatar.cc/300?img=68',
    role: 'Arrendatario',
    created_at: '2026-03-05T11:45:00',
    // ✨ Nuevos campos basados en el ERD
    document_id: '75412396',
    nationality: 'Chileno',
    driver_license: 'EXT-75412396',
    birth_date: '1999-09-15'
  }
]

export default users