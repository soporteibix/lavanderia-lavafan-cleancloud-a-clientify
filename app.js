import axios from 'axios';

// Configura los parámetros requeridos
const api_token = "1d1132d976e9b68ba0ae528596771783e91aa9c1";

// Configura la solicitud POST para obtener información de clientes con un rango de fechas
const customersOptions = {
    method: 'post',
    url: 'https://cleancloudapp.com/api/getCustomer',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        "api_token": api_token,
        "dateFrom": "2023-01-31",
        "dateTo": "2023-01-31"
    }
};

// Configura la solicitud POST para obtener información de pedidos con un rango de fechas
const ordersOptions = {
    method: 'post',
    url: 'https://cleancloudapp.com/api/getOrders',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        "api_token": api_token,
        "dateFrom": "2023-01-01",
        "dateTo": "2023-12-31"
    }
};

// Función para procesar y mostrar la información de un pedido y cliente correspondiente
const processCustomerOrder = (customer, order) => {
    console.log('Informacion cliente:');
    console.log('ID:', customer.ID);
    console.log('Name:', customer.Name);
    console.log('Email:', customer.Email);
    console.log('Telefono:', customer.Tel);
    console.log('Direccion:', customer.customerAddressInstructions);
    console.log('Apartamento:', customer.Address ,'segunda linea del //');
    console.log('Ciudad :', customer.Address ,'tercera linea del //');
    console.log('Barrio :', customer.customerAddressInstructions,'segunda linea del //');
    console.log('Código postal :', customer.Address,'tercera linea del //');
    console.log('Notas :', customer.Notes);
    console.log('Notas Privadas :', customer.privateNotes);
    console.log('Order Information:');
    console.log('Recogida del pedido:', order.address);
    console.log('Notas:', order.notes);
    console.log('ID del pedido:', order.id);
    console.log('Status del pago:', order.paid);
    console.log('Hora de recogida:', order.deliveryTime);
    console.log('Cantidad de piezas:', order.pieces);
    console.log('Status:', order.status);
    console.log('---------------------------------');
};

// Función para continuar con la obtención y procesamiento de información de pedidos
const continueWithOrders = (customersData, ordersData) => {
    // Itera sobre clientes y pedidos para buscar coincidencias
    customersData.forEach(customer => {
        ordersData.forEach(order => {
            if (customer.ID === order.id) {
                // Llama a la función de procesamiento
                processCustomerOrder(customer, order);
            }
        });
    });

    console.log('Proceso de comparación completado.');
};

// Realiza la solicitud para obtener información de clientes
axios(customersOptions)
    .then(response => {
        // Maneja la respuesta
        console.log('Status (Customers):', response.status);
        console.log('Headers (Customers):', response.headers);

        // Procesa la respuesta JSON si es exitosa
        const customersData = response.data.Customers; // Accede al array Customers

        // Realiza la solicitud para obtener información de pedidos
        axios(ordersOptions)
            .then(response => {
                // Maneja la respuesta de pedidos
                console.log('Status (Orders):', response.status);
                console.log('Headers (Orders):', response.headers);

                // Procesa la respuesta JSON de pedidos si es exitosa
                const ordersData = response.data.Orders;

                // Llama a la función para comparar clientes y pedidos
                continueWithOrders(customersData, ordersData);
            })
            .catch(error => {
                console.error('Error (Orders):', error);
            });
    })
    .catch(error => {
        console.error('Error (Customers):', error);
    });
