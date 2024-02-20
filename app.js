import axios from 'axios';

//token Clean Cloud
const api_token = "1d1132d976e9b68ba0ae528596771783e91aa9c1";
//const delayBetweenRequests = 1000;

// Función para obtener la fecha actual en formato "YYYY-MM-DD"
const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Variable global para mantener un conjunto de IDs de pedidos procesados
const processedOrderIds = new Set();

const fifteenDaysAgo = new Date();

//El ultimo dato determina la cantidad de dias atras que va a buscar, en este caso 5
fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 5);


const customersOptions = {
    method: 'post',
    url: 'https://cleancloudapp.com/api/getCustomer',
    headers: {
        'Content-Type': 'application/json'
        
    },

    data: {
        "api_token": api_token,
        "dateFrom": fifteenDaysAgo.toISOString().split('T')[0],  // Formatea la fecha a "YYYY-MM-DD"
        "dateTo": getCurrentDate(),
        excludeDeactivated: 0
    }
};console.log('Script iniciado');


const ordersOptions = {
    method: 'post',
    url: 'https://cleancloudapp.com/api/getOrders',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        "api_token": api_token,
        "dateFrom": fifteenDaysAgo.toISOString().split('T')[0],
        "dateTo": getCurrentDate(),
        excludeDeactivated: 0
    }
};
let cachedCustomersData = null;
let cachedOrdersData = null;


// Función para procesar y mostrar la información de un pedido y cliente correspondiente
const processCustomerOrder = (customer, order) => {
    //Verificar si el ID del pedido ya ha sido procesado
    if (processedOrderIds.has(order.id)) {
        console.log(`Pedido con ID ${order.id} ya procesado. Ignorando.`);
        return;
    }

    //Declaracion de variables:
    console.log('Informacion cliente:');
    console.log('ID:', customer.ID);
    console.log('Name:', customer.Name);
    console.log('Email:', customer.Email);
    console.log('Telefono:', customer.Tel);
    console.log('Direccion:', customer.customerAddressInstructions);
    console.log('Ciudad :', customer.Address);
    console.log('Apartamento:', customer.Address)
    console.log('Barrio :', customer.customerAddressInstructions);
    console.log('Código postal :', customer.Address);
    console.log('Servicio: ', customer.Notes);
    console.log('Notas Privadas :', customer.privateNotes);
    console.log('Order Information:');
    console.log('Recogida del pedido:', order.address);
    console.log('Notas:', order.notes);
    console.log('ID del pedido:', order.id);
    console.log('Fecha de recogida del pedido:', order.pickupDate);
    console.log('Monto total del pedido:', order.total);
    console.log(' Franja horaria de entrega del pedido:', order.deliveryTime);

    if (order.paid == 1) {
        order.paid = "Pagado"

    } else {
        order.paid = "No Pagado"

    }

    console.log('Hora de recogida:', order.deliveryTime);
    console.log('Cantidad de piezas:', order.pieces);


    if (order.status == 0) {
        order.status = 'Limpiando';

    } if (order.status == 1) {
        order.status = 'Limpio y listo para entregar';

    } if (order.status == 2) {
        order.status = 'Completado';

    } if (order.status == 4) {
        order.status = 'Esperando recogida';

    }

    console.log('---------------------------------');

    // Agregar el ID del pedido al conjunto
    processedOrderIds.add(order.id);
    //Declaracion de variables a Clientify

    const contactData = {
        "id": parseInt(customer.Tel, 10),
        "first_name": customer.Name,
        "email": customer.Email,
        "phone": customer.Tel,
        //"status": order.status,
        "addresses": [
            {
                "street": customer.customerAddressInstructions,
                // "city": customer.Address,
                // "state": customer.Address,
                "country": "Colombia",
                "postal_code": "",
                "type": 1
            }
        ],

        "message":
            'ID del pedido: ' + order.id + "\n"
            + 'Servicio: ' + order.notes + "\n"
            + 'Cantidad de piezas: ' + order.pieces + "\n"
            + 'Status: ' + order.status + "\n"
            + 'Status del pago: ' + order.paid + "\n"
            + 'Hora de recogida: ' + order.deliveryTime + "\n"
            + 'Total del pedido: ' + order.total + "\n"
            + 'Dirección del pedido: ' + order.address + "\n"
            + 'Comentarios: ' + customer.privateNotes
        ,

        "description": 'ID Cliente: ' + customer.ID + "\n" + 'ID pedido: ' + order.id +
            "\n" + 'Hora recogida: ' + order.deliveryTime + "\n"
            + 'Cantidad piezas: ' + order.pieces,

        "tags": [
            "api_cleancloud", "Colombia",
        ],

    };

    const apiUrl = 'https://api.clientify.net/v1/contacts/';
    const authToken = '9ea36e0237e45db8581e45546b9a5474a701556f';

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: apiUrl,
        headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(contactData)
    };

    // Agrega un retraso antes de realizar la siguiente consulta y envío
    return new Promise(resolve => {
        setTimeout(() => {
            axios(config)
                .then(response => {
                    console.log("Enviado a Clientify");
                    resolve();
                })
                .catch(error => {
                    console.log("Contacto NO enviado");
                    resolve();
                });
        });
    });
};

