import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/common/context/checkout';
import { _ } from '@evershop/evershop/src/lib/locale/translate';
import RenderIfTrue from '@components/common/RenderIfTrue';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export function Paypal({ cartUuid, createOrderAPI, orderId, orderPlaced, startLoading }) {
  const [error, setError] = useState('');
  const [order_Id, _setOrder_Id] = useState(orderId);
  const [isOrderPlaced, _setIsOrderdPlaced] = useState(orderPlaced);
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
              startLoading()
              return manualCreateOrder(cartUuid)
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


export default function PaypalMethod({ checkout: { cartId }, createOrderAPI }) {  
  const checkout = useCheckout();
  const { placeOrder } = useCheckoutDispatch();
  const [isLoading, setIsLoading] = useState(false)

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

  function startLoading() {
    setIsLoading(true)
  }


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
          <CreditCardIcon size={30} />
        </div>
      </div>
      <div>
        <RenderIfTrue
          condition={
            !!selectedPaymentMethod && selectedPaymentMethod.code === 'paypal'
          }
        >
          <div>

            {
              !isLoading ?
                <Paypal
                  cartUuid={cartId}
                  createOrderAPI={createOrderAPI}
                  orderPlaced={orderPlaced}
                  orderId={orderId}
                  startLoading={startLoading}
                />
              :
                <div className='w-full h-full my-10 flex justify-center items-center'>
                  <Spinner size={50} />
                </div>
            }
          </div>
        </RenderIfTrue>
      </div>
    </div>
  );
}


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

async function submitCartAddress(
  adminToken,
  cartId,
  addressData,
  useShippingAddress = true,
  note = document.querySelector("#note").innerHTML ?? "",
) {
  const url = `/api/carts/${cartId}/addresses`;

  // Transform the address data to match API requirements
  const transformedAddress = {
    full_name: addressData.fullName,
    telephone: addressData.telephone,
    address_1: addressData.address1,
    address_2: addressData.address2 || "", // Handle null case
    city: addressData.city,
    country: addressData.country.code,
    province: addressData.province.code,
    postcode: addressData.postcode
  };

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'http://localhost:3000/checkout',
    'X-Requested-With': 'XMLHttpRequest',
    'Sec-GPC': '1',
    'Priority': 'u=0',
    'Cookie': `asid=${adminToken}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        useShippingAddress: useShippingAddress ? "1" : "0",
        address: transformedAddress,
        method_code: "Paypal",
        method_name: "paypal",
        type: "billing",
        note: note
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting cart address:', error);
    throw error;
  }
}

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

async function submitPaymentMethod(
  adminToken,
  cartId,
) {
  const url = `/api/carts/${cartId}/paymentMethods`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': '/checkout',
    'Sec-GPC': '1',
    'Priority': 'u=4',
    'Cookie': `asid=${adminToken}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        method_code: 'paypal',
        method_name: 'Paypal'
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting payment method:', error);
    throw error;
  }
}

async function createOrder(
  adminToken,
  cartId,
) {
  const url = '/api/orders';
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': '/checkout',
    'Sec-GPC': '1',
    'Cookie': `asid=${adminToken}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        cart_id: cartId
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Order created successfully:", result);
    return result.data.uuid;

  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

async function manualCreateOrder(cartId) {
  try {
    const adminToken = await getAdminToken("admin@admin.com", "_")
    const address = JSON.parse(localStorage.getItem("shippingAddress"))
    console.log(address);

    await submitCartAddress(adminToken, cartId, address, )
    await submitPaymentMethod(adminToken, cartId)
    const orderId = await createOrder(adminToken, cartId)
      
    window.location.href = `${window.location.origin}/checkout/success/${orderId}`

  } catch (error) {
    throw error;
  }
  return orderId
}

const CreditCardIcon = ({
  color = 'currentColor',
  size = 24,
  strokeWidth = 1.5,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Credit card icon"
      role="img"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 9h20" />
      <path d="M6 15h2" />
      <path d="M10 15h4" />
      <rect x="4" y="11" width="4" height="4" rx="1" />
      <circle cx="19" cy="15" r="1" />
    </svg>
  );
};

const Spinner = ({
  size = 24,
  color = 'currentColor',
  thickness = 2,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      className={className}
      aria-label="Loading spinner"
      role="status"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth={thickness}>
          <circle strokeOpacity=".25" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  );
};

PaypalMethod.propTypes = {
  checkout: PropTypes.shape({
     cartId: PropTypes.string.isRequired
   }).isRequired,
  createOrderAPI: PropTypes.string.isRequired
};


export const layout = {
  areaId: 'checkoutPaymentMethodpaypal',
  sortOrder: 10
};

export const query = `
  query Query {
    checkout {
      cartId
    }
    createOrderAPI: url(routeId: "paypalCreateOrder")
  }
`;

