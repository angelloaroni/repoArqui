import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import repository from '../repositories/UsuarioRepository.js';
import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import { decrypt } from '../integration/encryption.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(
            new Error('Google no proporcionó un correo electrónico.'),
            null
          );
        }

        // ==========================================================
        // Buscar usuario
        // ==========================================================

        let esNuevoUsuario = false;

        let usuario = await repository.findByGoogleId(googleId);

        if (!usuario) {

            usuario = await repository.findByEmail(email);

            if (usuario) {

                usuario.google_id = googleId;
                usuario.provider = 'google';

                if (avatarUrl) {
                    usuario.avatar_url = avatarUrl;
                }

                await usuario.save();

            }

        }

        // ==========================================================
        // Crear usuario nuevo
        // ==========================================================

        if (!usuario) {
          esNuevoUsuario = true;

          usuario = await Usuario.create({

            email,
            google_id: googleId,
            provider: 'google',

            name:
              profile.name?.givenName ||
              profile.displayName,

            lastname:
              profile.name?.familyName ||
              ' ',

            avatar_url: avatarUrl,

            status: 'active',

            role: 'arrendatario',

            password_hash: null

          });

          console.log(
            `✨ Nuevo usuario OAuth registrado con éxito: ${email}`
          );

        }

        // ==========================================================
        // DESCIFRAR CAMPOS SENSIBLES
        // ==========================================================

        const phone = usuario.phone
          ? await decrypt(usuario.phone)
          : null;

        const document_id = usuario.document_id
          ? await decrypt(usuario.document_id)
          : null;

        const driver_license = usuario.driver_license
          ? await decrypt(usuario.driver_license)
          : null;

        // ==========================================================
        // JWT
        // ==========================================================

        const payload = {

          id_user: usuario.id_user,

          email: usuario.email,

          name: usuario.name,

          lastname: usuario.lastname,

          role: usuario.role,

          phone,

          document_id,

          driver_license,

          avatar_url: usuario.avatar_url

        };

        const token = jwt.sign(

          payload,

          process.env.JWT_SECRET,

          {
            expiresIn: '24h'
          }

        );

        // ==========================================================
        // Usuario enviado al callback
        // ==========================================================

        const usuarioPlano =
          usuario.get
            ? usuario.get({ plain: true })
            : usuario;

        usuarioPlano.phone = phone;
        usuarioPlano.document_id = document_id;
        usuarioPlano.driver_license = driver_license;
        usuarioPlano.avatar_url = usuario.avatar_url;

        const usuarioFinal = {

          ...usuarioPlano,
          token,
          esNuevoUsuario


        };

        return done(null, usuarioFinal);

      } catch (error) {

        console.error(
          '🔴 Error crítico en Callback de Google Strategy:',
          error
        );

        return done(error, null);

      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;