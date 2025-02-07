import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import "dotenv/config";

const app = express();

// Allow requests from sahlstor.com
app.use(cors());

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

const port = process.env.PORT || 3000;
const environment = process.env.ENVIRONMENT || "sandbox";
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const endpoint_url =
    environment === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

app.get("/", async (_req, res) => {
    res.json({
        message: "Hello, world!",
    });
});

/**
 * Creates an order and returns it as a JSON response.
 * @function
 * @name createOrder
 * @memberof module:routes
 * @param {object} req - The HTTP request object.
 * @param {object} req.body - The request body containing the order information.
 * @param {string} req.body.intent - The intent of the order.
 * @param {array} req.body.cart - Cart
 * @param {object} res - The HTTP response object.
 * @returns {object} The created order as a JSON response.
 * @throws {Error} If there is an error creating the order.
 */
app.post("/create-order", async (req, res) => {
    const order = await createOrder(req);

    res.json(order);
});

// Use the orders API to create an order
async function createOrder(req) {
    // Create accessToken using your clientID and clientSecret
    // For the full stack example, please see the Standard Integration guide:
    // https://developer.paypal.com/docs/multiparty/checkout/standard/integrate/
    const accessToken = await get_access_token();
    return fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: req.body.price,
                    },
                    reference_id: generateRandomString(),
                },
            ],
            intent: "CAPTURE",
            payment_source: {
                paypal: {
                    experience_context: {
                        payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                        payment_method_selected: "PAYPAL",
                        brand_name: "Shopiverse LTD",
                        locale: "en-US",
                        landing_page: "LOGIN",
                        user_action: "PAY_NOW",
                    },
                },
            },
        }),
    }).then((response) => response.json());
}

/**
 * Retrieves an API Access Token (Node.js)
 */
async function get_access_token() {
    const auth = `${client_id}:${client_secret}`;
    const data = "grant_type=client_credentials";
    return fetch(endpoint_url + "/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
        },
        body: data,
    })
        .then((res) => res.json())
        .then((json) => {
            return json.access_token;
        });
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

const generateRandomString = () =>
    `${[1e7] + -1e3 + -4e3 + -8e3 + -1e11}`.replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
