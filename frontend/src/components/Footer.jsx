import { Link } from "react-router-dom";
import { ADDRESS, EMAIL, PHONENO, STORE_NAME } from "../lib/constants";

const link = "hover:underline";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">{STORE_NAME}</h4>
            <p className="text-sm text-gray-600">
              Quality kitchen utensils and bhada for every home. Pay cash when
              your order arrives.
            </p>
            <p className="mt-3 text-sm text-gray-600">
              {ADDRESS}
              <br />
              {PHONENO} · {EMAIL}
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link className={link} to="/about">
                  About us
                </Link>
              </li>
              <li>
                <Link className={link} to="/contactUs">
                  Contact us
                </Link>
              </li>
              <li>
                <Link className={link} to="/frequentlyAskedQuestions">
                  FAQs
                </Link>
              </li>
              <li>
                <Link className={link} to="/shippingInfo">
                  Shipping info
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">
              Customer service
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link className={link} to="/returns">
                  Returns
                </Link>
              </li>
              <li>
                <Link className={link} to="/userProfile/myOrders">
                  Track order
                </Link>
              </li>
              <li>
                <Link className={link} to="/help/customer">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link className={link} to="/termsAndConditions">
                  Terms &amp; conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
