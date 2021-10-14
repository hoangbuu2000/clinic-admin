import { Redirect, Route } from "react-router";
import ForgotPassword from "./components/ForgotPassword";

export default function ProtectedRoute({ isAuth: isAuth, component: Component, ...rest }) {
    return (
        <Route {...rest} render={(props) => {
            if (isAuth) {
                return <Component />;
            } else {
                if (window.location.href.includes("/reset_password")) {
                    return <ForgotPassword />;
                }
                else
                    return (
                        <Redirect to={{ pathname: "/login"}} />
                    );
            }
        }} />
    )
}