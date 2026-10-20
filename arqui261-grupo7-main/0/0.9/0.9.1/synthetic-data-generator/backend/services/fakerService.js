import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

faker.locale = "es";

const ROLES = ["arrendador", "arrendatario"];
const PROVIDERS = ["local", "google"];
const GENDERS = ["Masculino", "Femenino"];
const NATIONALITIES = [
    "Perú",
    "Chile",
    "Colombia",
    "Ecuador",
    "Argentina"
];

async function generateUsers(amount) {

    const users = [];

    const usedEmails = new Set();
    const usedDocuments = new Set();
    const usedLicenses = new Set();

    for (let i = 0; i < amount; i++) {

        let email;
        let documentId;
        let driverLicense;

        do {
            email = faker.internet.email().toLowerCase();
        } while (usedEmails.has(email));

        usedEmails.add(email);

        do {
            documentId = faker.string.numeric(8);
        } while (usedDocuments.has(documentId));

        usedDocuments.add(documentId);

        do {
            driverLicense = `LIC-${faker.string.alphanumeric(8).toUpperCase()}`;
        } while (usedLicenses.has(driverLicense));

        usedLicenses.add(driverLicense);

        const provider = faker.helpers.arrayElement(PROVIDERS);

        const passwordHash =
            provider === "local"
                ? await bcrypt.hash("Password123*", 10)
                : null;

        const googleId =
            provider === "google"
                ? faker.string.uuid()
                : null;

        users.push({

            email,

            provider,

            google_id: googleId,

            password_hash: passwordHash,

            name: faker.person.firstName(),

            lastname: faker.person.lastName(),

            phone: `+51 9${faker.string.numeric(8)}`,

            gender: faker.helpers.arrayElement(GENDERS),

            avatar_url: faker.image.avatar(),

            role: faker.helpers.arrayElement(ROLES),

            status: "active",

            rating_as_arrendador: faker.number.float({
                min: 4.5,
                max: 5,
                fractionDigits: 2
            }),

            rating_as_arrendatario: faker.number.float({
                min: 4.5,
                max: 5,
                fractionDigits: 2
            }),

            document_id: documentId,

            nationality: faker.helpers.arrayElement(NATIONALITIES),

            driver_license: driverLicense,

            birth_date: faker.date.birthdate({
                min: 20,
                max: 60,
                mode: "age"
            }),

            license_expiration: faker.date.future(),

            created_at: new Date(),

            updated_at: new Date()

        });

    }

    return users;

}

export default {
    generateUsers
};