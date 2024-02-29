import axios from 'axios';
//Token clientify
const token = "9ea36e0237e45db8581e45546b9a5474a701556f";

if (!token) {
  console.error('Token de autorización no proporcionado. Asegúrate de configurar la variable de entorno CLIENTIFY_TOKEN.');
  process.exit(1);
}

const processedContacts = new Set();

const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
const formattedThreeDaysAgo = threeDaysAgo.toISOString().split('T')[0];

const configWithDateFilter = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://api.clientify.net/v1/contacts/',
  params: {
    created_after: formattedThreeDaysAgo,
  },
  headers: {
    'Authorization': `Token ${token}`
  }
};

const isDateWithinLast3Days = (currentDate, contactDate) => {
  const today = new Date(currentDate);
  const contactCreatedDate = new Date(contactDate.split('T')[0]);
  const timeDifference = today.getTime() - contactCreatedDate.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return daysDifference <= 3;
};

const displayContactInfo = (contact) => {
  console.log(`Nombre: ${contact.first_name} ${contact.last_name}`);
  console.log(`Número de contacto: ${contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : 'N/A'}`);
  console.log(`E-mail: ${contact.emails && contact.emails.length > 0 ? contact.emails[0].email : 'notiene@lavanderialavafam.com'}`);
  console.log(`Dirección: ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].street : 'N/A'}, ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].city : 'N/A'}, ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].state : 'N/A'}, ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].country : 'N/A'}`);
  console.log(`Tags: ${contact.tags && contact.tags.length > 0 ? contact.tags.join(', ') : 'N/A'}`);
  console.log(`Fecha de creación: ${contact.created}`);

  console.log('------------------------');
};

const fetchDataAndPost = async () => {
  try {
    const response = await axios(configWithDateFilter);
    const contacts = response.data.results;

    const currentDate = getCurrentDate();
    const pruebaContacts = contacts.filter(contact =>
      contact.tags && contact.tags.includes('prueba') && isDateWithinLast3Days(currentDate, contact.created)
    );

    pruebaContacts.forEach(async (contact, index) => {
      // Verifica si el contacto ya ha sido procesado antes de mostrar la información
      if (!processedContacts.has(contact.id)) {
        displayContactInfo(contact);
        processedContacts.add(contact.id);

        if (contact.addresses && contact.addresses.length > 0) {
          const postConfig = {
            method: 'POST',
            url: 'https://cleancloudapp.com/api/addCustomer',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              api_token: '1d1132d976e9b68ba0ae528596771783e91aa9c1//',
              customerName: `${contact.first_name} ${contact.last_name}`,
              customerTel: contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : '',
              customerEmail: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
              customerAddress: `${contact.addresses[0].street}, ${contact.addresses[0].city}, ${contact.addresses[0].state}, ${contact.addresses[0].country}`,
              customerNotes: 'Nota de prueba, cliente desde clientify',
            }
          };

          try {
            const postResponse = await axios(postConfig);
            console.log('Status:', postResponse.status);
            console.log('Response:', postResponse.data);
          } catch (error) {
            console.error('Error en la solicitud POST:', error);
          }
        }

        // Agrega un pequeño retardo de 15 segundos entre cada solicitud POST
        if (index < pruebaContacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 15000)); // Pausa de 15 segundos
        }
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Agrega un pequeño retardo de 10 minutos entre cada ejecucion del codigo
setInterval(async () => {
  console.log('Ejecutando fetchDataAndPost...');
  await fetchDataAndPost();
}, 10 *  60 * 1000);
