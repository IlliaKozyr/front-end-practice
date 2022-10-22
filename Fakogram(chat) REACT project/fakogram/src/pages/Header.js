import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link } from "react-router-dom";
import { CMyAvatar } from "../components/Avatar";
import { CLogoutBtn } from "../components/LogoutBtn";
import { CNickName } from "../components/NickName";

function Header() {
    return (
        <>
            {[false].map((expand) => (
                <Navbar key={expand} bg="primary" expand={expand}>
                    <Container fluid>
                        <Navbar.Toggle
                            aria-controls={`offcanvasNavbar-expand-${expand}`}
                            className="burger"
                        />
                        <Navbar.Offcanvas
                            id={`offcanvasNavbar-expand-${expand}`}
                            aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                        >
                            <Offcanvas.Header closeButton>
                                <Link className="logo" to="/main/">
                                    fakogram
                                </Link>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <div className="loginAvatar">
                                    <CMyAvatar />

                                    <CNickName />
                                </div>

                                <Nav className="justify-content-end flex-grow-1 pe-3">
                                    <Link className="nav" to="/profile">
                                        Profile
                                    </Link>
                                    <Link className="nav" to="aboutus">
                                        About Us
                                    </Link>
                                    <CLogoutBtn />
                                </Nav>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            ))}
        </>
    );
}

export default Header;
