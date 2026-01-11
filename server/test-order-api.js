// fetch is global in Node 18+


async function testOrderCreation() {
    const API_URL = 'http://localhost:5000';
    const orderData = {
        customerName: "Test User",
        email: "test@example.com",
        phone: "0123456789",
        address: "123 Test St",
        city: "Test City",
        totalAmount: 100.50,
        paymentMethod: "PAYSTACK",
        paymentReference: "TEST-REF-" + Date.now(),
        items: [


            {
                productId: 13,
                selectedSize: "M",
                price: 100.50
            }

        ]
    };


    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testOrderCreation();