const continueWithOrders = async (customersData, ordersData) => {
    for (const customer of customersData) {
        const associatedOrders = ordersData.filter(order => order.customerID === customer.ID);

        if (associatedOrders.length > 0) {
            // Si hay pedidos asociados, procesar la información
            for (const order of associatedOrders) {
                await processCustomerOrder(customer, order);
            }
        } else {
            // Si no hay pedidos asociados, procesar la información del cliente sin pedidos
            await processCustomerWithoutOrder(customer);
        }
    }

    console.log('Proceso de comparación completado.');
};


// Nueva función para procesar clientes sin pedidos
const processCustomerWithoutOrder = async (customer) => {
    console.log('Informacion cliente sin pedidos:');
    console.log('ID:', customer.ID);
    console.log('Name:', customer.Name);
    console.log('Email:', customer.Email);
    console.log('---------------------------------');

    //Declaracion de variables a Clientify

    const contactData = {
        "id": parseInt(customer.Tel, 10),
        "first_name": customer.Name,
        "email": customer.Email,
        "phone": customer.Tel,

        "addresses": [
            {
                "street": customer.customerAddressInstructions,
                "country": "Colombia",
                "postal_code": "",
                "type": 1
            }
        ]
    };

    const apiUrl = 'https://api.clientify.net/v1/contacts/';
    const authToken = '9ea36e0237e45db8581e45546b9a5474a701556f';

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: apiUrl,
        headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(contactData)
    };
    console.log('Script iniciado');

    // Agrega un retraso antes de realizar la siguiente consulta y envío
    return new Promise(resolve => {
        setTimeout(() => {
            axios(config)
                .then(response => {
                    console.log("Enviado a Clientify");
                    console.log('Script iniciado');

                    resolve();
                })
                .catch(error => {
                    console.log("Contacto NO enviado");
                    resolve();
                });
        });
    });
};

let cleanCloudRequestsCount = 0;

axios(customersOptions)
    .then(response => {
        cleanCloudRequestsCount++;
        //console.log('API Response (Customers):', response.data);

        if (response.data && response.data.Customers && Array.isArray(response.data.Customers)) {
            const customersData = response.data.Customers;
            axios(ordersOptions)
                .then(response => {
                    cleanCloudRequestsCount++;
                    //console.log('API Response (Orders):', response.data);

                    if (response.data && response.data.Orders && Array.isArray(response.data.Orders)) {
                        const ordersData = response.data.Orders;
                        continueWithOrders(customersData, ordersData);
                    } else {
                        console.error('Error: La respuesta de la API no contiene una propiedad Orders iterable.');
                    }
                })
                .catch(error => {
                    console.error('Error (Orders):', error);
                });
        } else {
            console.error('Error: La respuesta de la API no contiene una propiedad Customers iterable.');
        }
    })
    .catch(error => {
        console.error('Error (Customers):', error);
    });



// Opciones del cliente para la solicitud inicial
const initialRequestOptions = {
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    }
};

const fetchCleanCloudData = async () => {
    try {
        // Realizar la primera solicitud solo si los datos en caché aún no existen
        if (!cachedCustomersData || !cachedOrdersData) {
            const customersResponse = await axios({
                ...initialRequestOptions,
                ...customersOptions
            });
            const customersData = customersResponse.data?.Customers || [];

            const ordersResponse = await axios({
                ...initialRequestOptions,
                ...ordersOptions
            });
            const ordersData = ordersResponse.data?.Orders || [];

            cachedCustomersData = customersData;
            cachedOrdersData = ordersData;

            console.log('Datos de Clean Cloud actualizados.');
        }
    } catch (error) {
        console.error('Error al obtener datos de Clean Cloud:', error.message);
    }
};




const runProcess = async () => {
    try {
        // Verificar si ya se han obtenido los datos de Clean Cloud
        if (!cachedCustomersData || !cachedOrdersData) {
            await fetchCleanCloudData();
        }

        // Procesar la información utilizando los datos en caché
        await continueWithOrders(cachedCustomersData, cachedOrdersData);
        console.log('Proceso de comparación completado.');
    } catch (error) {
        console.error('Error en el proceso:', error.message);
    }
};


console.log(`Número total de peticiones a Clean Cloud: ${cleanCloudRequestsCount}`);

// Ejecutar el proceso inicial
//runProcess();

// Configurar un intervalo para actualizar los datos cada minuto (60,000 milisegundos)
const updateInterval =  60 * 1000; // Cada 10 minutos

setInterval(async () => {
    await fetchCleanCloudData();
    // Ejecutar el proceso después de actualizar los datos
    runProcess();
}, updateInterval);
