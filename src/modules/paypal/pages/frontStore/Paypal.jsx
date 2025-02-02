import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/common/context/checkout';
import { _ } from '@evershop/evershop/src/lib/locale/translate';
import RenderIfTrue from '@components/common/RenderIfTrue';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export function Paypal({ createOrderAPI, orderId, orderPlaced }) {
  const [error, setError] = useState('');
  const [order_Id, setOrder_Id] = useState(orderId);
  const [isOrderPlaced, setIsOrderdPlaced] = useState(orderPlaced);
  const [price, _setPrice] = useState(document.querySelector(".grand-total-value").innerHTML.slice(1, document.querySelector(".grand-total-value").innerHTML.length - 1))


  const createOrder = async () => {
    const response = await fetch(createOrderAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: order_Id
      })
    });
    const data = await response.json();
    if (!response.error) {
      
      console.log(data);
    } else {
      setError(response.error.message);
    }
  };

  React.useEffect(() => {   
    if (isOrderPlaced && order_Id) {
      // Call the API to create the order
      createOrder()
    }
  }, [isOrderPlaced, order_Id]);

  return (
    <PayPalScriptProvider options={{
        intent: "capture",
        currency: "USD",
        environment: "sandbox",
        clientId: "ATGyBS0gD1uWp6r8obohW_lLAp4dsyD0L5P2PJjhugzY_eaJXC1tEClwUfZWj3wPfTSmehNL-U4gm51F",
      }}>
      <div>
        {error && <div className="text-critical mb-20">{error}</div>}
        <div className="p-8 text-center border rounded mt-4 border-divider">
          <PayPalButtons 
            createOrder={() => {
              return createOrderPaypal(price)
            }}
            onApprove={() => {
              const formHrefArray = document.querySelector("#checkoutPaymentForm").action.split("/")
              const cartId = formHrefArray.slice(formHrefArray.length- 2, formHrefArray.length - 1)[0]
              manualCreateOrder(cartId)
              
              return true
            }}          
            styles={{
              color: "silver",
              layout: "vertical",
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

Paypal.propTypes = {
  createOrderAPI: PropTypes.string.isRequired,
  orderId: PropTypes.string,
  orderPlaced: PropTypes.bool.isRequired
};

Paypal.defaultProps = {
  orderId: undefined
};


export default function PaypalMethod({ createOrderAPI }) {  
  const checkout = useCheckout();
  const { placeOrder } = useCheckoutDispatch();

  const { steps, paymentMethods, setPaymentMethods, orderPlaced, orderId } =
    checkout;
    
  // Get the selected payment method
  const selectedPaymentMethod = paymentMethods
    ? paymentMethods.find((paymentMethod) => paymentMethod.selected)
    : undefined;

  useEffect(() => {
    const selectedPaymentMethod = paymentMethods.find(
      (paymentMethod) => paymentMethod.selected
    );
    if (
      steps.every((step) => step.isCompleted) &&
      selectedPaymentMethod.code === 'paypal'
    ) {    
      placeOrder();
    }
  }, [steps]);


  return (
    <div>
      <div className="flex justify-start items-center gap-4">
        <RenderIfTrue
          condition={
            !selectedPaymentMethod || selectedPaymentMethod.code !== 'paypal'
          }
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPaymentMethods((previous) =>
                previous.map((paymentMethod) => {
                  if (paymentMethod.code === 'paypal') {
                    return {
                      ...paymentMethod,
                      selected: true
                    };
                  } else {
                    return {
                      ...paymentMethod,
                      selected: false
                    };
                  }
                })
              );
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </a>
        </RenderIfTrue>
        <RenderIfTrue
          condition={
            !!selectedPaymentMethod && selectedPaymentMethod.code === 'paypal'
          }
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2c6ecb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </RenderIfTrue>
        <div>
          {/* <PaypalLogo width={70} /> */}
        </div>
      </div>
      <div>
        <RenderIfTrue
          condition={
            !!selectedPaymentMethod && selectedPaymentMethod.code === 'paypal'
          }
        >
          <div>
            <Paypal
              createOrderAPI={createOrderAPI}
              orderPlaced={orderPlaced}
              orderId={orderId}
            />
          </div>
        </RenderIfTrue>
      </div>
    </div>
  );
}

PaypalMethod.propTypes = {
  createOrderAPI: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'checkoutPaymentMethodpaypal',
  sortOrder: 10
};

export const query = `
  query Query {
    createOrderAPI: url(routeId: "paypalCreateOrder")
  }
`;

const createOrderPaypal = async (price) => {
  try {
    const response = await fetch("http://localhost:3001/create-order", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: price,
      }),
    });

    const orderData = await response.json();
    if (!orderData.id) {
      const errorDetail = orderData.details[0];
      const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : "Unexpected error occurred, please try again.";
      throw new Error(errorMessage);
    } 

    return orderData.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// async function submitAddressForm(cartId) {
//   const addressForm = document.querySelector("#checkoutPaymentForm")

//   // Add a submit event listener
//   addressForm.addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent the form from submitting and refreshing the page

//     // Create a FormData object from the form
//     const formData = new FormData(form);

//     try {
//       // Submit the form data using fetch
//       const response = await fetch(`/api/carts/${cartId}/addresses`, {
//         method: 'POST',
//         body: formData, // FormData is sent as the request body
//       });

//       // Check if the response is OK
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//     } catch (error) {
//       console.error('Error submitting address form:', error);
//     }
//   });
// }


async function getAdminToken(adminEmail, adminPassword) {
  const url = "/admin/user/login";

  try {
      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: adminEmail,
            password: adminPassword
          })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result.data.sid      
  } catch (error) {
      console.error("Login failed:", error);
      throw error
  }
}

async function submitPaymentMethod(adminToken, cartId) {
  try {
    const response = await fetch(`/api/carts/${cartId}/paymentMethods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'Cookie': `asid=${adminToken}`
      },
      body: JSON.stringify({
        method_code: "paypal",
        method_name: "Paypal",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    console.error('Error setting payment method:', error);
    throw error;
  }
}

async function createOrder(adminToken, cartId) { 
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", // This header ensures the body is parsed as JSON.
        "Cookie": `asid=${adminToken}`
      },
      body: JSON.stringify({
        cart_id: cartId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Order created successfully:", result);
    return result.data.uuid;
  
  } catch (error) {
    console.error("Order creation failed:", error);
    throw error;
  }
}

async function manualCreateOrder(cartId) {
  try {
    const adminToken = await getAdminToken("admin@admin.com", "mo50z60x")
    // await submitAddressForm(cartId)
    await submitPaymentMethod(adminToken, cartId)
    const orderId = await createOrder(adminToken, cartId)  
    window.location.href = `${window.location.origin}/checkout/success/${orderId}`

  } catch (error) {
    throw error;
  }
  return orderId
}