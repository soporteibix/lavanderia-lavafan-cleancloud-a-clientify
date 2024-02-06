import axios from 'axios';

// Configura los parámetros requeridos
const api_token = "1d1132d976e9b68ba0ae528596771783e91aa9c1";

// Variable para almacenar customerID
let customerID;

// Configura la solicitud POST para obtener información de clientes con un rango de fechas
const customersOptions = {
    method: 'post',
    url: 'https://cleancloudapp.com/api/getCustomer',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        "api_token": api_token,
        "dateFrom": "2023-01-31",  // Fecha de inicio (ajusta según tus necesidades)
        "dateTo": "2023-01-31"     // Fecha de fin, ajustada a un rango de menos de 31 días
    }
};

// Realiza la solicitud para obtener información de clientes
axios(customersOptions)
    .then(response => {
        // Maneja la respuesta
        console.log('Status (Customers):', response.status);
        console.log('Headers (Customers):', response.headers);
        console.log('Response (Customers):', response.data);

        // Procesa la respuesta JSON si es exitosa
        const customersData = response.data;
        // Almacena el customerID para su uso posterior
        customerID = customersData[0].id;  // Suponiendo que la respuesta es un array y tomas el primer cliente

        // Aquí puedes trabajar con la información de clientes según tus necesidades
        console.log('Customers Information:', customersData);

        // Configura la solicitud POST para obtener información de pedidos con un rango de fechas
        const ordersOptions = {
            method: 'post',
            url: 'https://cleancloudapp.com/api/getOrders',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "api_token": api_token,
                "dateFrom": "2023-01-01",  // Fecha de inicio (ajusta según tus necesidades)
                "dateTo": "2023-12-31"     // Fecha de fin (ajusta según tus necesidades)
            }
        };

        // Realiza la solicitud para obtener información de pedidos
        return axios(ordersOptions);
    })
    .then(response => {
        // Maneja la respuesta de pedidos
        console.log('Status (Orders):', response.status);
        console.log('Headers (Orders):', response.headers);
        console.log('Response (Orders):', response.data);

        // Procesa la respuesta JSON de pedidos si es exitosa
        const ordersData = response.data;
        // Aquí puedes trabajar con la información de pedidos según tus necesidades
        console.log('Orders Information:', ordersData);

        // Busca el pedido con el mismo customerID
        const orderWithCustomer = ordersData.find(order => order.customerID === customerID);

        // Imprime la información del cliente asociada al pedido
        if (orderWithCustomer) {
            console.log('Customer Information for Order:', orderWithCustomer);
        } else {
            console.log('No customer information found for the specified order.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
