import {
  ADDRESS,
  DELIVERY_FEE,
  EMAIL,
  FREE_DELIVERY_FROM,
  PHONENO,
  STORE_NAME,
} from "../lib/constants";
import { money } from "../lib/format";
import { Card } from "../components/ui";

function Page({ title, children }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        {title}
      </h1>
      <div className="space-y-4 leading-relaxed text-gray-700">{children}</div>
    </div>
  );
}

const H = ({ children }) => (
  <h2 className="pt-2 text-lg font-semibold text-gray-900">{children}</h2>
);

export function About() {
  return (
    <Page title={`About ${STORE_NAME}`}>
      <p>
        {STORE_NAME} is a family-run utensils shop. We sell pots, pans, pressure
        cookers, plates, cutlery and traditional copper and brass bhada for
        everyday cooking and special occasions.
      </p>
      <p>
        Now you can order from home: browse, add to cart, and pay in cash when
        the order reaches your door.
      </p>
      <p className="text-sm text-gray-500">{ADDRESS}</p>
    </Page>
  );
}

export function ContactUs() {
  return (
    <Page title="Contact us">
      <Card className="space-y-2">
        <p>
          <span className="font-semibold">Phone:</span> {PHONENO}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {EMAIL}
        </p>
        <p>
          <span className="font-semibold">Address:</span> {ADDRESS}
        </p>
      </Card>
      <p>
        Call or email us for help with an order, product questions or your
        account.
      </p>
    </Page>
  );
}

const FAQS = [
  [
    "How do I pay?",
    "Payment is cash on delivery. You pay the delivery person when your order arrives.",
  ],
  [
    "How long does delivery take?",
    "We confirm your order first, then ship it. Delivery time depends on your location; we will call you if there is a delay.",
  ],
  [
    "How much is delivery?",
    `Delivery is ${money(DELIVERY_FEE)}, and free on orders of ${money(FREE_DELIVERY_FROM)} or more.`,
  ],
  [
    "Can I cancel my order?",
    "Yes, from My orders while it is still Placed or Confirmed. Once it has shipped, please contact us.",
  ],
  [
    "How do I review a product?",
    "After your order is delivered, open the product page and write a review.",
  ],
];

export function FAQ() {
  return (
    <Page title="Frequently asked questions">
      <div className="space-y-3">
        {FAQS.map(([question, answer]) => (
          <details
            key={question}
            className="rounded-xl border border-gray-200 p-4"
          >
            <summary className="cursor-pointer font-semibold text-gray-900">
              {question}
            </summary>
            <p className="mt-2">{answer}</p>
          </details>
        ))}
      </div>
    </Page>
  );
}

export function ShippingInfo() {
  return (
    <Page title="Shipping info">
      <H>Delivery charges</H>
      <p>
        A flat {money(DELIVERY_FEE)} per order. Orders of{" "}
        {money(FREE_DELIVERY_FROM)} or more ship free.
      </p>
      <H>How it works</H>
      <p>
        After you place an order we confirm it, pack it and send it out. You can
        follow each step under My orders. Payment is collected in cash on
        delivery.
      </p>
    </Page>
  );
}

export function Returns() {
  return (
    <Page title="Returns">
      <p>
        If an item arrives damaged or is not what you ordered, please contact us
        at {PHONENO} or {EMAIL} as soon as possible with your order number.
      </p>
      <p>We will arrange a replacement or refund for eligible items.</p>
    </Page>
  );
}

export function Help() {
  return (
    <Page title="Privacy policy">
      <p>
        We store your name, email, phone number and delivery addresses only to
        process your orders and manage your account. Passwords are stored
        encrypted. We do not sell your information.
      </p>
      <p>To have your account removed, contact us at {EMAIL}.</p>
    </Page>
  );
}

export function TermsAndConditions() {
  return (
    <Page title="Terms &amp; conditions">
      <p>
        By placing an order you agree to receive the items at the address given
        and to pay the total amount in cash on delivery. Prices and stock may
        change; the price shown at checkout is the price you pay.
      </p>
      <p>
        We may cancel an order if items are unavailable or the delivery details
        cannot be verified.
      </p>
    </Page>
  );
}
