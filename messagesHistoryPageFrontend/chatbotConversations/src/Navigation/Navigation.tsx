import "./Navigation.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function Navigation() {
    return (
        <div className="sidenav" id="sidenav">
            <FontAwesomeIcon icon={faBars} />
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Good convos</a></li>
                <li><a href="#">Bad convos</a></li>
            </ul>
        </div>
    );
}

export default Navigation;